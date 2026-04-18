import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type DayBreakdown = {
  date: string;
  salesCount: number;
  salesAmount: number;
  refundCount: number;
  refundAmount: number;
  netRevenue: number;
};

@Injectable()
export class AnalyticsService {
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

  private toNumber(value: Prisma.Decimal | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    return Number(value);
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
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

  private toDateOnlyString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private getWeekRange(weekStartDate: string) {
    const start = this.parseDateOnly(weekStartDate);
    if (start.getUTCDay() !== 1) {
      throw new BadRequestException('weekStartDate must be a Monday');
    }

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
  }

  private pctChange(current: number, previous: number): number | null {
    if (previous <= 0) return null;
    return this.round2(((current - previous) / previous) * 100);
  }

  private buildInsightLines(current: {
    totalSalesAmount: number;
    totalRefundAmount: number;
    netRevenue: number;
  }, previous: {
    totalSalesAmount: number;
    totalRefundAmount: number;
    netRevenue: number;
  }) {
    const lines: string[] = [];

    const salesPct = this.pctChange(current.totalSalesAmount, previous.totalSalesAmount);
    if (salesPct !== null) {
      const pct = salesPct;
      lines.push(`Sales ${pct >= 0 ? 'increased' : 'decreased'} by ${Math.abs(pct).toFixed(1)}% vs last week`);
    } else if (current.totalSalesAmount > 0 && previous.totalSalesAmount === 0) {
      lines.push('Sales started generating this week (last week was zero)');
    }

    const refundPct = this.pctChange(current.totalRefundAmount, previous.totalRefundAmount);
    if (refundPct !== null) {
      const pct = refundPct;
      lines.push(`Refunds ${pct >= 0 ? 'increased' : 'decreased'} by ${Math.abs(pct).toFixed(1)}% vs last week`);
    } else if (current.totalRefundAmount > 0 && previous.totalRefundAmount === 0) {
      lines.push('Refunds appeared this week (last week was zero)');
    }

    const netPct = this.pctChange(current.netRevenue, previous.netRevenue);
    if (netPct !== null) {
      const pct = netPct;
      lines.push(`Net revenue ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct).toFixed(1)}% vs last week`);
    } else if (current.netRevenue > 0 && previous.netRevenue <= 0) {
      lines.push('Net revenue became positive this week');
    }

    return lines;
  }

  async getWeeklySummary(userId: string, workspaceId: string, weekStartDate: string) {
    await this.assertWorkspaceOwner(workspaceId, userId);

    const { start, end } = this.getWeekRange(weekStartDate);

    const previousStart = new Date(start);
    previousStart.setUTCDate(previousStart.getUTCDate() - 7);
    const previousEnd = new Date(end);
    previousEnd.setUTCDate(previousEnd.getUTCDate() - 7);

    const [salesRows, refundRows, previousSalesRows, previousRefundRows, targetRow] =
      await Promise.all([
        this.prisma.saleRecord.findMany({
          where: { workspaceId, date: { gte: start, lte: end } },
          orderBy: { date: 'asc' },
        }),
        this.prisma.refundRecord.findMany({
          where: { workspaceId, date: { gte: start, lte: end } },
          orderBy: { date: 'asc' },
        }),
        this.prisma.saleRecord.findMany({
          where: { workspaceId, date: { gte: previousStart, lte: previousEnd } },
        }),
        this.prisma.refundRecord.findMany({
          where: { workspaceId, date: { gte: previousStart, lte: previousEnd } },
        }),
        this.prisma.target.findUnique({
          where: {
            workspaceId_weekStartDate: {
              workspaceId,
              weekStartDate: start,
            },
          },
        }),
      ]);

    const salesByDate = new Map<string, { salesCount: number; salesAmount: number }>();
    for (const row of salesRows) {
      const key = this.toDateOnlyString(row.date);
      salesByDate.set(key, {
        salesCount: row.salesCount,
        salesAmount: this.toNumber(row.salesAmount),
      });
    }

    const refundsByDate = new Map<string, { refundCount: number; refundAmount: number }>();
    for (const row of refundRows) {
      const key = this.toDateOnlyString(row.date);
      refundsByDate.set(key, {
        refundCount: row.refundCount,
        refundAmount: this.toNumber(row.refundAmount),
      });
    }

    const breakdown: DayBreakdown[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + i);
      const key = this.toDateOnlyString(day);

      const s = salesByDate.get(key) ?? { salesCount: 0, salesAmount: 0 };
      const r = refundsByDate.get(key) ?? { refundCount: 0, refundAmount: 0 };

      breakdown.push({
        date: key,
        salesCount: s.salesCount,
        salesAmount: this.round2(s.salesAmount),
        refundCount: r.refundCount,
        refundAmount: this.round2(r.refundAmount),
        netRevenue: this.round2(s.salesAmount - r.refundAmount),
      });
    }

    const totalSalesCount = breakdown.reduce((acc, d) => acc + d.salesCount, 0);
    const totalSalesAmount = this.round2(
      breakdown.reduce((acc, d) => acc + d.salesAmount, 0),
    );
    const totalRefundCount = breakdown.reduce((acc, d) => acc + d.refundCount, 0);
    const totalRefundAmount = this.round2(
      breakdown.reduce((acc, d) => acc + d.refundAmount, 0),
    );
    const netRevenue = this.round2(totalSalesAmount - totalRefundAmount);

    const bestDay = [...breakdown].sort((a, b) => b.netRevenue - a.netRevenue)[0] ?? null;
    const worstDay = [...breakdown].sort((a, b) => a.netRevenue - b.netRevenue)[0] ?? null;

    const prevSalesAmount = this.round2(
      previousSalesRows.reduce((acc, r) => acc + this.toNumber(r.salesAmount), 0),
    );
    const prevRefundAmount = this.round2(
      previousRefundRows.reduce((acc, r) => acc + this.toNumber(r.refundAmount), 0),
    );
    const prevNetRevenue = this.round2(prevSalesAmount - prevRefundAmount);

    const weekOverWeek = {
      salesAmountDiff: this.round2(totalSalesAmount - prevSalesAmount),
      refundAmountDiff: this.round2(totalRefundAmount - prevRefundAmount),
      netRevenueDiff: this.round2(netRevenue - prevNetRevenue),
      salesAmountChangePct: this.pctChange(totalSalesAmount, prevSalesAmount),
      refundAmountChangePct: this.pctChange(totalRefundAmount, prevRefundAmount),
      netRevenueChangePct: this.pctChange(netRevenue, prevNetRevenue),
    };

    const targetSalesAmount = targetRow ? this.toNumber(targetRow.targetSalesAmount) : null;
    const targetSalesCount = targetRow ? targetRow.targetSalesCount : null;

    const targetProgress = {
      amount:
        targetSalesAmount && targetSalesAmount > 0
          ? totalSalesAmount / targetSalesAmount
          : null,
      count:
        targetSalesCount && targetSalesCount > 0
          ? totalSalesCount / targetSalesCount
          : null,
    };

    const insightLines = this.buildInsightLines(
      { totalSalesAmount, totalRefundAmount, netRevenue },
      { totalSalesAmount: prevSalesAmount, totalRefundAmount: prevRefundAmount, netRevenue: prevNetRevenue },
    );

    return {
      workspaceId,
      weekStartDate: this.toDateOnlyString(start),
      weekEndDate: this.toDateOnlyString(end),
      totals: {
        totalSalesCount,
        totalSalesAmount,
        totalRefundCount,
        totalRefundAmount,
        netRevenue,
      },
      bestDay,
      worstDay,
      target: {
        targetSalesAmount,
        targetSalesCount,
        targetProgress,
      },
      weekOverWeek,
      dailyBreakdown: breakdown,
      insights: insightLines,
    };
  }
}