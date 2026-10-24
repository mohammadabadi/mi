import { count, desc, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
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
} from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userId = getRouterParam(event, 'id') ?? ''
  const db = useDb()
  const inviter = alias(users, 'inviter')

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) throw createError({ statusCode: 404, statusMessage: 'کاربر پیدا نشد.' })

  const [
    accountRows,
    categoryRows,
    transactionRows,
    transferRows,
    membershipRows,
    ownedGroupRows,
    invitationRows,
    notificationRows,
    [transactionSummary],
    [shareSummary],
    [groupExpenseTotal]
  ] = await Promise.all([
    db.select().from(accounts).where(eq(accounts.userId, userId)).orderBy(desc(accounts.createdAt)),
    db.select().from(categories).where(eq(categories.userId, userId)).orderBy(categories.type, categories.name),
    db
      .select({
        id: transactions.id,
        type: transactions.type,
        amountMinor: transactions.amountMinor,
        description: transactions.description,
        date: transactions.date,
        accountName: accounts.name,
        categoryName: categories.name,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .innerJoin(accounts, eq(accounts.id, transactions.accountId))
      .innerJoin(categories, eq(categories.id, transactions.categoryId))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(20),
    db.select().from(transfers).where(eq(transfers.userId, userId)).orderBy(desc(transfers.date), desc(transfers.createdAt)).limit(12),
    db
      .select({
        groupId: groups.id,
        groupName: groups.name,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groupMembers.joinedAt)),
    db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdAt: groups.createdAt
      })
      .from(groups)
      .where(eq(groups.ownerId, userId))
      .orderBy(desc(groups.createdAt)),
    db
      .select({
        id: groupInvitations.id,
        status: groupInvitations.status,
        groupName: groups.name,
        inviterName: inviter.name,
        createdAt: groupInvitations.createdAt,
        respondedAt: groupInvitations.respondedAt
      })
      .from(groupInvitations)
      .innerJoin(groups, eq(groups.id, groupInvitations.groupId))
      .innerJoin(inviter, eq(inviter.id, groupInvitations.inviterId))
      .where(eq(groupInvitations.inviteeId, userId))
      .orderBy(desc(groupInvitations.createdAt))
      .limit(15),
    db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        body: notifications.body,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt
      })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(15),
    db
      .select({
        transactionCount: count(),
        incomeMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountMinor} else 0 end), 0)`,
        expenseMinor: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountMinor} else 0 end), 0)`
      })
      .from(transactions)
      .where(eq(transactions.userId, userId)),
    db
      .select({
        pendingShares: sql<number>`count(*) filter (where ${groupExpenseShares.status} = 'pending')`,
        paidShares: sql<number>`count(*) filter (where ${groupExpenseShares.status} = 'paid')`,
        pendingMinor: sql<string>`coalesce(sum(case when ${groupExpenseShares.status} = 'pending' then ${groupExpenseShares.amountMinor} else 0 end), 0)`
      })
      .from(groupExpenseShares)
      .where(eq(groupExpenseShares.userId, userId)),
    db
      .select({ value: count() })
      .from(groupExpenses)
      .where(eq(groupExpenses.payerId, userId))
  ])

  const balances = await Promise.all(accountRows.map((account) => getAccountBalance(userId, account.id)))
  const accountsWithBalances = accountRows.map((account, index) => ({
    ...serializeRow(account),
    balanceMinor: balances[index]?.toString() ?? '0'
  }))

  return {
    user: serializeRow(user),
    summary: {
      accountCount: accountRows.length,
      categoryCount: categoryRows.length,
      transactionCount: transactionSummary?.transactionCount ?? 0,
      transferCount: transferRows.length,
      groupCount: membershipRows.length,
      ownedGroupCount: ownedGroupRows.length,
      paidGroupExpenseCount: groupExpenseTotal?.value ?? 0,
      incomeMinor: transactionSummary?.incomeMinor ?? '0',
      expenseMinor: transactionSummary?.expenseMinor ?? '0',
      pendingShares: shareSummary?.pendingShares ?? 0,
      paidShares: shareSummary?.paidShares ?? 0,
      pendingShareMinor: shareSummary?.pendingMinor ?? '0'
    },
    accounts: accountsWithBalances,
    categories: serializeRows(categoryRows),
    transactions: serializeRows(transactionRows),
    transfers: serializeRows(transferRows),
    memberships: serializeRows(membershipRows),
    ownedGroups: serializeRows(ownedGroupRows),
    invitations: serializeRows(invitationRows),
    notifications: serializeRows(notificationRows)
  }
})
