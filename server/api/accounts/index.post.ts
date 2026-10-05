import { accountCreateSchema } from '../../../shared/schemas/finance'
import { accounts } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readSchemaBody(event, accountCreateSchema)
  const db = useDb()

  const [account] = await db.insert(accounts).values({
    userId: user.id,
    name: body.name,
    type: body.type,
    currency: body.currency,
    initialBalanceMinor: BigInt(body.initialBalanceMinor)
  }).returning()

  if (!account) throw createError({ statusCode: 500, statusMessage: 'ثبت حساب ناموفق بود.' })

  return { account: { ...serializeRow(account), balanceMinor: account.initialBalanceMinor.toString() } }
})
