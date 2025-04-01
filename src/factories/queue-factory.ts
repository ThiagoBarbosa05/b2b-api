import { QueueService } from '../services/queue-service'

export function queueFactory() {
  return new QueueService()
}
