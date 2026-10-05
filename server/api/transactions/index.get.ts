import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { transactionFilterSchema } from '../../../shared/schemas/finance'
import { accounts, categories, transactions, transfers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = parseSchemaQuery(event, transactionFilterSchema)
  const db = useDb()
  const fromAccounts = alias(accounts, 'from_accounts')
  const toAccounts = alias(accounts, 'to_accounts')
  const filters = [eq(transactions.userId, user.id)]
  const transferFilters = [eq(transfers.userId, user.id)]

  if (query.from) filters.push(gte(transactions.date, query.from))
  if (query.to) filters.push(lte(transactions.date, query.to))
  if (query.type) filters.push(eq(transactions.type, query.type))
  if (query.accountId) filters.push(eq(transactions.accountId, query.accountId))
  if (query.categoryId) filters.push(eq(transactions.categoryId, query.categoryId))
  if (query.search) filters.push(ilike(transactions.description, `%${query.search}%`))

  if (query.from) transferFilters.push(gte(transfers.date, query.from))
  if (query.to) transferFilters.push(lte(transfers.date, query.to))
  if (query.accountId) transferFilters.push(or(eq(transfers.fromAccountId, query.accountId), eq(transfers.toAccountId, query.accountId))!)
  if (query.search) transferFilters.push(ilike(transfers.description, `%${query.search}%`))

  const orderBy = query.sort === 'date_asc'
    ? asc(transactions.date)
    : query.sort === 'amount_desc'
      ? desc(transactions.amountMinor)
      : query.sort === 'amount_asc'
        ? asc(transactions.amountMinor)
        : desc(transactions.date)

  const whereClause = and(...filters)
  const transferWhereClause = and(...transferFilters)
  const offset = (query.page - 1) * query.limit
  const [total] = await db.select({ value: count() }).from(transactions).where(whereClause)
  const includeTransfers = !query.type && !query.categoryId
  const [transferTotal] = includeTransfers
    ? await db.select({ value: count() }).from(transfers).where(transferWhereClause)
    : [{ value: 0 }]

  const transactionRows = await db
    .select({
      id: transactions.id,
      kind: sql<string>`'transaction'`,
      type: transactions.type,
      amountMinor: transactions.amountMinor,
      description: transactions.description,
      date: transactions.date,
      accountId: transactions.accountId,
      accountName: accounts.name,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      createdAt: transactions.createdAt
    })
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(whereClause)
    .orderBy(orderBy, sql`${transactions.createdAt} desc`)
    .limit(query.limit + offset)

  const transferRows = includeTransfers
    ? await db
      .select({
        id: transfers.id,
        kind: sql<string>`'transfer'`,
        type: sql<string>`'transfer'`,
        amountMinor: transfers.amountMinor,
        description: transfers.description,
        date: transfers.date,
        accountId: transfers.fromAccountId,
        accountName: sql<string>`${fromAccounts.name} || ' -> ' || ${toAccounts.name}`,
        categoryId: sql<string>`null`,
        categoryName: sql<string>`'انتقال'`,
        categoryIcon: sql<string>`'arrow-left-right'`,
        createdAt: transfers.createdAt,
        fromAccountId: transfers.fromAccountId,
        fromAccountName: fromAccounts.name,
        toAccountId: transfers.toAccountId,
        toAccountName: toAccounts.name
      })
      .from(transfers)
      .innerJoin(fromAccounts, eq(fromAccounts.id, transfers.fromAccountId))
      .innerJoin(toAccounts, eq(toAccounts.id, transfers.toAccountId))
      .where(transferWhereClause)
      .orderBy(
        query.sort === 'date_asc'
          ? asc(transfers.date)
          : query.sort === 'amount_desc'
            ? desc(transfers.amountMinor)
            : query.sort === 'amount_asc'
              ? asc(transfers.amountMinor)
              : desc(transfers.date),
        sql`${transfers.createdAt} desc`
      )
      .limit(query.limit + offset)
    : []

  const rows = [...transactionRows, ...transferRows]
    .sort((left, right) => {
      if (query.sort === 'amount_desc' || query.sort === 'amount_asc') {
        const leftAmount = BigInt(left.amountMinor)
        const rightAmount = BigInt(right.amountMinor)
        if (leftAmount !== rightAmount) {
          return query.sort === 'amount_desc'
            ? leftAmount > rightAmount ? -1 : 1
            : leftAmount > rightAmount ? 1 : -1
        }
      }

      const leftDate = new Date(left.date).getTime()
      const rightDate = new Date(right.date).getTime()
      if (leftDate !== rightDate) return query.sort === 'date_asc' ? leftDate - rightDate : rightDate - leftDate

      return new Date(String(right.createdAt)).getTime() - new Date(String(left.createdAt)).getTime()
    })
    .slice(offset, offset + query.limit)

  return {
    transactions: serializeRows(rows),
    pagination: { page: query.page, limit: query.limit, total: (total?.value ?? 0) + (transferTotal?.value ?? 0) }
  }
})
