import postgres from 'postgres'

const PLACEHOLDER_MARKERS = [
  'USER:PASSWORD@HOST/DATABASE',
  'PROJECT_REF',
  'aws-0-REGION',
  'YOUR_PASSWORD',
  'replace-me'
]

export function assertDatabaseUrl(databaseUrl: string | undefined): asserts databaseUrl is string {
  const hasPlaceholder = PLACEHOLDER_MARKERS.some((marker) => databaseUrl?.includes(marker))

  if (!databaseUrl || hasPlaceholder) {
    throw new Error(
      'DATABASE_URL is not configured. Set a real PostgreSQL connection string and run migrations.'
    )
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error(
      'DATABASE_URL must be a PostgreSQL connection string starting with postgresql:// or postgres://.'
    )
  }
}

function resolveSsl(databaseUrl: string): boolean | 'require' {
  const explicit = process.env.DATABASE_SSL?.trim().toLowerCase()

  if (explicit === 'disable' || explicit === 'false' || explicit === '0') {
    return false
  }

  if (explicit === 'require' || explicit === 'true' || explicit === '1') {
    return 'require'
  }

  try {
    const parsed = new URL(databaseUrl)
    const sslMode = parsed.searchParams.get('sslmode')?.toLowerCase()
    if (sslMode === 'disable' || sslMode === 'allow' || sslMode === 'prefer') {
      return false
    }
    if (sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full') {
      return 'require'
    }

    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return false
    }
  } catch {
    // Fall through to default below.
  }

  // Managed hosts (e.g. Supabase) usually need TLS.
  return 'require'
}

function resolvePoolMax() {
  const raw = process.env.DATABASE_POOL_MAX
  if (raw) {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  // Long-running Node on a VPS can keep a small pool; serverless stays at 1.
  return process.env.NITRO_PRESET === 'vercel' || process.env.VERCEL ? 1 : 10
}

export function createPostgresClient(databaseUrl: string) {
  assertDatabaseUrl(databaseUrl)

  return postgres(databaseUrl, {
    max: resolvePoolMax(),
    prepare: false,
    ssl: resolveSsl(databaseUrl),
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30
  })
}
