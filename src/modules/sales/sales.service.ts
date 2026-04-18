import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertSaleDto } from './dto/upsert-sales.dto';
import { AddSaleDto } from './dto/add-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';

@Injectable()
export class SalesService {
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

  async upsertDaily(userId: string, dto: UpsertSaleDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);

    const date = this.parseDateOnly(dto.date);

    return this.prisma.saleRecord.upsert({
      where: {
        workspaceId_date: {
          workspaceId: dto.workspaceId,
          date,
        },
      },
      create: {
        workspaceId: dto.workspaceId,
        date,
        salesCount: dto.salesCount,
        salesAmount: new Prisma.Decimal(dto.salesAmount),
      },
      update: {
        salesCount: dto.salesCount,
        salesAmount: new Prisma.Decimal(dto.salesAmount),
      },
    });
  }

  async addToDaily(userId: string, dto: AddSaleDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);

    const date = this.parseDateOnly(dto.date);

    const existing = await this.prisma.saleRecord.findUnique({
      where: {
        workspaceId_date: {
          workspaceId: dto.workspaceId,
          date,
        },
      },
    });

    if (!existing) {
      return this.prisma.saleRecord.create({
        data: {
          workspaceId: dto.workspaceId,
          date,
          salesCount: dto.addSalesCount,
          salesAmount: new Prisma.Decimal(dto.addSalesAmount),
        },
      });
    }

    return this.prisma.saleRecord.update({
      where: { id: existing.id },
      data: {
        salesCount: { increment: dto.addSalesCount },
        salesAmount: new Prisma.Decimal(existing.salesAmount).plus(dto.addSalesAmount),
      },
    });
  }

  async findRange(userId: string, query: QuerySalesDto) {
    await this.assertWorkspaceOwner(query.workspaceId, userId);

    return this.prisma.saleRecord.findMany({
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
    const row = await this.prisma.saleRecord.findUnique({
      where: { id },
      include: { workspace: { select: { ownerId: true } } },
    });

    if (!row) throw new NotFoundException('Sale record not found');
    if (row.workspace.ownerId !== userId) throw new ForbiddenException('Access denied');

    return row;
  }
}