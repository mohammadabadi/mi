import { and, eq, or } from 'drizzle-orm'
import { accounts, transactions, transfers } from '../database/schema'
import { calculateAccountBalance } from '../../shared/utils/money'

export async function getAccountBalance(userId: string, accountId: string) {
  const db = useDb()
  const [account] = await db
    .select({ id: accounts.id, initialBalanceMinor: accounts.initialBalanceMinor })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1)

  if (!account) {
    throw createError({ statusCode: 404, statusMessage: 'حساب پیدا نشد.' })
  }

  const accountTransactions = await db
    .select({
      accountId: transactions.accountId,
      type: transactions.type,
      amountMinor: transactions.amountMinor
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.accountId, accountId)))

  const accountTransfers = await db
    .select({
      fromAccountId: transfers.fromAccountId,
      toAccountId: transfers.toAccountId,
      amountMinor: transfers.amountMinor
    })
    .from(transfers)
    .where(and(eq(transfers.userId, userId), or(eq(transfers.fromAccountId, accountId), eq(transfers.toAccountId, accountId))))

  return calculateAccountBalance({
    account,
    transactions: accountTransactions,
    transfers: accountTransfers
  })
}
