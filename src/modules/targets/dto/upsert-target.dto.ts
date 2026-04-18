import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class UpsertTargetDto {
  @IsString()
  workspaceId: string;

  @IsDateString()
  weekStartDate: string;

  @IsNumber()
  @Min(0)
  targetSalesAmount: number;

  @IsNumber()
  @Min(0)
  targetSalesCount: number;
}