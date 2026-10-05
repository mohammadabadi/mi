globalThis.__timing__.logStart('Load chunks/routes/api/auth/logout.post');import { d as defineEventHandler } from '../../../_/nitro.mjs';
import { d as clearUserSession } from '../../../_/auth.mjs';
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

const logout_post = defineEventHandler(async (event) => {
  await clearUserSession(event);
  return { ok: true };
});

export { logout_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/auth/logout.post');
//# sourceMappingURL=logout.post.mjs.map
