import { and, eq, or } from 'drizzle-orm'
import { accounts, transactions, transfers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()

  const [transaction] = await db.select({ id: transactions.id }).from(transactions).where(and(eq(transactions.userId, user.id), eq(transactions.accountId, id))).limit(1)
  const [transfer] = await db.select({ id: transfers.id }).from(transfers).where(and(eq(transfers.userId, user.id), or(eq(transfers.fromAccountId, id), eq(transfers.toAccountId, id)))).limit(1)

  if (transaction || transfer) {
    const [account] = await db.update(accounts).set({ archivedAt: new Date(), updatedAt: new Date() }).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).returning()
    if (!account) throw createError({ statusCode: 404, statusMessage: 'حساب پیدا نشد.' })
    return { archived: true }
  }

  const [account] = await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).returning()
  if (!account) throw createError({ statusCode: 404, statusMessage: 'حساب پیدا نشد.' })
  return { deleted: true }
})
