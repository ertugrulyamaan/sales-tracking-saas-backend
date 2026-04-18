import { IsString, Matches } from 'class-validator';

export class WeeklySummaryDto {
  @IsString()
  workspaceId: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'weekStartDate must be in YYYY-MM-DD format',
  })
  weekStartDate: string;
}