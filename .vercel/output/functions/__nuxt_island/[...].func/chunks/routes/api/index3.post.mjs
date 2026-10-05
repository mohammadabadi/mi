globalThis.__timing__.logStart('Load chunks/routes/api/index3.post');import { d as defineEventHandler, c as createError } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts, h as categories, t as transactions } from '../../_/auth.mjs';
import { r as readSchemaBody, g as transactionCreateSchema } from '../../_/finance.mjs';
import { g as getAccountBalance } from '../../_/balances.mjs';
import { s as serializeRow } from '../../_/serializers.mjs';
import { and, eq } from 'drizzle-orm';
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

const index_post = defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readSchemaBody(event, transactionCreateSchema);
  const db = useDb();
  const [account] = await db.select({ id: accounts.id }).from(accounts).where(and(eq(accounts.id, body.accountId), eq(accounts.userId, user.id))).limit(1);
  if (!account) throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  const [category] = await db.select({ id: categories.id, type: categories.type }).from(categories).where(and(eq(categories.id, body.categoryId), eq(categories.userId, user.id), eq(categories.isArchived, false))).limit(1);
  if (!category || category.type !== body.type) {
    throw createError({ statusCode: 400, statusMessage: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0628\u0627 \u0646\u0648\u0639 \u062A\u0631\u0627\u06A9\u0646\u0634 \u0633\u0627\u0632\u06AF\u0627\u0631 \u0646\u06CC\u0633\u062A." });
  }
  if (body.type === "expense") {
    const balance = await getAccountBalance(user.id, body.accountId);
    if (balance < BigInt(body.amountMinor)) {
      throw createError({ statusCode: 409, statusMessage: "\u0645\u0648\u062C\u0648\u062F\u06CC \u062D\u0633\u0627\u0628 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A." });
    }
  }
  const [transaction] = await db.insert(transactions).values({
    userId: user.id,
    accountId: body.accountId,
    categoryId: body.categoryId,
    type: body.type,
    amountMinor: BigInt(body.amountMinor),
    description: body.description,
    date: body.date
  }).returning();
  if (!transaction) throw createError({ statusCode: 500, statusMessage: "\u062B\u0628\u062A \u062A\u0631\u0627\u06A9\u0646\u0634 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F." });
  return { transaction: serializeRow(transaction) };
});

export { index_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index3.post');
//# sourceMappingURL=index3.post.mjs.map
