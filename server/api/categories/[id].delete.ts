import { and, eq } from 'drizzle-orm'
import { categories, transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()
  const [transaction] = await db.select({ id: transactions.id }).from(transactions).where(and(eq(transactions.userId, user.id), eq(transactions.categoryId, id))).limit(1)

  if (transaction) {
    const [category] = await db.update(categories).set({ isArchived: true, updatedAt: new Date() }).where(and(eq(categories.id, id), eq(categories.userId, user.id))).returning()
    if (!category) throw createError({ statusCode: 404, statusMessage: 'دسته‌بندی پیدا نشد.' })
    return { archived: true }
  }

  const [category] = await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, user.id))).returning()
  if (!category) throw createError({ statusCode: 404, statusMessage: 'دسته‌بندی پیدا نشد.' })
  return { deleted: true }
})
