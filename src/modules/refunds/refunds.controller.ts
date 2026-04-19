import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RefundsService } from './refunds.service';
import { UpsertRefundDto } from './dto/upsert-refund.dto';
import { AddRefundDto } from './dto/add-refund.dto';
import { QueryRefundsDto } from './dto/query-refunds.dto';

type AuthRequest = { user: { userId: string; email: string } };

@ApiTags('Refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @ApiOperation({ summary: 'Upsert daily refund record' })
  @Post()
  upsertDaily(@Request() req: AuthRequest, @Body() dto: UpsertRefundDto) {
    return this.refundsService.upsertDaily(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Increment daily refund values' })
  @Patch('add')
  addToDaily(@Request() req: AuthRequest, @Body() dto: AddRefundDto) {
    return this.refundsService.addToDaily(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get refund records in date range' })
  @Get()
  findRange(@Request() req: AuthRequest, @Query() query: QueryRefundsDto) {
    return this.refundsService.findRange(req.user.userId, query);
  }

  @ApiOperation({ summary: 'Get refund record by id' })
  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.refundsService.findOne(req.user.userId, id);
  }
}