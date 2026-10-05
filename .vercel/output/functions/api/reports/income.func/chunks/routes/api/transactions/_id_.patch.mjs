globalThis.__timing__.logStart('Load chunks/routes/api/transactions/_id_.patch');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts, h as categories, t as transactions } from '../../../_/auth.mjs';
import { r as readSchemaBody, t as transactionUpdateSchema } from '../../../_/finance.mjs';
import { s as serializeRow } from '../../../_/serializers.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a;
  const user = await requireUser(event);
  const id = (_a = getRouterParam(event, "id")) != null ? _a : "";
  const body = await readSchemaBody(event, transactionUpdateSchema);
  const db = useDb();
  if (body.accountId) {
    const [account] = await db.select({ id: accounts.id }).from(accounts).where(and(eq(accounts.id, body.accountId), eq(accounts.userId, user.id))).limit(1);
    if (!account) throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  }
  if (body.categoryId) {
    const [category] = await db.select({ id: categories.id, type: categories.type }).from(categories).where(and(eq(categories.id, body.categoryId), eq(categories.userId, user.id), eq(categories.isArchived, false))).limit(1);
    if (!category || body.type && category.type !== body.type) {
      throw createError({ statusCode: 400, statusMessage: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0628\u0627 \u0646\u0648\u0639 \u062A\u0631\u0627\u06A9\u0646\u0634 \u0633\u0627\u0632\u06AF\u0627\u0631 \u0646\u06CC\u0633\u062A." });
    }
  }
  const values = { updatedAt: /* @__PURE__ */ new Date() };
  if (body.accountId !== void 0) values.accountId = body.accountId;
  if (body.categoryId !== void 0) values.categoryId = body.categoryId;
  if (body.type !== void 0) values.type = body.type;
  if (body.amountMinor !== void 0) values.amountMinor = BigInt(body.amountMinor);
  if (body.description !== void 0) values.description = body.description;
  if (body.date !== void 0) values.date = body.date;
  const [transaction] = await db.update(transactions).set(values).where(and(eq(transactions.id, id), eq(transactions.userId, user.id))).returning();
  if (!transaction) throw createError({ statusCode: 404, statusMessage: "\u062A\u0631\u0627\u06A9\u0646\u0634 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return { transaction: serializeRow(transaction) };
});

export { _id__patch as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/transactions/_id_.patch');
//# sourceMappingURL=_id_.patch.mjs.map
