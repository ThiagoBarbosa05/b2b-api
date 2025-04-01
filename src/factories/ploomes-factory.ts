import { PloomesService } from '../services/ploomes-service'

export function ploomesFactory() {
  return new PloomesService()
}
