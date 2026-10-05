import { and, eq } from 'drizzle-orm'
import { accounts } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()
  const [account] = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).limit(1)

  if (!account) throw createError({ statusCode: 404, statusMessage: 'حساب پیدا نشد.' })

  return {
    account: {
      ...serializeRow(account),
      balanceMinor: (await getAccountBalance(user.id, account.id)).toString()
    }
  }
})
