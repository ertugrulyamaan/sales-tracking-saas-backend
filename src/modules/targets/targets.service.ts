import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async upsertWeekly(userId: string, dto: UpsertTargetDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);

    return this.prisma.target.upsert({
      where: {
        workspaceId_weekStartDate: {
          workspaceId: dto.workspaceId,
          weekStartDate: new Date(dto.weekStartDate),
        },
      },
      create: {
        workspaceId: dto.workspaceId,
        weekStartDate: new Date(dto.weekStartDate),
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
          gte: query.fromWeekStart ? new Date(query.fromWeekStart) : undefined,
          lte: query.toWeekStart ? new Date(query.toWeekStart) : undefined,
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