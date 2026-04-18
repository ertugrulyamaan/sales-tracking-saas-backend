import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RefundsService } from './refunds.service';
import { UpsertRefundDto } from './dto/upsert-refund.dto';
import { AddRefundDto } from './dto/add-refund.dto';
import { QueryRefundsDto } from './dto/query-refunds.dto';

type AuthRequest = { user: { userId: string; email: string } };

@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  upsertDaily(@Request() req: AuthRequest, @Body() dto: UpsertRefundDto) {
    return this.refundsService.upsertDaily(req.user.userId, dto);
  }

  @Patch('add')
  addToDaily(@Request() req: AuthRequest, @Body() dto: AddRefundDto) {
    return this.refundsService.addToDaily(req.user.userId, dto);
  }

  @Get()
  findRange(@Request() req: AuthRequest, @Query() query: QueryRefundsDto) {
    return this.refundsService.findRange(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.refundsService.findOne(req.user.userId, id);
  }
}