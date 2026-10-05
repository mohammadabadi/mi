import { createHash, randomBytes } from 'node:crypto'
import { and, eq, gt } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { accounts, categories, sessions, users } from '../database/schema'

const SESSION_COOKIE = 'mifin_session'
const SESSION_DAYS = 30
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/'
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

export async function setUserSession(event: H3Event, userId: string) {
  const db = useDb()
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt
  })

  setCookie(event, SESSION_COOKIE, token, {
    ...sessionCookieOptions,
    expires: expiresAt
  })
}

export async function clearUserSession(event: H3Event) {
  const db = useDb()
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  }
  deleteCookie(event, SESSION_COOKIE, sessionCookieOptions)
  setCookie(event, SESSION_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0)
  })
}

export async function getCurrentUser(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const db = useDb()
  const [session] = await db
    .select({
      userId: sessions.userId,
      email: users.email,
      name: users.name,
      expiresAt: sessions.expiresAt
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1)

  if (!session) return null

  return {
    id: session.userId,
    email: session.email,
    name: session.name
  }
}

export async function requireUser(event: H3Event) {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'ابتدا وارد حساب کاربری شوید.' })
  }
  return user
}

export async function seedDefaultCategories(userId: string) {
  const db = useDb()
  await db.insert(categories).values([
    { userId, name: 'حقوق', type: 'income', icon: 'wallet' },
    { userId, name: 'هدیه', type: 'income', icon: 'gift' },
    { userId, name: 'خوراک', type: 'expense', icon: 'utensils' },
    { userId, name: 'حمل و نقل', type: 'expense', icon: 'car' },
    { userId, name: 'خرید', type: 'expense', icon: 'shopping-bag' },
    { userId, name: 'قبوض', type: 'expense', icon: 'receipt' },
    { userId, name: 'سرگرمی', type: 'expense', icon: 'music' }
  ])
}

export async function seedDefaultAccount(userId: string) {
  const db = useDb()
  await db.insert(accounts).values({
    userId,
    name: 'حساب اصلی',
    type: 'bank',
    currency: 'IRR',
    initialBalanceMinor: BigInt(0)
  })
}
