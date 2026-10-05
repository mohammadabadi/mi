import { and, eq } from 'drizzle-orm'
import { accountUpdateSchema } from '../../../shared/schemas/finance'
import { accounts } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readSchemaBody(event, accountUpdateSchema)
  const db = useDb()
  const values: Record<string, unknown> = { updatedAt: new Date() }

  if (body.name !== undefined) values.name = body.name
  if (body.type !== undefined) values.type = body.type
  if (body.currency !== undefined) values.currency = body.currency
  if (body.initialBalanceMinor !== undefined) values.initialBalanceMinor = BigInt(body.initialBalanceMinor)

  const [account] = await db.update(accounts).set(values).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).returning()
  if (!account) throw createError({ statusCode: 404, statusMessage: 'حساب پیدا نشد.' })

  return { account: serializeRow(account) }
})
