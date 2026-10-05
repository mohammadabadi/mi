import { z } from 'zod'

export const accountTypeSchema = z.enum(['bank', 'cash', 'wallet', 'credit_card', 'other'])
export const categoryTypeSchema = z.enum(['income', 'expense'])
export const transactionTypeSchema = z.enum(['income', 'expense'])

const positiveMinorUnit = z.string().trim().regex(/^\d+$/, 'مبلغ باید عدد صحیح مثبت باشد').refine((value) => BigInt(value) > BigInt(0), 'مبلغ باید مثبت باشد')
const nonNegativeMinorUnit = z.string().trim().regex(/^\d+$/, 'مبلغ باید عدد صحیح باشد')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ باید میلادی و با قالب YYYY-MM-DD باشد')

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160).toLowerCase(),
  password: z.string().min(8).max(128)
})

export const loginSchema = z.object({
  email: z.string().trim().email().max(160).toLowerCase(),
  password: z.string().min(8).max(128)
})

export const accountCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: accountTypeSchema,
  currency: z.literal('IRR').default('IRR'),
  initialBalanceMinor: nonNegativeMinorUnit.default('0')
})

export const accountUpdateSchema = accountCreateSchema.partial()

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: categoryTypeSchema,
  icon: z.string().trim().min(1).max(40).default('circle')
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export const transactionCreateSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: transactionTypeSchema,
  amountMinor: positiveMinorUnit,
  date: isoDate,
  description: z.string().trim().max(240).optional().default('')
})

export const transactionUpdateSchema = transactionCreateSchema.partial()

export const transferCreateSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amountMinor: positiveMinorUnit,
  date: isoDate,
  description: z.string().trim().max(240).optional().default('')
}).refine((value) => value.fromAccountId !== value.toAccountId, {
  message: 'حساب مبدا و مقصد باید متفاوت باشند',
  path: ['toAccountId']
})

export const transactionFilterSchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  type: transactionTypeSchema.optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).default('date_desc')
})
