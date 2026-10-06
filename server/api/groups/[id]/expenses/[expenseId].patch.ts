import { and, eq, inArray } from 'drizzle-orm'
import { groupExpenseSharesUpdateSchema } from '../../../../../shared/schemas/finance'
import { groupExpenseShares, groupExpenses, groupMembers, groups, users } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id') ?? ''
  const expenseId = getRouterParam(event, 'expenseId') ?? ''
  const { user, member } = await requireGroupMember(event, groupId)
  const body = await readSchemaBody(event, groupExpenseSharesUpdateSchema)
  const db = useDb()

  const [expense] = await db
    .select({
      id: groupExpenses.id,
      groupId: groupExpenses.groupId,
      payerId: groupExpenses.payerId,
      creatorId: groupExpenses.creatorId,
      amountMinor: groupExpenses.amountMinor,
      title: groupExpenses.title
    })
    .from(groupExpenses)
    .where(and(eq(groupExpenses.id, expenseId), eq(groupExpenses.groupId, groupId)))
    .limit(1)

  if (!expense) throw createError({ statusCode: 404, statusMessage: 'خرج گروهی پیدا نشد.' })
  if (expense.creatorId !== user.id && !canManageGroup(member.role)) {
    throw createError({ statusCode: 403, statusMessage: 'فقط ایجادکننده یا مدیر گروه می‌تواند سهم‌های خرج را ویرایش کند.' })
  }

  const memberRows = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId))

  const memberIds = new Set(memberRows.map((item) => item.userId))
  const shares = buildExpenseShares({
    splitMode: body.splitMode,
    amountMinor: expense.amountMinor,
    payerId: expense.payerId,
    participantIds: body.participantIds,
    shares: body.shares,
    memberIds
  })

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx.update(groupExpenses)
      .set({ splitMode: body.splitMode, updatedAt: new Date() })
      .where(eq(groupExpenses.id, expenseId))
      .returning()

    await tx.delete(groupExpenseShares).where(eq(groupExpenseShares.expenseId, expenseId))
    await tx.insert(groupExpenseShares).values(shares.map((share) => ({
      expenseId,
      userId: share.userId,
      amountMinor: share.amountMinor,
      status: share.status,
      paidAt: share.status === 'paid' ? new Date() : null
    })))

    return row
  })

  if (!updated) throw createError({ statusCode: 500, statusMessage: 'به‌روزرسانی خرج گروهی ناموفق بود.' })

  const pendingUserIds = shares.filter((share) => share.status === 'pending').map((share) => share.userId)
  const [group] = await db.select({ name: groups.name }).from(groups).where(eq(groups.id, groupId)).limit(1)
  const pendingMembers = pendingUserIds.length
    ? await db.select({ id: users.id }).from(users).where(inArray(users.id, pendingUserIds))
    : []

  await Promise.all(pendingMembers.map((pendingMember) => createNotification({
    userId: pendingMember.id,
    type: 'group_expense',
    title: 'دنگ به‌روزرسانی شد',
    body: `سهم‌های خرج ${expense.title} در گروه ${group?.name ?? ''} به‌روزرسانی شد.`,
    data: { groupId, expenseId }
  })))

  return { expense: serializeRow(updated) }
})
