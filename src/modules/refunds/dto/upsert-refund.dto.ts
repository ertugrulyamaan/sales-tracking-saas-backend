import { IsDateString, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertRefundDto {
  @ApiProperty({ example: 'workspace_uuid' })
  @IsString()
  workspaceId: string;

  @ApiProperty({ example: '2026-04-18' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2, minimum: 0 })
  @IsNumber()
  @Min(0)
  refundCount: number;

  @ApiProperty({ example: 1200, minimum: 0 })
  @IsNumber()
  @Min(0)
  refundAmount: number;
}