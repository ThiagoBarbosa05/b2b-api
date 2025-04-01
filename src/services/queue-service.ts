import {
  Message,
  ReceiveMessageCommand,
  SendMessageCommand,
  SendMessageRequest,
  SQSClient,
} from '@aws-sdk/client-sqs'
import { env } from '../lib/env'

export class QueueService {
  private queueUrl: string
  private client: SQSClient

  constructor() {
    this.queueUrl =
      'https://sqs.us-east-2.amazonaws.com/025691313279/bling-contact'
    this.client = new SQSClient({
      region: 'us-east-2',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async sendMessage(message: string) {
    const input: SendMessageRequest = {
      MessageBody: message,
      QueueUrl: this.queueUrl,
      DelaySeconds: 2,
    }

    const command = new SendMessageCommand(input)
    await this.client.send(command)
  }

  async receiveMessage(): Promise<Message[] | undefined> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
    })
    const response = await this.client.send(command)

    return response.Messages
  }
}
