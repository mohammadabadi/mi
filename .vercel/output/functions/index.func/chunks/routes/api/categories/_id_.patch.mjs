globalThis.__timing__.logStart('Load chunks/routes/api/categories/_id_.patch');import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, h as categories } from '../../../_/auth.mjs';
import { r as readSchemaBody, d as categoryUpdateSchema } from '../../../_/finance.mjs';
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
  const body = await readSchemaBody(event, categoryUpdateSchema);
  const db = useDb();
  const [category] = await db.update(categories).set({ ...body, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(categories.id, id), eq(categories.userId, user.id))).returning();
  if (!category) throw createError({ statusCode: 404, statusMessage: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
  return { category: serializeRow(category) };
});

export { _id__patch as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/categories/_id_.patch');
//# sourceMappingURL=_id_.patch.mjs.map
