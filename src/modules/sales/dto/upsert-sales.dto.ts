import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class UpsertSaleDto {
  @IsString()
  workspaceId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  salesCount: number;

  @IsNumber()
  @Min(0)
  salesAmount: number;
}