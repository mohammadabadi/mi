import { and, ilike, ne, or } from 'drizzle-orm'
import { normalizePhone, userSearchSchema } from '../../../shared/schemas/finance'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = parseSchemaQuery(event, userSearchSchema)
  const db = useDb()
  const normalizedPhone = normalizePhone(query.q)
  const search = `%${query.q}%`

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
      or(
        ilike(users.name, search),
        ilike(users.email, search),
        ilike(users.phone, `%${normalizedPhone}%`)
      )
    ))
    .limit(10)

  return { users: rows }
})
