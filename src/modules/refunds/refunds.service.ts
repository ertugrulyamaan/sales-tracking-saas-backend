import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertRefundDto } from './dto/upsert-refund.dto';
import { AddRefundDto } from './dto/add-refund.dto';
import { QueryRefundsDto } from './dto/query-refunds.dto';

@Injectable()
export class RefundsService {
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

  async upsertDaily(userId: string, dto: UpsertRefundDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);

    const date = this.parseDateOnly(dto.date);

    return this.prisma.refundRecord.upsert({
      where: {
        workspaceId_date: {
          workspaceId: dto.workspaceId,
          date,
        },
      },
      create: {
        workspaceId: dto.workspaceId,
        date,
        refundCount: dto.refundCount,
        refundAmount: new Prisma.Decimal(dto.refundAmount),
      },
      update: {
        refundCount: dto.refundCount,
        refundAmount: new Prisma.Decimal(dto.refundAmount),
      },
    });
  }

  async addToDaily(userId: string, dto: AddRefundDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);

    const date = this.parseDateOnly(dto.date);

    const existing = await this.prisma.refundRecord.findUnique({
      where: {
        workspaceId_date: {
          workspaceId: dto.workspaceId,
          date,
        },
      },
    });

    if (!existing) {
      return this.prisma.refundRecord.create({
        data: {
          workspaceId: dto.workspaceId,
          date,
          refundCount: dto.addRefundCount,
          refundAmount: new Prisma.Decimal(dto.addRefundAmount),
        },
      });
    }

    return this.prisma.refundRecord.update({
      where: { id: existing.id },
      data: {
        refundCount: { increment: dto.addRefundCount },
        refundAmount: new Prisma.Decimal(existing.refundAmount).plus(dto.addRefundAmount),
      },
    });
  }

  async findRange(userId: string, query: QueryRefundsDto) {
    await this.assertWorkspaceOwner(query.workspaceId, userId);

    return this.prisma.refundRecord.findMany({
      where: {
        workspaceId: query.workspaceId,
        date: {
          gte: query.from ? this.parseDateOnly(query.from) : undefined,
          lte: query.to ? this.endOfDayUtc(query.to) : undefined,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const row = await this.prisma.refundRecord.findUnique({
      where: { id },
      include: { workspace: { select: { ownerId: true } } },
    });

    if (!row) throw new NotFoundException('Refund record not found');
    if (row.workspace.ownerId !== userId) throw new ForbiddenException('Access denied');

    return row;
  }
}