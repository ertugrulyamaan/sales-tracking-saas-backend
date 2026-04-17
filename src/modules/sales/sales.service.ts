import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async upsertDaily(userId: string, dto: UpsertSaleDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);

    return this.prisma.saleRecord.upsert({
      where: {
        workspaceId_date: {
          workspaceId: dto.workspaceId,
          date: new Date(dto.date),
        },
      },
      create: {
        workspaceId: dto.workspaceId,
        date: new Date(dto.date),
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

    const existing = await this.prisma.saleRecord.findUnique({
      where: {
        workspaceId_date: {
          workspaceId: dto.workspaceId,
          date: new Date(dto.date),
        },
      },
    });

    if (!existing) {
      return this.prisma.saleRecord.create({
        data: {
          workspaceId: dto.workspaceId,
          date: new Date(dto.date),
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
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
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