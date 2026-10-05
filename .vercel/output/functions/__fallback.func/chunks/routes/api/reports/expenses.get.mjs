globalThis.__timing__.logStart('Load chunks/routes/api/reports/expenses.get');import { d as defineEventHandler } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, h as categories, t as transactions } from '../../../_/auth.mjs';
import { a as serializeRows } from '../../../_/serializers.mjs';
import { sql, eq, and } from 'drizzle-orm';
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

const expenses_get = defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const db = useDb();
  const rows = await db.select({
    categoryId: categories.id,
    categoryName: categories.name,
    amountMinor: sql`coalesce(sum(${transactions.amountMinor}), 0)`
  }).from(transactions).innerJoin(categories, eq(categories.id, transactions.categoryId)).where(and(eq(transactions.userId, user.id), eq(transactions.type, "expense"))).groupBy(categories.id, categories.name).orderBy(sql`sum(${transactions.amountMinor}) desc`);
  return { rows: serializeRows(rows) };
});

export { expenses_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/reports/expenses.get');
//# sourceMappingURL=expenses.get.mjs.map
