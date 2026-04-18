import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class UpsertRefundDto {
  @IsString()
  workspaceId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  refundCount: number;

  @IsNumber()
  @Min(0)
  refundAmount: number;
}