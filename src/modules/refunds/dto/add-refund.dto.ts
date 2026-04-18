import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class AddRefundDto {
  @IsString()
  workspaceId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  addRefundCount: number;

  @IsNumber()
  @Min(0)
  addRefundAmount: number;
}