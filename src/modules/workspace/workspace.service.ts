import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        ownerId,
      },
    });
  }

  findAllByOwner(ownerId: string) {
    return this.prisma.workspace.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOneByIdForOwner(id: string, ownerId: string) {
    return this.prisma.workspace.findFirst({
      where: { id, ownerId },
    });
  }

  async updateName(id: string, ownerId: string, dto: UpdateWorkspaceDto) {
    const existing = await this.findOneByIdForOwner(id, ownerId);
    if (!existing) return null;

    return this.prisma.workspace.update({
      where: { id },
      data: { name: dto.name },
    });
  }
}