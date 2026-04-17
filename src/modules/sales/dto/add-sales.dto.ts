import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class AddSaleDto {
  @IsString()
  workspaceId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  addSalesCount: number;

  @IsNumber()
  @Min(0)
  addSalesAmount: number;
}