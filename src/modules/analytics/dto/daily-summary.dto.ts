import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DailySummaryDto {
  @ApiProperty({ example: 'workspace_uuid' })
  @IsString()
  workspaceId: string;

  @ApiProperty({ example: '2026-04-18' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;
}
