import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { WeeklySummaryDto } from './dto/weekly-summary.dto';
import { DailySummaryDto } from './dto/daily-summary.dto';

type AuthRequest = { user: { userId: string; email: string } };

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get day-over-day summary for a date' })
  @Get('daily-summary')
  getDailySummary(@Request() req: AuthRequest, @Query() query: DailySummaryDto) {
    return this.analyticsService.getDailySummary(
      req.user.userId,
      query.workspaceId,
      query.date,
    );
  }

  @ApiOperation({ summary: 'Get weekly summary with WoW insights' })
  @Get('weekly-summary')
  getWeeklySummary(@Request() req: AuthRequest, @Query() query: WeeklySummaryDto) {
    return this.analyticsService.getWeeklySummary(
      req.user.userId,
      query.workspaceId,
      query.weekStartDate,
    );
  }
}