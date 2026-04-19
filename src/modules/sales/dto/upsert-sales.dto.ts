import { IsDateString, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertSaleDto {
  @ApiProperty({ example: 'workspace_uuid' })
  @IsString()
  workspaceId: string;

  @ApiProperty({ example: '2026-04-18' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 18, minimum: 0 })
  @IsNumber()
  @Min(0)
  salesCount: number;

  @ApiProperty({ example: 24500, minimum: 0 })
  @IsNumber()
  @Min(0)
  salesAmount: number;
}