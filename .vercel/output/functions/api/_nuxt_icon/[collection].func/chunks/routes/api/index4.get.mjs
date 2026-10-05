globalThis.__timing__.logStart('Load chunks/routes/api/index4.get');import { d as defineEventHandler } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, t as transactions, h as categories, b as accounts } from '../../_/auth.mjs';
import { p as parseSchemaQuery, f as transactionFilterSchema } from '../../_/finance.mjs';
import { a as serializeRows } from '../../_/serializers.mjs';
import { eq, gte, lte, ilike, asc, desc, and, count, sql } from 'drizzle-orm';
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
import 'zod';

const index_get = defineEventHandler(async (event) => {
  var _a;
  const user = await requireUser(event);
  const query = parseSchemaQuery(event, transactionFilterSchema);
  const db = useDb();
  const filters = [eq(transactions.userId, user.id)];
  if (query.from) filters.push(gte(transactions.date, query.from));
  if (query.to) filters.push(lte(transactions.date, query.to));
  if (query.type) filters.push(eq(transactions.type, query.type));
  if (query.accountId) filters.push(eq(transactions.accountId, query.accountId));
  if (query.categoryId) filters.push(eq(transactions.categoryId, query.categoryId));
  if (query.search) filters.push(ilike(transactions.description, `%${query.search}%`));
  const orderBy = query.sort === "date_asc" ? asc(transactions.date) : query.sort === "amount_desc" ? desc(transactions.amountMinor) : query.sort === "amount_asc" ? asc(transactions.amountMinor) : desc(transactions.date);
  const whereClause = and(...filters);
  const offset = (query.page - 1) * query.limit;
  const [total] = await db.select({ value: count() }).from(transactions).where(whereClause);
  const rows = await db.select({
    id: transactions.id,
    type: transactions.type,
    amountMinor: transactions.amountMinor,
    description: transactions.description,
    date: transactions.date,
    accountId: transactions.accountId,
    accountName: accounts.name,
    categoryId: transactions.categoryId,
    categoryName: categories.name,
    categoryIcon: categories.icon,
    createdAt: transactions.createdAt
  }).from(transactions).innerJoin(accounts, eq(accounts.id, transactions.accountId)).innerJoin(categories, eq(categories.id, transactions.categoryId)).where(whereClause).orderBy(orderBy, sql`${transactions.createdAt} desc`).limit(query.limit).offset(offset);
  return {
    transactions: serializeRows(rows),
    pagination: { page: query.page, limit: query.limit, total: (_a = total == null ? void 0 : total.value) != null ? _a : 0 }
  };
});

export { index_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index4.get');
//# sourceMappingURL=index4.get.mjs.map
