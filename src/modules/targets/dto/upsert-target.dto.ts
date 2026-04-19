import { IsDateString, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertTargetDto {
  @ApiProperty({ example: 'workspace_uuid' })
  @IsString()
  workspaceId: string;

  @ApiProperty({ example: '2026-04-13' })
  @IsDateString()
  weekStartDate: string;

  @ApiProperty({ example: 50000, minimum: 0 })
  @IsNumber()
  @Min(0)
  targetSalesAmount: number;

  @ApiProperty({ example: 40, minimum: 0 })
  @IsNumber()
  @Min(0)
  targetSalesCount: number;
}