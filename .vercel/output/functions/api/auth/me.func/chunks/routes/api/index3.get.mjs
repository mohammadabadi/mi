globalThis.__timing__.logStart('Load chunks/routes/api/index3.get');import { d as defineEventHandler } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts, t as transactions, h as categories } from '../../_/auth.mjs';
import { g as getAccountBalance } from '../../_/balances.mjs';
import { a as serializeRows } from '../../_/serializers.mjs';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

const index_get = defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const db = useDb();
  const now = /* @__PURE__ */ new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
  const accountRows = await db.select().from(accounts).where(eq(accounts.userId, user.id));
  const balances = await Promise.all(accountRows.map((account) => getAccountBalance(user.id, account.id)));
  const totalBalanceMinor = balances.reduce((sum, value) => sum + value, BigInt(0));
  const [monthly] = await db.select({
    incomeMinor: sql`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountMinor} else 0 end), 0)`,
    expenseMinor: sql`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountMinor} else 0 end), 0)`
  }).from(transactions).where(and(eq(transactions.userId, user.id), gte(transactions.date, monthStart), lte(transactions.date, monthEnd)));
  const monthlyTotals = monthly != null ? monthly : { incomeMinor: "0", expenseMinor: "0" };
  const recent = await db.select({
    id: transactions.id,
    type: transactions.type,
    amountMinor: transactions.amountMinor,
    description: transactions.description,
    date: transactions.date,
    accountName: accounts.name,
    categoryName: categories.name
  }).from(transactions).innerJoin(accounts, eq(accounts.id, transactions.accountId)).innerJoin(categories, eq(categories.id, transactions.categoryId)).where(eq(transactions.userId, user.id)).orderBy(desc(transactions.date), desc(transactions.createdAt)).limit(8);
  const categoryBreakdown = await db.select({
    categoryName: categories.name,
    amountMinor: sql`coalesce(sum(${transactions.amountMinor}), 0)`
  }).from(transactions).innerJoin(categories, eq(categories.id, transactions.categoryId)).where(and(eq(transactions.userId, user.id), eq(transactions.type, "expense"), gte(transactions.date, monthStart), lte(transactions.date, monthEnd))).groupBy(categories.name).orderBy(sql`sum(${transactions.amountMinor}) desc`);
  return {
    summary: {
      totalBalanceMinor: totalBalanceMinor.toString(),
      monthlyIncomeMinor: monthlyTotals.incomeMinor,
      monthlyExpenseMinor: monthlyTotals.expenseMinor,
      netCashFlowMinor: (BigInt(monthlyTotals.incomeMinor) - BigInt(monthlyTotals.expenseMinor)).toString()
    },
    recentTransactions: serializeRows(recent),
    categoryBreakdown: serializeRows(categoryBreakdown)
  };
});

export { index_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index3.get');
//# sourceMappingURL=index3.get.mjs.map
