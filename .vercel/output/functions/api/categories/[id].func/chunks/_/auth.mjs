globalThis.__timing__.logStart('Load chunks/_/auth');import { c as createError, e as useRuntimeConfig, s as setCookie, f as getCookie, h as deleteCookie } from './nitro.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql, relations, eq, and, gt } from 'drizzle-orm';
import { pgTable, timestamp, date, varchar, bigint, uuid, index, text, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { randomBytes, createHash } from 'node:crypto';

const accountType = pgEnum("account_type", ["bank", "cash", "wallet", "credit_card", "other"]);
const categoryType = pgEnum("category_type", ["income", "expense"]);
const transactionType = pgEnum("transaction_type", ["income", "expense"]);
const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("sessions_user_id_idx").on(table.userId),
  tokenIdx: index("sessions_token_hash_idx").on(table.tokenHash)
}));
const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  type: accountType("type").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("IRR"),
  initialBalanceMinor: bigint("initial_balance_minor", { mode: "bigint" }).notNull().default(sql`0`),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("accounts_user_id_idx").on(table.userId)
}));
const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  type: categoryType("type").notNull(),
  icon: varchar("icon", { length: 40 }).notNull().default("circle"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("categories_user_id_idx").on(table.userId),
  typeIdx: index("categories_type_idx").on(table.type)
}));
const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  type: transactionType("type").notNull(),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  description: varchar("description", { length: 240 }).notNull().default(""),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("transactions_user_id_idx").on(table.userId),
  accountIdx: index("transactions_account_id_idx").on(table.accountId),
  categoryIdx: index("transactions_category_id_idx").on(table.categoryId),
  dateIdx: index("transactions_date_idx").on(table.date),
  typeIdx: index("transactions_type_idx").on(table.type)
}));
const transfers = pgTable("transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromAccountId: uuid("from_account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  toAccountId: uuid("to_account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  description: varchar("description", { length: 240 }).notNull().default(""),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("transfers_user_id_idx").on(table.userId),
  fromIdx: index("transfers_from_account_id_idx").on(table.fromAccountId),
  toIdx: index("transfers_to_account_id_idx").on(table.toAccountId),
  dateIdx: index("transfers_date_idx").on(table.date)
}));
const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  transfers: many(transfers),
  sessions: many(sessions)
}));

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  accountType: accountType,
  accounts: accounts,
  categories: categories,
  categoryType: categoryType,
  sessions: sessions,
  transactionType: transactionType,
  transactions: transactions,
  transfers: transfers,
  users: users,
  usersRelations: usersRelations
}, Symbol.toStringTag, { value: 'Module' }));

let client;
function useDb() {
  const config = useRuntimeConfig();
  const databaseUrl = config.databaseUrl;
  const hasPlaceholderUrl = [
    "USER:PASSWORD@HOST/DATABASE",
    "PROJECT_REF",
    "PASSWORD",
    "REGION"
  ].some((placeholder) => databaseUrl == null ? void 0 : databaseUrl.includes(placeholder));
  if (!databaseUrl || hasPlaceholderUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: "DATABASE_URL \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0645\u0642\u062F\u0627\u0631 \u0648\u0627\u0642\u0639\u06CC \u0627\u062A\u0635\u0627\u0644 Supabase/PostgreSQL \u0631\u0627 \u062F\u0631 \u0641\u0627\u06CC\u0644 .env \u0642\u0631\u0627\u0631 \u062F\u0647\u06CC\u062F \u0648 migration\u0647\u0627 \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F."
    });
  }
  client != null ? client : client = postgres(databaseUrl, { max: 1, prepare: false });
  return drizzle(client, { schema });
}

const SESSION_COOKIE = "mifin_session";
const SESSION_DAYS = 30;
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function createSessionToken() {
  return randomBytes(32).toString("base64url");
}
async function setUserSession(event, userId) {
  const db = useDb();
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1e3);
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt
  });
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: expiresAt
  });
}
async function clearUserSession(event) {
  const db = useDb();
  const token = getCookie(event, SESSION_COOKIE);
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  deleteCookie(event, SESSION_COOKIE, { path: "/" });
}
async function getCurrentUser(event) {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return null;
  const db = useDb();
  const [session] = await db.select({
    userId: sessions.userId,
    email: users.email,
    name: users.name,
    expiresAt: sessions.expiresAt
  }).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, /* @__PURE__ */ new Date()))).limit(1);
  if (!session) return null;
  return {
    id: session.userId,
    email: session.email,
    name: session.name
  };
}
async function requireUser(event) {
  const user = await getCurrentUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "\u0627\u0628\u062A\u062F\u0627 \u0648\u0627\u0631\u062F \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0634\u0648\u06CC\u062F." });
  }
  return user;
}
async function seedDefaultCategories(userId) {
  const db = useDb();
  await db.insert(categories).values([
    { userId, name: "\u062D\u0642\u0648\u0642", type: "income", icon: "wallet" },
    { userId, name: "\u0647\u062F\u06CC\u0647", type: "income", icon: "gift" },
    { userId, name: "\u062E\u0648\u0631\u0627\u06A9", type: "expense", icon: "utensils" },
    { userId, name: "\u062D\u0645\u0644 \u0648 \u0646\u0642\u0644", type: "expense", icon: "car" },
    { userId, name: "\u062E\u0631\u06CC\u062F", type: "expense", icon: "shopping-bag" },
    { userId, name: "\u0642\u0628\u0648\u0636", type: "expense", icon: "receipt" },
    { userId, name: "\u0633\u0631\u06AF\u0631\u0645\u06CC", type: "expense", icon: "music" }
  ]);
}
async function seedDefaultAccount(userId) {
  const db = useDb();
  await db.insert(accounts).values({
    userId,
    name: "\u062D\u0633\u0627\u0628 \u0627\u0635\u0644\u06CC",
    type: "bank",
    currency: "IRR",
    initialBalanceMinor: BigInt(0)
  });
}

export { transfers as a, accounts as b, users as c, clearUserSession as d, seedDefaultCategories as e, seedDefaultAccount as f, getCurrentUser as g, categories as h, requireUser as r, setUserSession as s, transactions as t, useDb as u };;globalThis.__timing__.logEnd('Load chunks/_/auth');
//# sourceMappingURL=auth.mjs.map
