import { z } from 'zod'

export const accountTypeSchema = z.enum(['bank', 'cash', 'wallet', 'credit_card', 'other'])
export const categoryTypeSchema = z.enum(['income', 'expense'])
export const transactionTypeSchema = z.enum(['income', 'expense'])

const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit)
    if (persianIndex >= 0) return String(persianIndex)
    const arabicIndex = arabicDigits.indexOf(digit)
    return arabicIndex >= 0 ? String(arabicIndex) : digit
  })
}

export function normalizePhone(value: string) {
  const normalized = toEnglishDigits(value).trim().replace(/[\s\-()]/g, '')
  if (normalized.startsWith('+98')) return `0${normalized.slice(3)}`
  if (normalized.startsWith('0098')) return `0${normalized.slice(4)}`
  if (normalized.startsWith('98') && normalized.length === 12) return `0${normalized.slice(2)}`
  if (normalized.startsWith('9') && normalized.length === 10) return `0${normalized}`
  return normalized
}

const emailSchema = z.string().trim().email().max(160).toLowerCase()
const phoneSchema = z.string()
  .transform(normalizePhone)
  .refine((value) => /^09\d{9}$/.test(value), 'شماره موبایل باید با قالب 09xxxxxxxxx باشد')
const loginIdentifierSchema = z.string()
  .trim()
  .min(3)
  .transform((value) => value.includes('@') ? value.toLowerCase() : normalizePhone(value))
  .refine((value) => z.string().email().safeParse(value).success || /^09\d{9}$/.test(value), 'ایمیل یا شماره موبایل معتبر وارد کنید')
const positiveMinorUnit = z.string().trim().regex(/^\d+$/, 'مبلغ باید عدد صحیح مثبت باشد').refine((value) => BigInt(value) > BigInt(0), 'مبلغ باید مثبت باشد')
const nonNegativeMinorUnit = z.string().trim().regex(/^\d+$/, 'مبلغ باید عدد صحیح باشد')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ باید میلادی و با قالب YYYY-MM-DD باشد')
const bankCardSchema = z.string()
  .transform((value) => toEnglishDigits(value).replace(/[\s-]/g, ''))
  .refine((value) => /^\d{16}$/.test(value), 'شماره کارت باید ۱۶ رقمی باشد')

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8).max(128)
})

export const loginSchema = z.object({
  identifier: loginIdentifierSchema,
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

export const groupCreateSchema = z.object({
  name: z.string().trim().min(2).max(90),
  description: z.string().trim().max(240).optional().default('')
})

export const userSearchSchema = z.object({
  q: z.string().trim().min(2).max(120)
})

export const groupInviteSchema = z.object({
  userId: z.string().uuid()
})

export const groupExpenseCreateSchema = z.object({
  payerId: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(240).optional().default(''),
  amountMinor: positiveMinorUnit,
  date: isoDate,
  splitMode: z.enum(['equal', 'custom']).default('equal'),
  participantIds: z.array(z.string().uuid()).min(1).max(30),
  shares: z.array(z.object({
    userId: z.string().uuid(),
    amountMinor: positiveMinorUnit
  })).max(30).optional().default([])
})

export const groupExpenseSharesUpdateSchema = z.object({
  splitMode: z.enum(['equal', 'custom']).default('equal'),
  participantIds: z.array(z.string().uuid()).min(1).max(30),
  shares: z.array(z.object({
    userId: z.string().uuid(),
    amountMinor: positiveMinorUnit
  })).max(30).optional().default([])
})

export const groupExpenseCardSchema = z.object({
  cardNumber: bankCardSchema,
  note: z.string().trim().max(160).optional().default('')
})

export const groupSharePaySchema = z.object({
  accountId: z.string().uuid().optional(),
  note: z.string().trim().max(240).optional().default('')
})
