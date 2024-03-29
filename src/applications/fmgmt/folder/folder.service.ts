import {Injectable} from '@nestjs/common';
import {Prisma, Folder} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';

@Injectable()
export class FolderService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.FolderFindUniqueArgs
  ): Promise<Folder | null> {
    return await this.prisma.folder.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.FolderFindUniqueOrThrowArgs
  ): Promise<Folder> {
    return await this.prisma.folder.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.FolderFindManyArgs): Promise<Folder[]> {
    return await this.prisma.folder.findMany(params);
  }

  async create(params: Prisma.FolderCreateArgs): Promise<Folder> {
    return await this.prisma.folder.create(params);
  }

  async update(params: Prisma.FolderUpdateArgs): Promise<Folder> {
    return await this.prisma.folder.update(params);
  }

  async delete(params: Prisma.FolderDeleteArgs): Promise<Folder> {
    return await this.prisma.folder.delete(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.folder.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
