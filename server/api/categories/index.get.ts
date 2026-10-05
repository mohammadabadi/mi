import { and, eq } from 'drizzle-orm'
import { categories } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const rows = await db.select().from(categories).where(and(eq(categories.userId, user.id), eq(categories.isArchived, false))).orderBy(categories.type, categories.name)

  return { categories: serializeRows(rows) }
})
