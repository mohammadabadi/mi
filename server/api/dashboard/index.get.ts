import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { accounts, categories, transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10)
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10)

  const accountRows = await db.select().from(accounts).where(eq(accounts.userId, user.id))
  const balances = await Promise.all(accountRows.map((account) => getAccountBalance(user.id, account.id)))
  const totalBalanceMinor = balances.reduce((sum, value) => sum + value, BigInt(0))

  const [monthly] = await db
    .select({
      incomeMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountMinor} else 0 end), 0)`,
      expenseMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountMinor} else 0 end), 0)`
    })
    .from(transactions)
    .where(and(eq(transactions.userId, user.id), gte(transactions.date, monthStart), lte(transactions.date, monthEnd)))
  const monthlyTotals = monthly ?? { incomeMinor: '0', expenseMinor: '0' }

  const recent = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amountMinor: transactions.amountMinor,
      description: transactions.description,
      date: transactions.date,
      accountName: accounts.name,
      categoryName: categories.name
    })
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(8)

  const categoryBreakdown = await db
    .select({
      categoryName: categories.name,
      amountMinor: sql<string>`coalesce(sum(${transactions.amountMinor}), 0)`
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(eq(transactions.userId, user.id), eq(transactions.type, 'expense'), gte(transactions.date, monthStart), lte(transactions.date, monthEnd)))
    .groupBy(categories.name)
    .orderBy(sql`sum(${transactions.amountMinor}) desc`)

  return {
    summary: {
      totalBalanceMinor: totalBalanceMinor.toString(),
      monthlyIncomeMinor: monthlyTotals.incomeMinor,
      monthlyExpenseMinor: monthlyTotals.expenseMinor,
      netCashFlowMinor: (BigInt(monthlyTotals.incomeMinor) - BigInt(monthlyTotals.expenseMinor)).toString()
    },
    recentTransactions: serializeRows(recent),
    categoryBreakdown: serializeRows(categoryBreakdown)
  }
})
