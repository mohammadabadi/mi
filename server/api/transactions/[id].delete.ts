import { and, eq } from 'drizzle-orm'
import { transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()
  const [transaction] = await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.id))).returning()

  if (!transaction) throw createError({ statusCode: 404, statusMessage: 'تراکنش پیدا نشد.' })
  return { deleted: true }
})
