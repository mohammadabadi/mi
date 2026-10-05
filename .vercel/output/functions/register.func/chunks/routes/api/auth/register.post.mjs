globalThis.__timing__.logStart('Load chunks/routes/api/auth/register.post');import { d as defineEventHandler, c as createError } from '../../../_/nitro.mjs';
import { r as readSchemaBody, c as registerSchema } from '../../../_/finance.mjs';
import { u as useDb, c as users, e as seedDefaultCategories, f as seedDefaultAccount, s as setUserSession } from '../../../_/auth.mjs';
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

const register_post = defineEventHandler(async (event) => {
  const body = await readSchemaBody(event, registerSchema);
  const db = useDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "\u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0634\u062F\u0647 \u0627\u0633\u062A." });
  }
  const passwordHash = await bcrypt.hash(body.password, 12);
  const [user] = await db.insert(users).values({
    name: body.name,
    email: body.email,
    passwordHash
  }).returning({ id: users.id, name: users.name, email: users.email });
  if (!user) throw createError({ statusCode: 500, statusMessage: "\u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F." });
  await seedDefaultCategories(user.id);
  await seedDefaultAccount(user.id);
  await setUserSession(event, user.id);
  return { user };
});

export { register_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/auth/register.post');
//# sourceMappingURL=register.post.mjs.map
