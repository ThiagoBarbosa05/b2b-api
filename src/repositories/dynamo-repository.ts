import {
  DynamoDBClient,
  GetItemCommand,
  GetItemInput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemInput,
} from '@aws-sdk/client-dynamodb'
import { env } from '../lib/env'

interface StoreTokensInput {
  access_token: string
  refresh_token: string
}

interface getTokensOutput {
  access_token: string
  refresh_token: string
}

export class DynamoRepository {
  private client: DynamoDBClient

  constructor() {
    this.client = new DynamoDBClient({
      region: 'us-east-2',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async storeTokens({
    access_token,
    refresh_token,
  }: StoreTokensInput): Promise<PutItemCommandOutput> {
    const params: PutItemCommandInput = {
      TableName: 'BlingToken',
      Item: {
        id: {
          S: 'Bling',
        },
        tokens: {
          M: {
            access_token: {
              S: access_token,
            },
            refresh_token: {
              S: refresh_token,
            },
          },
        },
      },
    }

    const command = new PutItemCommand(params)
    const response = await this.client.send(command)

    return response
  }

  async getTokens(): Promise<getTokensOutput> {
    const params: GetItemInput = {
      TableName: 'BlingToken',
      Key: {
        id: {
          S: 'Bling',
        },
      },
    }

    const command = new GetItemCommand(params)
    const response = await this.client.send(command)

    return {
      access_token: response.Item?.tokens.M?.access_token.S ?? '',
      refresh_token: response.Item?.tokens.M?.refresh_token.S ?? '',
    }
  }

  async updateTokens({
    access_token,
    refresh_token,
  }: StoreTokensInput): Promise<getTokensOutput> {
    const params: UpdateItemInput = {
      TableName: 'BlingToken',
      Key: {
        id: {
          S: 'Bling',
        },
      },
      UpdateExpression:
        'SET tokens.access_token = :access_token, tokens.refresh_token = :refresh_token',
      ExpressionAttributeValues: {
        ':access_token': {
          S: access_token,
        },
        ':refresh_token': {
          S: refresh_token,
        },
      },
      ReturnValues: 'ALL_NEW',
    }
    const command = new UpdateItemCommand(params)
    const response = await this.client.send(command)

    return {
      access_token: response.Attributes?.tokens.M?.access_token.S ?? '',
      refresh_token: response.Attributes?.tokens.M?.refresh_token.S ?? '',
    }
  }
}
