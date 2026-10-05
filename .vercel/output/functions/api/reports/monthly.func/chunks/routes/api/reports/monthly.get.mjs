globalThis.__timing__.logStart('Load chunks/routes/api/reports/monthly.get');import { d as defineEventHandler } from '../../../_/nitro.mjs';
import { r as requireUser, u as useDb, t as transactions } from '../../../_/auth.mjs';
import { sql, eq } from 'drizzle-orm';
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

const monthly_get = defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const db = useDb();
  const rows = await db.select({
    month: sql`to_char(${transactions.date}, 'YYYY-MM')`,
    incomeMinor: sql`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountMinor} else 0 end), 0)`,
    expenseMinor: sql`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountMinor} else 0 end), 0)`
  }).from(transactions).where(eq(transactions.userId, user.id)).groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`).orderBy(sql`to_char(${transactions.date}, 'YYYY-MM') desc`).limit(24);
  return {
    rows: rows.map((row) => ({
      ...row,
      netMinor: (BigInt(row.incomeMinor) - BigInt(row.expenseMinor)).toString()
    }))
  };
});

export { monthly_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/reports/monthly.get');
//# sourceMappingURL=monthly.get.mjs.map
