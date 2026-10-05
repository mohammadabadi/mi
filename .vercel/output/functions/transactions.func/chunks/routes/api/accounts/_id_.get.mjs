globalThis.__timing__.logStart('Load chunks/routes/api/accounts/_id_.get');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts } from '../../../_/auth.mjs';
import { s as serializeRow } from '../../../_/serializers.mjs';
import { g as getAccountBalance } from '../../../_/balances.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  var _a;
  const user = await requireUser(event);
  const id = (_a = getRouterParam(event, "id")) != null ? _a : "";
  const db = useDb();
  const [account] = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, user.id))).limit(1);
  if (!account) throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return {
    account: {
      ...serializeRow(account),
      balanceMinor: (await getAccountBalance(user.id, account.id)).toString()
    }
  };
});

export { _id__get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/accounts/_id_.get');
//# sourceMappingURL=_id_.get.mjs.map
