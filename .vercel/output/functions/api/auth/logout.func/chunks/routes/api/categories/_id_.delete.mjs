globalThis.__timing__.logStart('Load chunks/routes/api/categories/_id_.delete');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, t as transactions, h as categories } from '../../../_/auth.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a;
  const user = await requireUser(event);
  const id = (_a = getRouterParam(event, "id")) != null ? _a : "";
  const db = useDb();
  const [transaction] = await db.select({ id: transactions.id }).from(transactions).where(and(eq(transactions.userId, user.id), eq(transactions.categoryId, id))).limit(1);
  if (transaction) {
    const [category2] = await db.update(categories).set({ isArchived: true, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(categories.id, id), eq(categories.userId, user.id))).returning();
    if (!category2) throw createError({ statusCode: 404, statusMessage: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
    return { archived: true };
  }
  const [category] = await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, user.id))).returning();
  if (!category) throw createError({ statusCode: 404, statusMessage: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return { deleted: true };
});

export { _id__delete as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/categories/_id_.delete');
//# sourceMappingURL=_id_.delete.mjs.map
