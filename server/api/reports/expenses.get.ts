import { and, eq, sql } from 'drizzle-orm'
import { categories, transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      amountMinor: sql<string>`coalesce(sum(${transactions.amountMinor}), 0)`
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(eq(transactions.userId, user.id), eq(transactions.type, 'expense')))
    .groupBy(categories.id, categories.name)
    .orderBy(sql`sum(${transactions.amountMinor}) desc`)

  return { rows: serializeRows(rows) }
})
