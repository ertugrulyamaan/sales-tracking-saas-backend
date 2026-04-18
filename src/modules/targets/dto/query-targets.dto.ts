import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryTargetsDto {
  @IsString()
  workspaceId: string;

  @IsOptional()
  @IsDateString()
  fromWeekStart?: string;

  @IsOptional()
  @IsDateString()
  toWeekStart?: string;
}
