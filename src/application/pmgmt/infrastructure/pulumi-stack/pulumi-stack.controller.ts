import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {PulumiStackService} from './pulumi-stack.service';
import {
  PulumiStackState,
  PulumiStackType,
  ProjectEnvironmentType,
  Prisma,
  PulumiStack,
} from '@prisma/client';

@ApiTags('[Application] Project Management / Infrastructure / Pulumi Stack')
@ApiBearerAuth()
@Controller('project-management')
export class PulumiStackController {
  private stackService = new PulumiStackService();

  @Get('pulumi-stacks/types')
  async listStackTypes() {
    return Object.values(PulumiStackType);
  }

  @Get('pulumi-stacks/:type/params')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: PulumiStackType.AWS_S3,
  })
  async getStackParams(@Param('type') type: PulumiStackType) {
    return this.stackService.getStackParams(type);
  }

  @Post('pulumi-stacks')
  @ApiBody({
    description: 'Create pulumi stack.',
    examples: {
      a: {
        summary: '1. HIPAA network stack',
        value: {
          projectId: '5a91888b-0b60-49ac-9a32-493f21bd5545',
          type: PulumiStackType.NETWORK_HIPAA,
          params: {
            SNSAlarmEmail: 'henry@inceptionpad.com',
          },
          environment: ProjectEnvironmentType.DEVELOPMENT,
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          projectId: '5a91888b-0b60-49ac-9a32-493f21bd5545',
          type: PulumiStackType.AWS_RDS,
          params: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
          environment: ProjectEnvironmentType.DEVELOPMENT,
        },
      },
    },
  })
  async createStack(
    @Body()
    body: Prisma.PulumiStackUncheckedCreateInput
  ): Promise<PulumiStack> {
    return await this.stackService.create({data: body});
  }

  @Get('pulumi-stacks')
  async getStacks(): Promise<PulumiStack[]> {
    return await this.stackService.findMany({});
  }

  @Get('pulumi-stacks/:stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async getStack(
    @Param('stackId') stackId: string
  ): Promise<PulumiStack | null> {
    return await this.stackService.findUnique({where: {id: stackId}});
  }

  @Patch('pulumi-stacks/:stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  @ApiBody({
    description: 'Update pulumi stack.',
    examples: {
      a: {
        summary: '1. AWS VPC stack',
        value: {
          params: {
            vpcName: 'pulumi-test-vpc-modified',
            vpcCidrBlock: '10.21.0.0/16',
          },
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          params: {
            instanceName: 'postgres-default-modified',
            instanceClass: 'db.t3.small',
          },
        },
      },
    },
  })
  async updateStack(
    @Param('stackId') stackId: string,
    @Body()
    body: Prisma.PulumiStackUpdateInput
  ): Promise<PulumiStack> {
    return await this.stackService.update({
      where: {id: stackId},
      data: body,
    });
  }

  @Delete('pulumi-stacks/:stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteStack(
    @Param('stackId')
    stackId: string
  ): Promise<PulumiStack | {err: {message: string}}> {
    // [step 1] Get the cloudformation stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      return {err: {message: 'Invalid stackId.'}};
    }
    if (
      stack.state === PulumiStackState.PREPARING ||
      stack.state === PulumiStackState.DESTROY_SUCCEEDED
    ) {
      return await this.stackService.delete({where: {id: stackId}});
    } else {
      return {
        err: {message: 'The stack can not be deleted before destroying.'},
      };
    }
  }

  /**
   * Create stack resources.
   *
   * @param {string} stackId
   * @returns
   * @memberof PulumiStackController
   */
  @Post('pulumi-stacks/:stackId/create-resources')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async createResources(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
      include: {project: true},
    });
    if (!stack) {
      return {err: {message: 'Invalid stackId.'}};
    }

    // [step 2] Check stack parameters.
    if (
      false ===
      this.stackService.checkStackParams(stack.type, stack.params as object)
    ) {
      return {err: {message: 'Checking stack parameters failed.'}};
    }

    // [step 3] Create stack resources.
    if (
      stack.state === PulumiStackState.PREPARING ||
      stack.state === PulumiStackState.DESTROY_SUCCEEDED
    ) {
      return await this.stackService.createResources(stack);
    } else {
      return {err: {message: 'Please check the pulumi status.'}};
    }
  }

  /**
   * Destroy stack resources.
   *
   * @param {string} stackId
   * @returns
   * @memberof PulumiStackController
   */
  @Post('pulumi-stacks/:stackId/destroy-resources')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyResources(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid stackId.'},
      };
    }

    // [step 2] Destroy the pulumi stack.
    if (
      stack.state === PulumiStackState.BUILD_FAILED ||
      stack.state === PulumiStackState.BUILD_SUCCEEDED
    ) {
      return await this.stackService.destroyResources(stack);
    } else {
      return {
        err: {message: 'The stack resources have not been created.'},
      };
    }
  }

  /**
   * Force remove a stack from Pulumi.
   *
   * @param {string} stackId
   * @returns
   * @memberof PulumiStackController
   */
  @Post('pulumi-stacks/:stackId/force-delete-on-pulumi')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'a143f94d-8698-4fc5-bd9c-45a3d965a08b',
  })
  async forceDeleteOnPulumi(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the pulumi stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid stackId.'},
      };
    }

    // [step 2] Destroy the pulumi stack.
    try {
      await this.stackService.destroyResources(stack);
    } catch (error) {
      // Do nothing
      console.log('Exception for destroying pulumi stack [', stack.name, ']');
    }

    // [step 3] Force delete the pulumi stack.
    return await this.stackService.forceDeleteOnPulumi(stack);
  }

  /* End */
}
