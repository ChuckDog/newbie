import {registerAs} from '@nestjs/config';

export default registerAs('microservice', () => ({
  account: {
    security: {
      ipLoginLimiter: {
        points: process.env.ACCOUNT_SECURITY_IP_LOGIN_LIMITER_POINTS,
        durationSeconds:
          process.env.ACCOUNT_SECURITY_IP_LOGIN_LIMITER_DURATION_SECONDS,
      },
      userLoginLimiter: {
        points: process.env.ACCOUNT_SECURITY_USER_LOGIN_LIMITER_POINTS,
        durationSeconds:
          process.env.ACCOUNT_SECURITY_USER_LOGIN_LIMITER_DURATION_SECONDS,
      },
    },
    verificationCode: {
      timeoutMinutes: process.env.ACCOUNT_VERIFICATION_CODE_TIMEOUT_MINUTES,
      resendMinutes: process.env.ACCOUNT_VERIFICATION_CODE_RESEND_MINUTES,
    },
  },
  eventScheduling: {
    minutesOfTimeslotUnit:
      process.env.EVENT_SCHEDULING_MINUTES_OF_TIMESLOT_UNIT,
  },
  'file-mgmt': {
    awsS3Bucket: process.env.FILE_MANAGEMENT_AWS_S3_BUCKET,
    awsCloudfrontDomain: process.env.FILE_MANAGEMENT_AWS_CLOUDFRONT_DOMAIN,
    localPath: process.env.FILE_MANAGEMENT_LOCAL_PATH || './uploaded-files',
  },
  notification: {
    email: {
      awsPinpointApplicationId:
        process.env.NOTIFICATION_EMAIL_AWS_PINPOINT_APPLICATION_ID || 'default',
      awsPinpointFromAddress:
        process.env.NOTIFICATION_EMAIL_AWS_PINPOINT_FROM_ADDRESS || 'default',
    },
    sms: {
      awsPinpointApplicationId:
        process.env.NOTIFICATION_SMS_AWS_PINPOINT_APPLICATION_ID || 'default',
      awsPinpointSenderId:
        process.env.NOTIFICATION_SMS_AWS_PINPOINT_SENDER_ID || 'default',
    },
  },
  'project-mgmt': {
    pulumi: {
      awsVersion: process.env.PULUMI_AWS_VERSION,
      accessToken: process.env.PULUMI_ACCESS_TOKEN,
    },
  },
  task: {
    awsSqsQueueUrl: process.env.TASK_AWS_SQS_QUEUE_URL || 'default',
  },
  token: {
    access: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      secret: process.env.ACCESS_TOKEN_SECRET,
    },
    refresh: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      secret: process.env.REFRESH_TOKEN_SECRET,
    },
  },
}));
