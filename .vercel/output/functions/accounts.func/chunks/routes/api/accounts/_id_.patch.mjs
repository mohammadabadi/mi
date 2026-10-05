globalThis.__timing__.logStart('Load chunks/routes/api/accounts/_id_.patch');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts } from '../../../_/auth.mjs';
import { r as readSchemaBody, a as accountUpdateSchema } from '../../../_/finance.mjs';
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
  const body = await readSchemaBody(event, accountUpdateSchema);
  const db = useDb();
  const values = { updatedAt: /* @__PURE__ */ new Date() };
  if (body.name !== void 0) values.name = body.name;
  if (body.type !== void 0) values.type = body.type;
  if (body.currency !== void 0) values.currency = body.currency;
  if (body.initialBalanceMinor !== void 0) values.initialBalanceMinor = BigInt(body.initialBalanceMinor);
  const [account] = await db.update(accounts).set(values).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).returning();
  if (!account) throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return { account: serializeRow(account) };
});

export { _id__patch as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/accounts/_id_.patch');
//# sourceMappingURL=_id_.patch.mjs.map
