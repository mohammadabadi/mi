globalThis.__timing__.logStart('Load chunks/routes/api/index2.post');import { d as defineEventHandler, c as createError } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, h as categories } from '../../_/auth.mjs';
import { r as readSchemaBody, e as categoryCreateSchema } from '../../_/finance.mjs';
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
  const body = await readSchemaBody(event, categoryCreateSchema);
  const db = useDb();
  const [category] = await db.insert(categories).values({ ...body, userId: user.id }).returning();
  if (!category) throw createError({ statusCode: 500, statusMessage: "\u062B\u0628\u062A \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F." });
  return { category: serializeRow(category) };
});

export { index_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index2.post');
//# sourceMappingURL=index2.post.mjs.map
