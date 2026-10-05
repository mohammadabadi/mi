import { and, eq } from 'drizzle-orm'
import { accounts, categories, transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()
  const [transaction] = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amountMinor: transactions.amountMinor,
      description: transactions.description,
      date: transactions.date,
      accountId: transactions.accountId,
      accountName: accounts.name,
      categoryId: transactions.categoryId,
      categoryName: categories.name
    })
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .limit(1)

  if (!transaction) throw createError({ statusCode: 404, statusMessage: 'تراکنش پیدا نشد.' })
  return { transaction: serializeRow(transaction) }
})
