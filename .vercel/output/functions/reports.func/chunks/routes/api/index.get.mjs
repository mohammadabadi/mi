globalThis.__timing__.logStart('Load chunks/routes/api/index.get');import { d as defineEventHandler } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts } from '../../_/auth.mjs';
import { s as serializeRow } from '../../_/serializers.mjs';
import { g as getAccountBalance } from '../../_/balances.mjs';
import { and, eq, isNull } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const db = useDb();
  const rows = await db.select().from(accounts).where(and(eq(accounts.userId, user.id), isNull(accounts.archivedAt))).orderBy(accounts.createdAt);
  const withBalances = await Promise.all(rows.map(async (account) => ({
    ...serializeRow(account),
    balanceMinor: (await getAccountBalance(user.id, account.id)).toString()
  })));
  return { accounts: withBalances };
});

export { index_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index.get');
//# sourceMappingURL=index.get.mjs.map
