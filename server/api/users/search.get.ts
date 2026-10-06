import { and, eq, ilike, ne } from 'drizzle-orm'
import { normalizePhone, userSearchSchema } from '../../../shared/schemas/finance'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = parseSchemaQuery(event, userSearchSchema)
  const db = useDb()
  const normalizedPhone = normalizePhone(query.q)
  const q = query.q.trim().toLowerCase()

  const contactFilter = /^09\d{9}$/.test(normalizedPhone)
    ? eq(users.phone, normalizedPhone)
    : q.includes('@') && q.length >= 5
      ? ilike(users.email, `%${q}%`)
      : undefined

  if (!contactFilter) return { users: [] }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone
    })
    .from(users)
    .where(and(
      ne(users.id, user.id),
      contactFilter
    ))
    .limit(10)

  return { users: rows }
})
