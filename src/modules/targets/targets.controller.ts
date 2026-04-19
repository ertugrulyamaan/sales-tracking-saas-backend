import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TargetsService } from './targets.service';
import { UpsertTargetDto } from './dto/upsert-target.dto';
import { QueryTargetsDto } from './dto/query-targets.dto';

type AuthRequest = { user: { userId: string; email: string } };

@ApiTags('Targets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @ApiOperation({ summary: 'Upsert weekly sales target' })
  @Post()
  upsertWeekly(@Request() req: AuthRequest, @Body() dto: UpsertTargetDto) {
    return this.targetsService.upsertWeekly(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get targets in weekStartDate range' })
  @Get()
  findRange(@Request() req: AuthRequest, @Query() query: QueryTargetsDto) {
    return this.targetsService.findRange(req.user.userId, query);
  }

  @ApiOperation({ summary: 'Get target by id' })
  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.targetsService.findOne(req.user.userId, id);
  }
}