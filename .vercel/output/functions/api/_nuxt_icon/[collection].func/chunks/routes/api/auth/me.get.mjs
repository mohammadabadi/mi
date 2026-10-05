globalThis.__timing__.logStart('Load chunks/routes/api/auth/me.get');import { d as defineEventHandler } from '../../../_/nitro.mjs';
import { g as getCurrentUser } from '../../../_/auth.mjs';
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

const me_get = defineEventHandler(async (event) => {
  return { user: await getCurrentUser(event) };
});

export { me_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/auth/me.get');
//# sourceMappingURL=me.get.mjs.map
