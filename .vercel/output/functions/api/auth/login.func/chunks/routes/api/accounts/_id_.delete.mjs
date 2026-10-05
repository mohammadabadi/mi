globalThis.__timing__.logStart('Load chunks/routes/api/accounts/_id_.delete');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, t as transactions, a as transfers, b as accounts } from '../../../_/auth.mjs';
import { and, eq, or } from 'drizzle-orm';
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
  const [transaction] = await db.select({ id: transactions.id }).from(transactions).where(and(eq(transactions.userId, user.id), eq(transactions.accountId, id))).limit(1);
  const [transfer] = await db.select({ id: transfers.id }).from(transfers).where(and(eq(transfers.userId, user.id), or(eq(transfers.fromAccountId, id), eq(transfers.toAccountId, id)))).limit(1);
  if (transaction || transfer) {
    const [account2] = await db.update(accounts).set({ archivedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).returning();
    if (!account2) throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
    return { archived: true };
  }
  const [account] = await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).returning();
  if (!account) throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return { deleted: true };
});

export { _id__delete as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/accounts/_id_.delete');
//# sourceMappingURL=_id_.delete.mjs.map
