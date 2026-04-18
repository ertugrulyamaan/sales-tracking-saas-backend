import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { WeeklySummaryDto } from './dto/weekly-summary.dto';

type AuthRequest = { user: { userId: string; email: string } };

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly-summary')
  getWeeklySummary(@Request() req: AuthRequest, @Query() query: WeeklySummaryDto) {
    return this.analyticsService.getWeeklySummary(
      req.user.userId,
      query.workspaceId,
      query.weekStartDate,
    );
  }
}