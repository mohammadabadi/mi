import { and, eq } from 'drizzle-orm'
import { transactionUpdateSchema } from '../../../shared/schemas/finance'
import { accounts, categories, transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readSchemaBody(event, transactionUpdateSchema)
  const db = useDb()

  if (body.accountId) {
    const [account] = await db.select({ id: accounts.id }).from(accounts).where(and(eq(accounts.id, body.accountId), eq(accounts.userId, user.id))).limit(1)
    if (!account) throw createError({ statusCode: 404, statusMessage: 'حساب پیدا نشد.' })
  }

  if (body.categoryId) {
    const [category] = await db.select({ id: categories.id, type: categories.type }).from(categories).where(and(eq(categories.id, body.categoryId), eq(categories.userId, user.id), eq(categories.isArchived, false))).limit(1)
    if (!category || (body.type && category.type !== body.type)) {
      throw createError({ statusCode: 400, statusMessage: 'دسته‌بندی با نوع تراکنش سازگار نیست.' })
    }
  }

  const values: Record<string, unknown> = { updatedAt: new Date() }
  if (body.accountId !== undefined) values.accountId = body.accountId
  if (body.categoryId !== undefined) values.categoryId = body.categoryId
  if (body.type !== undefined) values.type = body.type
  if (body.amountMinor !== undefined) values.amountMinor = BigInt(body.amountMinor)
  if (body.description !== undefined) values.description = body.description
  if (body.date !== undefined) values.date = body.date

  const [transaction] = await db.update(transactions).set(values).where(and(eq(transactions.id, id), eq(transactions.userId, user.id))).returning()
  if (!transaction) throw createError({ statusCode: 404, statusMessage: 'تراکنش پیدا نشد.' })
  return { transaction: serializeRow(transaction) }
})
