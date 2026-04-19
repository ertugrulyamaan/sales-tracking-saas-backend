import { IsDateString, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSaleDto {
  @ApiProperty({ example: 'workspace_uuid' })
  @IsString()
  workspaceId: string;

  @ApiProperty({ example: '2026-04-18' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2, minimum: 0 })
  @IsNumber()
  @Min(0)
  addSalesCount: number;

  @ApiProperty({ example: 3500, minimum: 0 })
  @IsNumber()
  @Min(0)
  addSalesAmount: number;
}