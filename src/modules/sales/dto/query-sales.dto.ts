import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QuerySalesDto {
  @IsString()
  workspaceId: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}