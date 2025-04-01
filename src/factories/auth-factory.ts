import { DynamoRepository } from '../repositories/dynamo-repository'
import { AuthService } from '../services/auth-service'

export function authFactory() {
  const dynamoRepository = new DynamoRepository()
  return new AuthService(dynamoRepository)
}
