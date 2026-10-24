import { count, desc, eq, inArray, sql } from 'drizzle-orm'
import {
  accounts,
  categories,
  groupExpenseShares,
  groupExpenses,
  groupInvitations,
  groupMembers,
  groups,
  notifications,
  transactions,
  transfers,
  users
} from '../../database/schema'

function countMap(rows: Array<{ userId: string; value: number }>) {
  return new Map(rows.map((row) => [row.userId, Number(row.value)]))
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const [
    [userTotal],
    [accountTotal],
    [transactionTotal],
    [transferTotal],
    [groupTotal],
    [groupExpenseTotal],
    [pendingShareTotal],
    [notificationTotal],
    [moneyTotals],
    recentUsers,
    recentTransactions,
    recentGroups
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(accounts),
    db.select({ value: count() }).from(transactions),
    db.select({ value: count() }).from(transfers),
    db.select({ value: count() }).from(groups),
    db.select({ value: count() }).from(groupExpenses),
    db.select({ value: count() }).from(groupExpenseShares).where(eq(groupExpenseShares.status, 'pending')),
    db.select({ value: count() }).from(notifications),
    db.select({
      incomeMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountMinor} else 0 end), 0)`,
      expenseMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountMinor} else 0 end), 0)`
    }).from(transactions),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(25),
    db
      .select({
        id: transactions.id,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        type: transactions.type,
        amountMinor: transactions.amountMinor,
        description: transactions.description,
        date: transactions.date,
        accountName: accounts.name,
        categoryName: categories.name
      })
      .from(transactions)
      .innerJoin(users, eq(users.id, transactions.userId))
      .innerJoin(accounts, eq(accounts.id, transactions.accountId))
      .innerJoin(categories, eq(categories.id, transactions.categoryId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(12),
    db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        ownerName: users.name,
        ownerEmail: users.email,
        createdAt: groups.createdAt
      })
      .from(groups)
      .innerJoin(users, eq(users.id, groups.ownerId))
      .orderBy(desc(groups.createdAt))
      .limit(10)
  ])

  const userIds = recentUsers.map((user) => user.id)
  const [accountCounts, transactionCounts, membershipCounts] = userIds.length
    ? await Promise.all([
      db.select({ userId: accounts.userId, value: count() }).from(accounts).where(inArray(accounts.userId, userIds)).groupBy(accounts.userId),
      db.select({ userId: transactions.userId, value: count() }).from(transactions).where(inArray(transactions.userId, userIds)).groupBy(transactions.userId),
      db.select({ userId: groupMembers.userId, value: count() }).from(groupMembers).where(inArray(groupMembers.userId, userIds)).groupBy(groupMembers.userId)
    ])
    : [[], [], []]

  const accountCountByUser = countMap(accountCounts)
  const transactionCountByUser = countMap(transactionCounts)
  const membershipCountByUser = countMap(membershipCounts)

  return {
    summary: {
      users: userTotal?.value ?? 0,
      accounts: accountTotal?.value ?? 0,
      transactions: transactionTotal?.value ?? 0,
      transfers: transferTotal?.value ?? 0,
      groups: groupTotal?.value ?? 0,
      groupExpenses: groupExpenseTotal?.value ?? 0,
      pendingShares: pendingShareTotal?.value ?? 0,
      notifications: notificationTotal?.value ?? 0,
      incomeMinor: moneyTotals?.incomeMinor ?? '0',
      expenseMinor: moneyTotals?.expenseMinor ?? '0'
    },
    users: recentUsers.map((user) => ({
      ...serializeRow(user),
      accountCount: accountCountByUser.get(user.id) ?? 0,
      transactionCount: transactionCountByUser.get(user.id) ?? 0,
      groupCount: membershipCountByUser.get(user.id) ?? 0
    })),
    recentTransactions: serializeRows(recentTransactions),
    recentGroups: serializeRows(recentGroups)
  }
})
