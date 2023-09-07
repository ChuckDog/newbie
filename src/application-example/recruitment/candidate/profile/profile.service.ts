import {Injectable} from '@nestjs/common';
import {Prisma, CandidateProfile} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class CandidateProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.CandidateProfileFindUniqueArgs
  ): Promise<CandidateProfile | null> {
    return await this.prisma.candidateProfile.findUnique(params);
  }

  async findMany(
    params: Prisma.CandidateProfileFindManyArgs
  ): Promise<CandidateProfile[]> {
    return await this.prisma.candidateProfile.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.CandidateProfileFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.CandidateProfile,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.CandidateProfileCreateArgs
  ): Promise<CandidateProfile> {
    return await this.prisma.candidateProfile.create(params);
  }

  async update(
    params: Prisma.CandidateProfileUpdateArgs
  ): Promise<CandidateProfile> {
    return await this.prisma.candidateProfile.update(params);
  }

  async delete(
    params: Prisma.CandidateProfileDeleteArgs
  ): Promise<CandidateProfile> {
    return await this.prisma.candidateProfile.delete(params);
  }

  /* End */
}
