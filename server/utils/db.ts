import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../database/schema'
import { assertDatabaseUrl, createPostgresClient } from '../database/connection'

let client: ReturnType<typeof createPostgresClient> | undefined

export function useDb() {
  const config = useRuntimeConfig()
  const databaseUrl = config.databaseUrl as string | undefined

  try {
    assertDatabaseUrl(databaseUrl)
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL تنظیم نشده است. مقدار واقعی اتصال PostgreSQL را در فایل .env قرار دهید و migrationها را اجرا کنید.'
    })
  }

  client ??= createPostgresClient(databaseUrl)
  return drizzle(client, { schema })
}
