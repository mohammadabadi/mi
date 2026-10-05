import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import { loadEnvFile } from 'node:process'
import postgres from 'postgres'
import { accounts, categories, transactions, users } from './schema'

try {
  loadEnvFile('.env')
} catch {
  // Environment variables may already be provided by the host.
}

const databaseUrl = process.env.DATABASE_URL

const hasPlaceholderUrl = [
  'USER:PASSWORD@HOST/DATABASE',
  'PROJECT_REF',
  'PASSWORD',
  'REGION'
].some((placeholder) => databaseUrl?.includes(placeholder))

if (!databaseUrl || hasPlaceholderUrl) {
  throw new Error('A real Supabase/PostgreSQL DATABASE_URL is required for seeding.')
}

if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  throw new Error('DATABASE_URL must be a PostgreSQL connection string, not the Supabase project URL. It should start with postgresql://.')
}

const client = postgres(databaseUrl, { max: 1, prepare: false })
const db = drizzle(client)

const email = 'demo@mifin.local'
const password = 'password123'

const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)

if (!existing) {
  const [user] = await db.insert(users).values({
    name: 'کاربر نمونه',
    email,
    passwordHash: await bcrypt.hash(password, 12)
  }).returning({ id: users.id })

  const [bank, cash, wallet] = await db.insert(accounts).values([
    { userId: user.id, name: 'بانک ملت', type: 'bank', currency: 'IRR', initialBalanceMinor: BigInt(10000000) },
    { userId: user.id, name: 'نقدی', type: 'cash', currency: 'IRR', initialBalanceMinor: BigInt(2000000) },
    { userId: user.id, name: 'کیف پول', type: 'wallet', currency: 'IRR', initialBalanceMinor: BigInt(800000) }
  ]).returning({ id: accounts.id, name: accounts.name })

  const [salary, food, transport, bills] = await db.insert(categories).values([
    { userId: user.id, name: 'حقوق', type: 'income', icon: 'wallet' },
    { userId: user.id, name: 'خوراک', type: 'expense', icon: 'utensils' },
    { userId: user.id, name: 'حمل و نقل', type: 'expense', icon: 'car' },
    { userId: user.id, name: 'قبوض', type: 'expense', icon: 'receipt' }
  ]).returning({ id: categories.id, name: categories.name })

  await db.insert(transactions).values([
    { userId: user.id, accountId: bank.id, categoryId: salary.id, type: 'income', amountMinor: BigInt(30000000), description: 'حقوق ماهانه', date: '2026-10-01' },
    { userId: user.id, accountId: bank.id, categoryId: food.id, type: 'expense', amountMinor: BigInt(750000), description: 'رستوران', date: '2026-10-03' },
    { userId: user.id, accountId: cash.id, categoryId: transport.id, type: 'expense', amountMinor: BigInt(250000), description: 'تاکسی', date: '2026-10-04' },
    { userId: user.id, accountId: wallet.id, categoryId: bills.id, type: 'expense', amountMinor: BigInt(1200000), description: 'اینترنت', date: '2026-10-05' }
  ])

  console.log(`Seeded demo user: ${email} / ${password}`)
} else {
  console.log('Demo user already exists. Skipping seed.')
}

await client.end()
