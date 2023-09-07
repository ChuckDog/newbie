import {Injectable} from '@nestjs/common';
import {Prisma, JobApplication} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.JobApplicationFindUniqueArgs
  ): Promise<JobApplication | null> {
    return await this.prisma.jobApplication.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationFindUniqueOrThrowArgs
  ): Promise<JobApplication> {
    return await this.prisma.jobApplication.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.JobApplicationFindManyArgs
  ): Promise<JobApplication[]> {
    return await this.prisma.jobApplication.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.JobApplicationFindManyArgs,
    pagination: {
      page?: number;
      pageSize?: number;
    }
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.JobApplication,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.JobApplicationCreateArgs
  ): Promise<JobApplication> {
    return await this.prisma.jobApplication.create(params);
  }

  async update(
    params: Prisma.JobApplicationUpdateArgs
  ): Promise<JobApplication> {
    return await this.prisma.jobApplication.update(params);
  }

  async delete(
    params: Prisma.JobApplicationDeleteArgs
  ): Promise<JobApplication> {
    return await this.prisma.jobApplication.delete(params);
  }

  async count(params: Prisma.JobApplicationCountArgs): Promise<number> {
    return await this.prisma.jobApplication.count(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.jobApplication.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
