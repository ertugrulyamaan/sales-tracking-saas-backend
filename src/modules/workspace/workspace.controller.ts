import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { WorkspaceService } from './workspace.service';
  import { CreateWorkspaceDto } from './dto/create-workspace.dto';
  import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
  
  type AuthRequest = { user: { userId: string; email: string } };
  
  @UseGuards(JwtAuthGuard)
  @Controller('workspaces')
  export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}
  
    @Post()
    create(@Request() req: AuthRequest, @Body() dto: CreateWorkspaceDto) {
      return this.workspaceService.create(req.user.userId, dto);
    }
  
    @Get()
    findMine(@Request() req: AuthRequest) {
      return this.workspaceService.findAllByOwner(req.user.userId);
    }
  
    @Get(':id')
    async findOne(@Request() req: AuthRequest, @Param('id') id: string) {
      const workspace = await this.workspaceService.findOneByIdForOwner(
        id,
        req.user.userId,
      );
      if (!workspace) throw new NotFoundException('Workspace not found');
      return workspace;
    }
  
    @Patch(':id')
    async update(
      @Request() req: AuthRequest,
      @Param('id') id: string,
      @Body() dto: UpdateWorkspaceDto,
    ) {
      const workspace = await this.workspaceService.updateName(
        id,
        req.user.userId,
        dto,
      );
      if (!workspace) throw new NotFoundException('Workspace not found');
      return workspace;
    }
  }