import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TargetsService } from './targets.service';
import { UpsertTargetDto } from './dto/upsert-target.dto';
import { QueryTargetsDto } from './dto/query-targets.dto';

type AuthRequest = { user: { userId: string; email: string } };

@UseGuards(JwtAuthGuard)
@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @Post()
  upsertWeekly(@Request() req: AuthRequest, @Body() dto: UpsertTargetDto) {
    return this.targetsService.upsertWeekly(req.user.userId, dto);
  }

  @Get()
  findRange(@Request() req: AuthRequest, @Query() query: QueryTargetsDto) {
    return this.targetsService.findRange(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.targetsService.findOne(req.user.userId, id);
  }
}