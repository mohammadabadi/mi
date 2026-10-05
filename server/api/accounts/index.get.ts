import { and, eq, isNull } from 'drizzle-orm'
import { accounts } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const rows = await db.select().from(accounts).where(and(eq(accounts.userId, user.id), isNull(accounts.archivedAt))).orderBy(accounts.createdAt)

  const withBalances = await Promise.all(rows.map(async (account) => ({
    ...serializeRow(account),
    balanceMinor: (await getAccountBalance(user.id, account.id)).toString()
  })))

  return { accounts: withBalances }
})
