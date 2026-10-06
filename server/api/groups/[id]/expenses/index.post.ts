import { eq, inArray } from 'drizzle-orm'
import { groupExpenseCreateSchema } from '../../../../../shared/schemas/finance'
import { groupExpenseShares, groupExpenses, groupMembers, groups, users } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id') ?? ''
  const { user } = await requireGroupMember(event, groupId)
  const body = await readSchemaBody(event, groupExpenseCreateSchema)
  const db = useDb()

  const memberRows = await db
    .select({ userId: groupMembers.userId, name: users.name })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))

  const memberIds = new Set(memberRows.map((member) => member.userId))
  const amount = BigInt(body.amountMinor)
  const shares = buildExpenseShares({
    splitMode: body.splitMode,
    amountMinor: amount,
    payerId: body.payerId,
    participantIds: body.participantIds,
    shares: body.shares,
    memberIds
  })

  const [group] = await db.select({ name: groups.name }).from(groups).where(eq(groups.id, groupId)).limit(1)
  const [payer] = await db.select({ name: users.name }).from(users).where(eq(users.id, body.payerId)).limit(1)

  const [expense] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(groupExpenses).values({
      groupId,
      payerId: body.payerId,
      creatorId: user.id,
      title: body.title,
      description: body.description,
      amountMinor: amount,
      date: body.date,
      splitMode: body.splitMode
    }).returning()

    if (!created) throw createError({ statusCode: 500, statusMessage: 'ثبت خرج گروهی ناموفق بود.' })

    await tx.insert(groupExpenseShares).values(shares.map((share) => ({
      expenseId: created.id,
      userId: share.userId,
      amountMinor: share.amountMinor,
      status: share.status,
      paidAt: share.status === 'paid' ? new Date() : null
    })))

    return [created]
  })

  if (!expense) throw createError({ statusCode: 500, statusMessage: 'ثبت خرج گروهی ناموفق بود.' })

  const pendingUserIds = shares.filter((share) => share.status === 'pending').map((share) => share.userId)
  const pendingMembers = pendingUserIds.length
    ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, pendingUserIds))
    : []

  await Promise.all(pendingMembers.map((member) => createNotification({
    userId: member.id,
    type: 'group_expense',
    title: 'دنگ جدید',
    body: `${payer?.name ?? 'یکی از اعضا'} در گروه ${group?.name ?? ''} خرج ${body.title} را ثبت کرد.`,
    data: { groupId, expenseId: expense.id }
  })))

  return { expense: serializeRow(expense) }
})
