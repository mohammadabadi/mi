import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { groupExpenseShares, groupExpenses, groupMembers, groups, users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id') ?? ''
  const { user, member } = await requireGroupMember(event, groupId)
  const db = useDb()

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1)
  if (!group) throw createError({ statusCode: 404, statusMessage: 'گروه پیدا نشد.' })

  const members = await db
    .select({
      id: groupMembers.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(desc(groupMembers.joinedAt))

  const visibleExpenseRows = await db
    .select({ expenseId: groupExpenseShares.expenseId })
    .from(groupExpenseShares)
    .innerJoin(groupExpenses, eq(groupExpenses.id, groupExpenseShares.expenseId))
    .where(and(
      eq(groupExpenses.groupId, groupId),
      eq(groupExpenseShares.userId, user.id)
    ))

  const visibleExpenseIds = visibleExpenseRows.map((row) => row.expenseId)

  const expenses = visibleExpenseIds.length
    ? await db
    .select({
      id: groupExpenses.id,
      title: groupExpenses.title,
      description: groupExpenses.description,
      amountMinor: groupExpenses.amountMinor,
      payerCardNumber: groupExpenses.payerCardNumber,
      payerCardNote: groupExpenses.payerCardNote,
      date: groupExpenses.date,
      splitMode: groupExpenses.splitMode,
      payerId: groupExpenses.payerId,
      creatorId: groupExpenses.creatorId,
      payerName: users.name,
      myShareId: sql<string>`max(case when ${groupExpenseShares.userId} = ${user.id} then ${groupExpenseShares.id}::text else null end)`,
      myShareMinor: sql<string>`coalesce(sum(case when ${groupExpenseShares.userId} = ${user.id} then ${groupExpenseShares.amountMinor} else 0 end), 0)`,
      myShareStatus: sql<string>`max(case when ${groupExpenseShares.userId} = ${user.id} then ${groupExpenseShares.status} else null end)`,
      paidCount: sql<number>`sum(case when ${groupExpenseShares.status} = 'paid' then 1 else 0 end)`,
      shareCount: sql<number>`count(${groupExpenseShares.id})`,
      createdAt: groupExpenses.createdAt
    })
    .from(groupExpenses)
    .innerJoin(users, eq(users.id, groupExpenses.payerId))
    .leftJoin(groupExpenseShares, eq(groupExpenseShares.expenseId, groupExpenses.id))
    .where(and(eq(groupExpenses.groupId, groupId), inArray(groupExpenses.id, visibleExpenseIds)))
    .groupBy(groupExpenses.id, users.name)
    .orderBy(desc(groupExpenses.date), desc(groupExpenses.createdAt))
    : []

  const expenseIds = expenses.map((expense) => expense.id)
  const shareRows = expenseIds.length
    ? await db
      .select({
        id: groupExpenseShares.id,
        expenseId: groupExpenseShares.expenseId,
        userId: groupExpenseShares.userId,
        userName: users.name,
        amountMinor: groupExpenseShares.amountMinor,
        status: groupExpenseShares.status,
        note: groupExpenseShares.note,
        paidAt: groupExpenseShares.paidAt
      })
      .from(groupExpenseShares)
      .innerJoin(users, eq(users.id, groupExpenseShares.userId))
      .where(inArray(groupExpenseShares.expenseId, expenseIds))
    : []

  type ShareRow = typeof shareRows[number]
  const sharesByExpense = shareRows.reduce<Record<string, ShareRow[]>>((acc, share) => {
    acc[share.expenseId] ??= []
    acc[share.expenseId]!.push(share)
    return acc
  }, {})

  const expensesWithShares = expenses.map((expense) => ({
    ...expense,
    shares: sharesByExpense[expense.id] ?? []
  }))

  const balances = await db
    .select({
      userId: users.id,
      name: users.name,
      receivableMinor: sql<string>`coalesce(sum(case when ${groupExpenses.payerId} = ${users.id} and ${groupExpenseShares.userId} <> ${users.id} and ${groupExpenseShares.status} = 'pending' then ${groupExpenseShares.amountMinor} else 0 end), 0)`,
      payableMinor: sql<string>`coalesce(sum(case when ${groupExpenseShares.userId} = ${users.id} and ${groupExpenses.payerId} <> ${users.id} and ${groupExpenseShares.status} = 'pending' then ${groupExpenseShares.amountMinor} else 0 end), 0)`
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .leftJoin(groupExpenseShares, eq(groupExpenseShares.userId, users.id))
    .leftJoin(groupExpenses, and(eq(groupExpenses.id, groupExpenseShares.expenseId), eq(groupExpenses.groupId, groupId)))
    .where(and(eq(groupMembers.groupId, groupId), eq(users.id, user.id)))
    .groupBy(users.id)

  return {
    group: serializeRow({ ...group, role: member.role }),
    members: serializeRows(members),
    expenses: serializeRows(expensesWithShares),
    balances: serializeRows(balances)
  }
})
