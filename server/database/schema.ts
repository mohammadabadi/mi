import { relations, sql } from 'drizzle-orm'
import { bigint, boolean, date, index, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const accountType = pgEnum('account_type', ['bank', 'cash', 'wallet', 'credit_card', 'other'])
export const categoryType = pgEnum('category_type', ['income', 'expense'])
export const transactionType = pgEnum('transaction_type', ['income', 'expense'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  email: varchar('email', { length: 160 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('sessions_user_id_idx').on(table.userId),
  tokenIdx: index('sessions_token_hash_idx').on(table.tokenHash)
}))

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 80 }).notNull(),
  type: accountType('type').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('IRR'),
  initialBalanceMinor: bigint('initial_balance_minor', { mode: 'bigint' }).notNull().default(sql`0`),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('accounts_user_id_idx').on(table.userId)
}))

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 80 }).notNull(),
  type: categoryType('type').notNull(),
  icon: varchar('icon', { length: 40 }).notNull().default('circle'),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('categories_user_id_idx').on(table.userId),
  typeIdx: index('categories_type_idx').on(table.type)
}))

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  type: transactionType('type').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  description: varchar('description', { length: 240 }).notNull().default(''),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('transactions_user_id_idx').on(table.userId),
  accountIdx: index('transactions_account_id_idx').on(table.accountId),
  categoryIdx: index('transactions_category_id_idx').on(table.categoryId),
  dateIdx: index('transactions_date_idx').on(table.date),
  typeIdx: index('transactions_type_idx').on(table.type)
}))

export const transfers = pgTable('transfers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fromAccountId: uuid('from_account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
  toAccountId: uuid('to_account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  description: varchar('description', { length: 240 }).notNull().default(''),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('transfers_user_id_idx').on(table.userId),
  fromIdx: index('transfers_from_account_id_idx').on(table.fromAccountId),
  toIdx: index('transfers_to_account_id_idx').on(table.toAccountId),
  dateIdx: index('transfers_date_idx').on(table.date)
}))

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  transfers: many(transfers),
  sessions: many(sessions)
}))
