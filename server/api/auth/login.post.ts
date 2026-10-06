import bcrypt from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { loginSchema } from '../../../shared/schemas/finance'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readSchemaBody(event, loginSchema)
  const db = useDb()
  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, body.identifier), eq(users.phone, body.identifier)))
    .limit(1)

  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'ایمیل، موبایل یا رمز عبور اشتباه است.' })
  }

  await setUserSession(event, user.id)
  return { user: { id: user.id, name: user.name, email: user.email, phone: user.phone } }
})
