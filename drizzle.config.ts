import { defineConfig } from 'drizzle-kit'
import { loadEnvFile } from 'node:process'

try {
  loadEnvFile('.env')
} catch {
  // Environment variables may already be provided by the host.
}

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ''
  }
})
