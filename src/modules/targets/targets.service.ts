import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertTargetDto } from './dto/upsert-target.dto';
import { QueryTargetsDto } from './dto/query-targets.dto';

@Injectable()
export class TargetsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertWorkspaceOwner(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: userId },
      select: { id: true },
    });

    if (!workspace) {
      throw new ForbiddenException('Workspace access denied');
    }
  }

  private parseDateOnly(dateStr: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!match) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    if (
      utcDate.getUTCFullYear() !== year ||
      utcDate.getUTCMonth() !== month - 1 ||
      utcDate.getUTCDate() !== day
    ) {
      throw new BadRequestException('Invalid calendar date');
    }

    return utcDate;
  }

  private endOfDayUtc(dateStr: string): Date {
    const d = this.parseDateOnly(dateStr);
    d.setUTCHours(23, 59, 59, 999);
    return d;
  }

  async upsertWeekly(userId: string, dto: UpsertTargetDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);

    const weekStartDate = this.parseDateOnly(dto.weekStartDate);

    return this.prisma.target.upsert({
      where: {
        workspaceId_weekStartDate: {
          workspaceId: dto.workspaceId,
          weekStartDate,
        },
      },
      create: {
        workspaceId: dto.workspaceId,
        weekStartDate,
        targetSalesAmount: new Prisma.Decimal(dto.targetSalesAmount),
        targetSalesCount: dto.targetSalesCount,
      },
      update: {
        targetSalesAmount: new Prisma.Decimal(dto.targetSalesAmount),
        targetSalesCount: dto.targetSalesCount,
      },
    });
  }

  async findRange(userId: string, query: QueryTargetsDto) {
    await this.assertWorkspaceOwner(query.workspaceId, userId);

    return this.prisma.target.findMany({
      where: {
        workspaceId: query.workspaceId,
        weekStartDate: {
          gte: query.fromWeekStart ? this.parseDateOnly(query.fromWeekStart) : undefined,
          lte: query.toWeekStart ? this.endOfDayUtc(query.toWeekStart) : undefined,
        },
      },
      orderBy: { weekStartDate: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const row = await this.prisma.target.findUnique({
      where: { id },
      include: { workspace: { select: { ownerId: true } } },
    });

    if (!row) throw new NotFoundException('Target not found');
    if (row.workspace.ownerId !== userId) throw new ForbiddenException('Access denied');

    return row;
  }
}