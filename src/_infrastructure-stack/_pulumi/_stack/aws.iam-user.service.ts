import {Injectable} from '@nestjs/common';
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import {CommonUtil} from '../../../_util/_common.util';
import {PulumiUtil} from '../_pulumi.util';
import {CommonConfig} from '../../../_config/_common.config';

@Injectable()
export class AwsIamUser_StackService {
  static getStackParams() {
    return {
      iamUserName: 'henry',
    };
  }

  static getUsers() {
    return pulumi.output(aws.iam.getUsers());
  }

  static getStackProgram = (params: {iamUserName: string}) => async () => {
    // [step 1] Guard statement.

    // [step 2] Get or create IAM user group.
    let uniqueResourceName: string;

    const userGroupName = 'Developer';
    const developerUserGroup = await aws.iam.getGroup({
      groupName: 'Developer',
    });

    if (null === developerUserGroup || undefined === developerUserGroup) {
      uniqueResourceName = 'UserGroup-';
      new aws.iam.Group(
        uniqueResourceName,
        {
          name: userGroupName,
        },
        PulumiUtil.resourceOptions
      );

      uniqueResourceName =
        'iam-usergroup-policy-attachment-' + CommonUtil.randomCode(4);
      new aws.iam.GroupPolicyAttachment(
        uniqueResourceName,
        {
          group: userGroupName,
          policyArn:
            (CommonConfig.getRegion().startsWith('cn')
              ? 'arn:aws-cn:'
              : 'arn:aws:') +
            'arn:aws-cn:iam::aws:policy/AWSCodeCommitPowerUser',
        },
        PulumiUtil.resourceOptions
      );
    }

    // [step 3] Create a user.
    uniqueResourceName = 'code-commit-' + CommonUtil.randomCode(4);

    const iamUser = new aws.iam.User(
      uniqueResourceName,
      {
        name: params.iamUserName,
      },
      PulumiUtil.resourceOptions
    );

    const userGroupMembership = new aws.iam.UserGroupMembership(
      uniqueResourceName,
      {
        user: iamUser.name,
        groups: [userGroupName],
      },
      PulumiUtil.resourceOptions
    );

    return {};
  };
}