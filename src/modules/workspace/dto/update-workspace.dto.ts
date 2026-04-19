import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ example: 'Updated Workspace', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}