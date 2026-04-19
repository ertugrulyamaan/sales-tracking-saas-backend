import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'My Workspace', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;
}