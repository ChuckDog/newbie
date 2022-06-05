import {Injectable} from '@nestjs/common';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  PulumiFn,
  UpResult,
} from '@pulumi/pulumi/automation';
import {InfrastructureStackType} from '@prisma/client';
import {CommonConfig} from 'src/_config/_common.config';
import axios from 'axios';
import {AwsCodecommit_StackService} from './_stack/aws.codecommit.service';
import {AwsEcr_StackService} from './_stack/aws.ecr.service';
import {AwsEcs_StackService} from './_stack/aws.ecs.service';
import {AwsEcsInVpc_StackService} from './_stack/aws.ecs-in-vpc.service';
import {AwsIamUser_StackService} from './_stack/aws.iam-user.service';
import {AwsRds_StackService} from './_stack/aws.rds.service';
import {AwsS3_StackService} from './_stack/aws.s3.service';
import {AwsSqs_StackService} from './_stack/aws.sqs.service copy';
import {AwsVpc_StackService} from './_stack/aws.vpc.service';
import {AwsVpcHipaa_StackService} from './_stack/aws.vpc-hipaa.service';
import {AwsWaf_StackService} from './_stack/aws.waf.service';

@Injectable()
export class PulumiService {
  public awsRegion = CommonConfig.getRegion();
  private pulumiAwsVersion = CommonConfig.getPulumiAwsVersion();

  /**
   * Start a stack.
   *
   * The return structure of stack.up() is like below:
      {
        "stdout": "Updating (development)\n\nView Live: https://app.pulumi.com/worldzhy/PINPOINT_HEALTH.FileManager/development/updates/1\n\n\n +  pulumi:pulumi:Stack PINPOINT_HEALTH.FileManager-development creating \n +  aws:s3:Bucket file-manager-bucket creating \n +  aws:s3:Bucket file-manager-bucket created \n +  aws:s3:BucketPolicy bucketPolicy creating \n +  aws:s3:BucketPolicy bucketPolicy created \n +  pulumi:pulumi:Stack PINPOINT_HEALTH.FileManager-development created \n \nResources:\n    + 3 created\n\nDuration: 6s\n\n",
        "stderr": "",
        "summary": {
          "version": 1,
          "kind": "update",
          "startTime": "2022-05-19T06:23:58.000Z",
          "message": "",
          "environment": {
            "exec.kind": "auto.inline"
          },
          "config": {
            "aws:region": {
              "value": "cn-northwest-1",
              "secret": false
            }
          },
          "result": "succeeded",
          "endTime": "2022-05-19T06:24:04.000Z",
          "resourceChanges": {
            "create": 3
          }
        },
        "outputs": {}
      }
   *
   * @returns
   * @memberof PulumiService
   */
  async createStack(
    projectName: string,
    stackName: string,
    stackType: InfrastructureStackType,
    stackParams: any
  ): Promise<UpResult | undefined> {
    // [step 1] Get Pulumi stack program.
    const program: PulumiFn | undefined = this.getStackProgramByType(
      stackType,
      stackParams
    );

    // [step 2] Create the stack.
    if (program === undefined) {
      return undefined;
    }
    const args: InlineProgramArgs = {
      projectName,
      stackName,
      program,
    };

    const stack = await LocalWorkspace.createStack(args);
    await stack.workspace.installPlugin('aws', this.pulumiAwsVersion);
    await stack.setConfig('aws:region', {value: this.awsRegion});
    return await stack.up({onOutput: console.log}); // pulumiStackResult.summary.result is one of ['failed', 'in-progress', 'not-started', 'succeeded']
  }

  /**
   * Destroy a stack.
   *
   * @param {string} projectName
   * @param {string} stackName
   * @param {InfrastructureStackType} stackType
   * @param {*} stackParams
   * @returns {(Promise<DestroyResult | undefined>)}
   * @memberof PulumiService
   */
  async destroyStack(
    projectName: string,
    stackName: string,
    stackType: InfrastructureStackType,
    stackParams: any
  ): Promise<DestroyResult | undefined> {
    // [step 1] Get Pulumi stack program.
    const program: PulumiFn | undefined = this.getStackProgramByType(
      stackType,
      stackParams
    );

    // [step 2] Destroy the stack.
    if (program === undefined) {
      return undefined;
    }
    const args: InlineProgramArgs = {
      projectName,
      stackName,
      program,
    };

    const stack = await LocalWorkspace.selectStack(args);
    return await stack.destroy({onOutput: console.log});
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#delete-stack
   *
   * @param {string} pulumiOrgName
   * @param {string} stackType
   * @param {string} stackName
   * @returns
   * @memberof PulumiService
   */
  async deleteStack(
    projectName: string,
    stackName: string,
    stackType: InfrastructureStackType
  ) {
    if (null === this.getStackProgramByType(stackType, {})) {
      return {err: {message: 'Invalid stack type.'}};
    }

    const url = `https://api.pulumi.com/api/stacks/worldzhy/${projectName}/${stackName}`;
    try {
      const response = await axios.delete(url, {
        maxRedirects: 5,
        headers: {
          Accept: 'application/vnd.pulumi+8',
          'Content-Type': 'application/json',
          Authorization: 'token ' + CommonConfig.getPulumiAccessToken(),
        },
      });

      return {
        status: response.status,
        statusText: response.statusText,
        config: response.config,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
      } else {
        console.error(error);
      }
    }
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#list-stacks
   *
   * @returns
   * @memberof PulumiService
   */
  async getStacks(projectName: string) {
    const url = `https://api.pulumi.com/api/user/stacks?project=${projectName}`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + CommonConfig.getPulumiAccessToken(),
      },
    });
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#get-stack
   * @param {string} orgName
   * @param {string} projectName
   * @param {string} stackName
   * @returns
   * @memberof PulumiService
   */
  async getStack(orgName: string, projectName: string, stackName: string) {
    const url = `https://api.pulumi.com/api/stacks/${orgName}/${projectName}/${stackName}`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + CommonConfig.getPulumiAccessToken(),
      },
    });
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#get-stack-state
   *
   * @param {string} orgName
   * @param {string} projectName
   * @param {string} stackName
   * @returns
   * @memberof PulumiService
   */
  async getStackState(orgName: string, projectName: string, stackName: string) {
    const url = `https://api.pulumi.com/api/stacks/${orgName}/${projectName}/${stackName}/export`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + CommonConfig.getPulumiAccessToken(),
      },
    });
  }

  /**
   * Get stack class
   *
   * @param {InfrastructureStackType} type
   * @returns
   * @memberof InfrastructureStackService
   */
  private getStackServiceByType(type: InfrastructureStackType) {
    switch (type) {
      case InfrastructureStackType.AWS_CODE_COMMIT:
        return AwsCodecommit_StackService;
      case InfrastructureStackType.AWS_ECR:
        return AwsEcr_StackService;
      case InfrastructureStackType.AWS_ECS:
        return AwsEcs_StackService;
      case InfrastructureStackType.AWS_ECS_IN_VPC:
        return AwsEcsInVpc_StackService;
      case InfrastructureStackType.AWS_EKS:
        return AwsEcs_StackService;
      case InfrastructureStackType.AWS_IAM_USER:
        return AwsIamUser_StackService;
      case InfrastructureStackType.AWS_RDS:
        return AwsRds_StackService;
      case InfrastructureStackType.AWS_S3:
        return AwsS3_StackService;
      case InfrastructureStackType.AWS_SQS:
        return AwsSqs_StackService;
      case InfrastructureStackType.AWS_VPC:
        return AwsVpc_StackService;
      case InfrastructureStackType.AWS_VPC_HIPAA:
        return AwsVpcHipaa_StackService;
      case InfrastructureStackType.AWS_WAF:
        return AwsWaf_StackService;
      default:
        return null;
    }
  }

  private getStackProgramByType(
    stackType: InfrastructureStackType,
    stackParams: any
  ) {
    return this.getStackServiceByType(stackType)?.getStackProgram(stackParams);
  }

  getStackParamsByType(stackType: InfrastructureStackType) {
    return this.getStackServiceByType(stackType)?.getStackParams();
  }
  /* End */
}