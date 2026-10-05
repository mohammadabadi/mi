import { and, eq, sql } from 'drizzle-orm'
import { transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const rows = await db
    .select({
      month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
      incomeMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountMinor} else 0 end), 0)`,
      expenseMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountMinor} else 0 end), 0)`
    })
    .from(transactions)
    .where(eq(transactions.userId, user.id))
    .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM') desc`)
    .limit(24)

  return {
    rows: rows.map((row) => ({
      ...row,
      netMinor: (BigInt(row.incomeMinor) - BigInt(row.expenseMinor)).toString()
    }))
  }
})
