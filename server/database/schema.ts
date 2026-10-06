import { relations, sql } from 'drizzle-orm'
import { bigint, boolean, date, index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

export const accountType = pgEnum('account_type', ['bank', 'cash', 'wallet', 'credit_card', 'other'])
export const categoryType = pgEnum('category_type', ['income', 'expense'])
export const transactionType = pgEnum('transaction_type', ['income', 'expense'])
export const groupRole = pgEnum('group_role', ['owner', 'admin', 'member'])
export const groupInvitationStatus = pgEnum('group_invitation_status', ['pending', 'accepted', 'rejected'])
export const groupExpenseSplitMode = pgEnum('group_expense_split_mode', ['equal', 'custom'])
export const groupShareStatus = pgEnum('group_share_status', ['pending', 'paid'])
export const notificationType = pgEnum('notification_type', ['group_invite', 'group_expense', 'share_paid'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  email: varchar('email', { length: 160 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).unique(),
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

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 90 }).notNull(),
  description: varchar('description', { length: 240 }).notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  ownerIdx: index('groups_owner_id_idx').on(table.ownerId)
}))

export const groupMembers = pgTable('group_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: groupRole('role').notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  groupIdx: index('group_members_group_id_idx').on(table.groupId),
  userIdx: index('group_members_user_id_idx').on(table.userId),
  groupUserUnique: uniqueIndex('group_members_group_user_unique').on(table.groupId, table.userId)
}))

export const groupInvitations = pgTable('group_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  inviterId: uuid('inviter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  inviteeId: uuid('invitee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: groupInvitationStatus('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  respondedAt: timestamp('responded_at', { withTimezone: true })
}, (table) => ({
  groupIdx: index('group_invitations_group_id_idx').on(table.groupId),
  inviteeIdx: index('group_invitations_invitee_id_idx').on(table.inviteeId),
  groupInviteeUnique: uniqueIndex('group_invitations_group_invitee_unique').on(table.groupId, table.inviteeId)
}))

export const groupExpenses = pgTable('group_expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  payerId: uuid('payer_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 120 }).notNull(),
  description: varchar('description', { length: 240 }).notNull().default(''),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  date: date('date').notNull(),
  splitMode: groupExpenseSplitMode('split_mode').notNull().default('equal'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  groupIdx: index('group_expenses_group_id_idx').on(table.groupId),
  payerIdx: index('group_expenses_payer_id_idx').on(table.payerId),
  dateIdx: index('group_expenses_date_idx').on(table.date)
}))

export const groupExpenseShares = pgTable('group_expense_shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  expenseId: uuid('expense_id').notNull().references(() => groupExpenses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  status: groupShareStatus('status').notNull().default('pending'),
  note: varchar('note', { length: 240 }).notNull().default(''),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  expenseIdx: index('group_expense_shares_expense_id_idx').on(table.expenseId),
  userIdx: index('group_expense_shares_user_id_idx').on(table.userId),
  expenseUserUnique: uniqueIndex('group_expense_shares_expense_user_unique').on(table.expenseId, table.userId)
}))

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationType('type').notNull(),
  title: varchar('title', { length: 140 }).notNull(),
  body: varchar('body', { length: 320 }).notNull().default(''),
  data: text('data').notNull().default('{}'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('notifications_user_id_idx').on(table.userId),
  readIdx: index('notifications_is_read_idx').on(table.isRead)
}))

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  transfers: many(transfers),
  sessions: many(sessions),
  ownedGroups: many(groups),
  groupMemberships: many(groupMembers),
  notifications: many(notifications)
}))
