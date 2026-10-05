globalThis.__timing__.logStart('Load chunks/routes/api/auth/login.post');import { d as defineEventHandler, c as createError } from '../../../_/nitro.mjs';
import { r as readSchemaBody, l as loginSchema } from '../../../_/finance.mjs';
import { u as useDb, c as users, s as setUserSession } from '../../../_/auth.mjs';
import bcrypt from 'bcryptjs';
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
import 'zod';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

const login_post = defineEventHandler(async (event) => {
  const body = await readSchemaBody(event, loginSchema);
  const db = useDb();
  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
  if (!user || !await bcrypt.compare(body.password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: "\u0627\u06CC\u0645\u06CC\u0644 \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A." });
  }
  await setUserSession(event, user.id);
  return { user: { id: user.id, name: user.name, email: user.email } };
});

export { login_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/auth/login.post');
//# sourceMappingURL=login.post.mjs.map
