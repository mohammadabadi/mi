import { and, desc, eq, sql } from 'drizzle-orm'
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

  const expenses = await db
    .select({
      id: groupExpenses.id,
      title: groupExpenses.title,
      description: groupExpenses.description,
      amountMinor: groupExpenses.amountMinor,
      date: groupExpenses.date,
      splitMode: groupExpenses.splitMode,
      payerId: groupExpenses.payerId,
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
    .where(eq(groupExpenses.groupId, groupId))
    .groupBy(groupExpenses.id, users.name)
    .orderBy(desc(groupExpenses.date), desc(groupExpenses.createdAt))

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
    .where(eq(groupMembers.groupId, groupId))
    .groupBy(users.id)

  return {
    group: serializeRow({ ...group, role: member.role }),
    members: serializeRows(members),
    expenses: serializeRows(expenses),
    balances: serializeRows(balances)
  }
})
