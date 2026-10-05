globalThis.__timing__.logStart('Load chunks/_/balances');import { u as useDb, b as accounts, t as transactions, a as transfers } from './auth.mjs';
import { c as createError } from './nitro.mjs';
import { and, eq, or } from 'drizzle-orm';

function calculateAccountBalance(input) {
  let balance = BigInt(input.account.initialBalanceMinor);
  for (const transaction of input.transactions) {
    if (transaction.accountId !== input.account.id) continue;
    const amount = BigInt(transaction.amountMinor);
    balance += transaction.type === "income" ? amount : -amount;
  }
  for (const transfer of input.transfers) {
    const amount = BigInt(transfer.amountMinor);
    if (transfer.fromAccountId === input.account.id) balance -= amount;
    if (transfer.toAccountId === input.account.id) balance += amount;
  }
  return balance;
}

async function getAccountBalance(userId, accountId) {
  const db = useDb();
  const [account] = await db.select({ id: accounts.id, initialBalanceMinor: accounts.initialBalanceMinor }).from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, userId))).limit(1);
  if (!account) {
    throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  }
  const accountTransactions = await db.select({
    accountId: transactions.accountId,
    type: transactions.type,
    amountMinor: transactions.amountMinor
  }).from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.accountId, accountId)));
  const accountTransfers = await db.select({
    fromAccountId: transfers.fromAccountId,
    toAccountId: transfers.toAccountId,
    amountMinor: transfers.amountMinor
  }).from(transfers).where(and(eq(transfers.userId, userId), or(eq(transfers.fromAccountId, accountId), eq(transfers.toAccountId, accountId))));
  return calculateAccountBalance({
    account,
    transactions: accountTransactions,
    transfers: accountTransfers
  });
}

export { getAccountBalance as g };;globalThis.__timing__.logEnd('Load chunks/_/balances');
//# sourceMappingURL=balances.mjs.map
