import { IsDateString, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddRefundDto {
  @ApiProperty({ example: 'workspace_uuid' })
  @IsString()
  workspaceId: string;

  @ApiProperty({ example: '2026-04-18' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 1, minimum: 0 })
  @IsNumber()
  @Min(0)
  addRefundCount: number;

  @ApiProperty({ example: 300, minimum: 0 })
  @IsNumber()
  @Min(0)
  addRefundAmount: number;
}