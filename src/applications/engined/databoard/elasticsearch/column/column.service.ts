import {Injectable} from '@nestjs/common';
import {Prisma, ElasticsearchDataboardColumn} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class ElasticsearchDataboardColumnService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ElasticsearchDataboardColumnFindUniqueArgs
  ): Promise<ElasticsearchDataboardColumn | null> {
    return await this.prisma.elasticsearchDataboardColumn.findUnique(params);
  }

  async findMany(
    params: Prisma.ElasticsearchDataboardColumnFindManyArgs
  ): Promise<ElasticsearchDataboardColumn[]> {
    return await this.prisma.elasticsearchDataboardColumn.findMany(params);
  }

  async create(
    params: Prisma.ElasticsearchDataboardColumnCreateArgs
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.prisma.elasticsearchDataboardColumn.create(params);
  }

  async createMany(
    params: Prisma.ElasticsearchDataboardColumnCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.elasticsearchDataboardColumn.createMany(params);
  }

  async update(
    params: Prisma.ElasticsearchDataboardColumnUpdateArgs
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.prisma.elasticsearchDataboardColumn.update(params);
  }

  async delete(
    params: Prisma.ElasticsearchDataboardColumnDeleteArgs
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.prisma.elasticsearchDataboardColumn.delete(params);
  }

  async deleteMany(
    params: Prisma.ElasticsearchDataboardColumnDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.elasticsearchDataboardColumn.deleteMany(params);
  }

  /* End */
}
