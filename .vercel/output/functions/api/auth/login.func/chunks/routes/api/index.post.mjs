globalThis.__timing__.logStart('Load chunks/routes/api/index.post');import { d as defineEventHandler, c as createError } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts } from '../../_/auth.mjs';
import { r as readSchemaBody, b as accountCreateSchema } from '../../_/finance.mjs';
import { s as serializeRow } from '../../_/serializers.mjs';
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
import 'drizzle-orm';
import 'drizzle-orm/pg-core';
import 'zod';

const index_post = defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readSchemaBody(event, accountCreateSchema);
  const db = useDb();
  const [account] = await db.insert(accounts).values({
    userId: user.id,
    name: body.name,
    type: body.type,
    currency: body.currency,
    initialBalanceMinor: BigInt(body.initialBalanceMinor)
  }).returning();
  if (!account) throw createError({ statusCode: 500, statusMessage: "\u062B\u0628\u062A \u062D\u0633\u0627\u0628 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F." });
  return { account: { ...serializeRow(account), balanceMinor: account.initialBalanceMinor.toString() } };
});

export { index_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index.post');
//# sourceMappingURL=index.post.mjs.map
