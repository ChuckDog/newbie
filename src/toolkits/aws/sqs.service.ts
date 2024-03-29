import {Injectable} from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  GetQueueAttributesCommand,
  QueueAttributeName,
} from '@aws-sdk/client-sqs';
import {getAwsSqsConfig} from './sqs.config';

@Injectable()
export class SqsService {
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      credentials: {
        accessKeyId: getAwsSqsConfig().accessKeyId,
        secretAccessKey: getAwsSqsConfig().secretAccessKey,
      },
      region: getAwsSqsConfig().region,
    });
  }

  /**
   * See the API doc for more details:
   * https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
   * @param {object} params
   * @returns {(Promise<{data: SQS.SendMessageResult | void;err: AWSError | void;}>)}
   * @memberof SqsService
   */
  async sendMessage(params: {queueUrl: string; body: object}) {
    const sendMessageRequest = {
      QueueUrl: params.queueUrl,
      MessageBody: JSON.stringify(params.body),
    };

    return await this.client.send(new SendMessageCommand(sendMessageRequest));
  }

  async getQueueAttributes(
    queueUrl: string,
    attributeNames: QueueAttributeName[]
  ) {
    const getQueueAttributesRequest = {
      QueueUrl: queueUrl,
      AttributeNames: attributeNames,
    };

    const result = await this.client.send(
      new GetQueueAttributesCommand(getQueueAttributesRequest)
    );

    return result.Attributes;
  }
}
