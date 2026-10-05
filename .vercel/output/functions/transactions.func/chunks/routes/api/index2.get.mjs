globalThis.__timing__.logStart('Load chunks/routes/api/index2.get');import { d as defineEventHandler } from '../../_/nitro.mjs';
import { r as requireUser, u as useDb, h as categories } from '../../_/auth.mjs';
import { a as serializeRows } from '../../_/serializers.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const db = useDb();
  const rows = await db.select().from(categories).where(and(eq(categories.userId, user.id), eq(categories.isArchived, false))).orderBy(categories.type, categories.name);
  return { categories: serializeRows(rows) };
});

export { index_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/index2.get');
//# sourceMappingURL=index2.get.mjs.map
