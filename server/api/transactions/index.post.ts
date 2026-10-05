import { and, eq } from 'drizzle-orm'
import { transactionCreateSchema } from '../../../shared/schemas/finance'
import { accounts, categories, transactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readSchemaBody(event, transactionCreateSchema)
  const db = useDb()

  const [account] = await db.select({ id: accounts.id }).from(accounts).where(and(eq(accounts.id, body.accountId), eq(accounts.userId, user.id))).limit(1)
  if (!account) throw createError({ statusCode: 404, statusMessage: 'حساب پیدا نشد.' })

  const [category] = await db.select({ id: categories.id, type: categories.type }).from(categories).where(and(eq(categories.id, body.categoryId), eq(categories.userId, user.id), eq(categories.isArchived, false))).limit(1)
  if (!category || category.type !== body.type) {
    throw createError({ statusCode: 400, statusMessage: 'دسته‌بندی با نوع تراکنش سازگار نیست.' })
  }

  if (body.type === 'expense') {
    const balance = await getAccountBalance(user.id, body.accountId)
    if (balance < BigInt(body.amountMinor)) {
      throw createError({ statusCode: 409, statusMessage: 'موجودی حساب کافی نیست.' })
    }
  }

  const [transaction] = await db.insert(transactions).values({
    userId: user.id,
    accountId: body.accountId,
    categoryId: body.categoryId,
    type: body.type,
    amountMinor: BigInt(body.amountMinor),
    description: body.description,
    date: body.date
  }).returning()

  if (!transaction) throw createError({ statusCode: 500, statusMessage: 'ثبت تراکنش ناموفق بود.' })

  return { transaction: serializeRow(transaction) }
})
