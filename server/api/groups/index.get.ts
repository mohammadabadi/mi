import { and, count, desc, eq, sql } from 'drizzle-orm'
import { groupExpenseShares, groupExpenses, groupMembers, groups } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()

  const memberships = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      ownerId: groups.ownerId,
      role: groupMembers.role,
      createdAt: groups.createdAt
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, user.id))
    .orderBy(desc(groups.createdAt))

  const rows = await Promise.all(memberships.map(async (group) => {
    const [memberCount] = await db.select({ value: count() }).from(groupMembers).where(eq(groupMembers.groupId, group.id))
    const [pending] = await db
      .select({ value: sql<string>`coalesce(sum(${groupExpenseShares.amountMinor}), 0)` })
      .from(groupExpenseShares)
      .innerJoin(groupExpenses, eq(groupExpenses.id, groupExpenseShares.expenseId))
      .where(and(eq(groupExpenseShares.userId, user.id), eq(groupExpenseShares.status, 'pending'), eq(groupExpenses.groupId, group.id)))

    return {
      ...group,
      memberCount: memberCount?.value ?? 0,
      myPendingMinor: pending?.value ?? '0'
    }
  }))

  return { groups: serializeRows(rows) }
})
