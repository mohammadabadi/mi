import { and, eq } from 'drizzle-orm'
import { transferCreateSchema } from '../../../shared/schemas/finance'
import { accounts, transfers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readSchemaBody(event, transferCreateSchema)
  const db = useDb()

  const userAccounts = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.userId, user.id))
  const accountIds = new Set(userAccounts.map((account) => account.id))

  if (!accountIds.has(body.fromAccountId) || !accountIds.has(body.toAccountId)) {
    throw createError({ statusCode: 404, statusMessage: 'حساب مبدا یا مقصد پیدا نشد.' })
  }

  const balance = await getAccountBalance(user.id, body.fromAccountId)
  if (balance < BigInt(body.amountMinor)) {
    throw createError({ statusCode: 409, statusMessage: 'موجودی حساب مبدا کافی نیست.' })
  }

  const [transfer] = await db.transaction(async (tx) => {
    return tx.insert(transfers).values({
      userId: user.id,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amountMinor: BigInt(body.amountMinor),
      description: body.description,
      date: body.date
    }).returning()
  })

  if (!transfer) throw createError({ statusCode: 500, statusMessage: 'ثبت انتقال ناموفق بود.' })

  return { transfer: serializeRow(transfer) }
})
