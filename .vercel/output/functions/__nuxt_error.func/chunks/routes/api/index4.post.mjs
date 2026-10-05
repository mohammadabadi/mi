globalThis.__timing__.logStart('Load chunks/routes/api/index4.post');import { d as defineEventHandler, c as createError } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, b as accounts, a as transfers } from '../../_/auth.mjs';
import { r as readSchemaBody, h as transferCreateSchema } from '../../_/finance.mjs';
import { g as getAccountBalance } from '../../_/balances.mjs';
import { s as serializeRow } from '../../_/serializers.mjs';
import { eq } from 'drizzle-orm';
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
  const body = await readSchemaBody(event, transferCreateSchema);
  const db = useDb();
  const userAccounts = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.userId, user.id));
  const accountIds = new Set(userAccounts.map((account) => account.id));
  if (!accountIds.has(body.fromAccountId) || !accountIds.has(body.toAccountId)) {
    throw createError({ statusCode: 404, statusMessage: "\u062D\u0633\u0627\u0628 \u0645\u0628\u062F\u0627 \u06CC\u0627 \u0645\u0642\u0635\u062F \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  }
  const balance = await getAccountBalance(user.id, body.fromAccountId);
  if (balance < BigInt(body.amountMinor)) {
    throw createError({ statusCode: 409, statusMessage: "\u0645\u0648\u062C\u0648\u062F\u06CC \u062D\u0633\u0627\u0628 \u0645\u0628\u062F\u0627 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A." });
  }
  const [transfer] = await db.transaction(async (tx) => {
    return tx.insert(transfers).values({
      userId: user.id,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amountMinor: BigInt(body.amountMinor),
      description: body.description,
      date: body.date
    }).returning();
  });
  if (!transfer) throw createError({ statusCode: 500, statusMessage: "\u062B\u0628\u062A \u0627\u0646\u062A\u0642\u0627\u0644 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F." });
  return { transfer: serializeRow(transfer) };
});

export { index_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index4.post');
//# sourceMappingURL=index4.post.mjs.map
