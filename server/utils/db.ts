import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

let client: postgres.Sql | undefined

export function useDb() {
  const config = useRuntimeConfig()
  const databaseUrl = config.databaseUrl

  const hasPlaceholderUrl = [
    'USER:PASSWORD@HOST/DATABASE',
    'PROJECT_REF',
    'PASSWORD',
    'REGION'
  ].some((placeholder) => databaseUrl?.includes(placeholder))

  if (!databaseUrl || hasPlaceholderUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL تنظیم نشده است. مقدار واقعی اتصال Supabase/PostgreSQL را در فایل .env قرار دهید و migrationها را اجرا کنید.'
    })
  }

  client ??= postgres(databaseUrl, { max: 1, prepare: false })
  return drizzle(client, { schema })
}
