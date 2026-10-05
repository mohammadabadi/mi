globalThis.__timing__.logStart('Load chunks/_/finance');import { r as readBody, c as createError, b as getQuery } from './nitro.mjs';
import { z } from 'zod';

async function readSchemaBody(event, schema) {
  const body = await readBody(event);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0627\u0631\u0633\u0627\u0644\u06CC \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A\u0646\u062F.",
      data: result.error.flatten()
    });
  }
  return result.data;
}
function parseSchemaQuery(event, schema) {
  const result = schema.safeParse(getQuery(event));
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "\u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u0641\u06CC\u0644\u062A\u0631 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A\u0646\u062F.",
      data: result.error.flatten()
    });
  }
  return result.data;
}

const accountTypeSchema = z.enum(["bank", "cash", "wallet", "credit_card", "other"]);
const categoryTypeSchema = z.enum(["income", "expense"]);
const transactionTypeSchema = z.enum(["income", "expense"]);
const positiveMinorUnit = z.string().trim().regex(/^\d+$/, "\u0645\u0628\u0644\u063A \u0628\u0627\u06CC\u062F \u0639\u062F\u062F \u0635\u062D\u06CC\u062D \u0645\u062B\u0628\u062A \u0628\u0627\u0634\u062F").refine((value) => BigInt(value) > BigInt(0), "\u0645\u0628\u0644\u063A \u0628\u0627\u06CC\u062F \u0645\u062B\u0628\u062A \u0628\u0627\u0634\u062F");
const nonNegativeMinorUnit = z.string().trim().regex(/^\d+$/, "\u0645\u0628\u0644\u063A \u0628\u0627\u06CC\u062F \u0639\u062F\u062F \u0635\u062D\u06CC\u062D \u0628\u0627\u0634\u062F");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "\u062A\u0627\u0631\u06CC\u062E \u0628\u0627\u06CC\u062F \u0645\u06CC\u0644\u0627\u062F\u06CC \u0648 \u0628\u0627 \u0642\u0627\u0644\u0628 YYYY-MM-DD \u0628\u0627\u0634\u062F");
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160).toLowerCase(),
  password: z.string().min(8).max(128)
});
const loginSchema = z.object({
  email: z.string().trim().email().max(160).toLowerCase(),
  password: z.string().min(8).max(128)
});
const accountCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: accountTypeSchema,
  currency: z.literal("IRR").default("IRR"),
  initialBalanceMinor: nonNegativeMinorUnit.default("0")
});
const accountUpdateSchema = accountCreateSchema.partial();
const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: categoryTypeSchema,
  icon: z.string().trim().min(1).max(40).default("circle")
});
const categoryUpdateSchema = categoryCreateSchema.partial();
const transactionCreateSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: transactionTypeSchema,
  amountMinor: positiveMinorUnit,
  date: isoDate,
  description: z.string().trim().max(240).optional().default("")
});
const transactionUpdateSchema = transactionCreateSchema.partial();
const transferCreateSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amountMinor: positiveMinorUnit,
  date: isoDate,
  description: z.string().trim().max(240).optional().default("")
}).refine((value) => value.fromAccountId !== value.toAccountId, {
  message: "\u062D\u0633\u0627\u0628 \u0645\u0628\u062F\u0627 \u0648 \u0645\u0642\u0635\u062F \u0628\u0627\u06CC\u062F \u0645\u062A\u0641\u0627\u0648\u062A \u0628\u0627\u0634\u0646\u062F",
  path: ["toAccountId"]
});
const transactionFilterSchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  type: transactionTypeSchema.optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).default("date_desc")
});

export { accountUpdateSchema as a, accountCreateSchema as b, registerSchema as c, categoryUpdateSchema as d, categoryCreateSchema as e, transactionFilterSchema as f, transactionCreateSchema as g, transferCreateSchema as h, loginSchema as l, parseSchemaQuery as p, readSchemaBody as r, transactionUpdateSchema as t };;globalThis.__timing__.logEnd('Load chunks/_/finance');
//# sourceMappingURL=finance.mjs.map
