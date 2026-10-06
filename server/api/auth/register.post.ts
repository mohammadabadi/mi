import bcrypt from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { registerSchema } from '../../../shared/schemas/finance'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readSchemaBody(event, registerSchema)
  const db = useDb()
  const [existing] = await db
    .select({ id: users.id, email: users.email, phone: users.phone })
    .from(users)
    .where(or(eq(users.email, body.email), eq(users.phone, body.phone)))
    .limit(1)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: existing.email === body.email ? 'این ایمیل قبلاً ثبت شده است.' : 'این شماره موبایل قبلاً ثبت شده است.'
    })
  }

  const passwordHash = await bcrypt.hash(body.password, 12)
  const [user] = await db.insert(users).values({
    name: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash
  }).returning({ id: users.id, name: users.name, email: users.email, phone: users.phone })

  if (!user) throw createError({ statusCode: 500, statusMessage: 'ثبت‌نام ناموفق بود.' })

  await Promise.all([
    seedDefaultCategories(user.id),
    seedDefaultAccount(user.id)
  ])
  await setUserSession(event, user.id)

  return { user }
})
