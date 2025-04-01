import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  BLING_ACCESS_TOKEN: z.string(),
  BLING_REFRESH_TOKEN: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  PLOOMES_USER_KEY: z.string(),
  BLING_USER_BASIC_BASE64: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
