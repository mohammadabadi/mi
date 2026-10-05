globalThis.__timing__.logStart('Load chunks/routes/api/transactions/_id_.delete');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, t as transactions } from '../../../_/auth.mjs';
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
  const [transaction] = await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.id))).returning();
  if (!transaction) throw createError({ statusCode: 404, statusMessage: "\u062A\u0631\u0627\u06A9\u0646\u0634 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return { deleted: true };
});

export { _id__delete as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/transactions/_id_.delete');
//# sourceMappingURL=_id_.delete.mjs.map
