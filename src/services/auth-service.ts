import { blingApi } from '../lib/api'
import qs from 'qs'
import { DynamoRepository } from '../repositories/dynamo-repository'
import { env } from '../lib/env'

interface GetNewTokenResponse {
  access_token: string
  refresh_token: string
}

interface GetStoredTokenResponse {
  access_token: string
  refresh_token: string
}

interface UpdateTokenRequest {
  access_token: string
  refresh_token: string
}

interface UpdateTokenResponse {
  access_token: string
  refresh_token: string
}

export class AuthService {
  constructor(private dynamoRepository: DynamoRepository) {
    this.dynamoRepository = dynamoRepository
  }

  async getNewToken(refreshToken: string): Promise<GetNewTokenResponse> {
    const params = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }

    const response = await blingApi.post<GetNewTokenResponse>(
      '/oauth/token',
      qs.stringify(params),
      {
        headers: {
          Authorization: `Basic ${env.BLING_USER_BASIC_BASE64}`,
        },
      },
    )

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    }
  }

  async getStoredToken(): Promise<GetStoredTokenResponse> {
    const response = await this.dynamoRepository.getTokens()

    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    }
  }

  async updateToken({
    access_token,
    refresh_token,
  }: UpdateTokenRequest): Promise<UpdateTokenResponse> {
    const response = await this.dynamoRepository.updateTokens({
      access_token,
      refresh_token,
    })

    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    }
  }
}
