import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalesService } from './sales.service';
import { UpsertSaleDto } from './dto/upsert-sales.dto';
import { AddSaleDto } from './dto/add-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';

type AuthRequest = { user: { userId: string; email: string } };

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  upsertDaily(@Request() req: AuthRequest, @Body() dto: UpsertSaleDto) {
    return this.salesService.upsertDaily(req.user.userId, dto);
  }

  @Patch('add')
  addToDaily(@Request() req: AuthRequest, @Body() dto: AddSaleDto) {
    return this.salesService.addToDaily(req.user.userId, dto);
  }

  @Get()
  findRange(@Request() req: AuthRequest, @Query() query: QuerySalesDto) {
    return this.salesService.findRange(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.salesService.findOne(req.user.userId, id);
  }
}