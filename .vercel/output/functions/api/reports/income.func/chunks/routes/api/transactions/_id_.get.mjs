globalThis.__timing__.logStart('Load chunks/routes/api/transactions/_id_.get');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, h as categories, t as transactions, b as accounts } from '../../../_/auth.mjs';
import { s as serializeRow } from '../../../_/serializers.mjs';
import { eq, and } from 'drizzle-orm';
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

const _id__get = defineEventHandler(async (event) => {
  var _a;
  const user = await requireUser(event);
  const id = (_a = getRouterParam(event, "id")) != null ? _a : "";
  const db = useDb();
  const [transaction] = await db.select({
    id: transactions.id,
    type: transactions.type,
    amountMinor: transactions.amountMinor,
    description: transactions.description,
    date: transactions.date,
    accountId: transactions.accountId,
    accountName: accounts.name,
    categoryId: transactions.categoryId,
    categoryName: categories.name
  }).from(transactions).innerJoin(accounts, eq(accounts.id, transactions.accountId)).innerJoin(categories, eq(categories.id, transactions.categoryId)).where(and(eq(transactions.id, id), eq(transactions.userId, user.id))).limit(1);
  if (!transaction) throw createError({ statusCode: 404, statusMessage: "\u062A\u0631\u0627\u06A9\u0646\u0634 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return { transaction: serializeRow(transaction) };
});

export { _id__get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/transactions/_id_.get');
//# sourceMappingURL=_id_.get.mjs.map
