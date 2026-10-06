import { and, eq, inArray } from 'drizzle-orm'
import { groupExpenseCreateSchema } from '../../../../../shared/schemas/finance'
import { groupExpenseShares, groupExpenses, groupMembers, groups, users } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id') ?? ''
  await requireGroupMember(event, groupId)
  const body = await readSchemaBody(event, groupExpenseCreateSchema)
  const db = useDb()

  const memberRows = await db
    .select({ userId: groupMembers.userId, name: users.name })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))

  const memberIds = new Set(memberRows.map((member) => member.userId))
  const participantIds = [...new Set(body.participantIds)]

  if (!memberIds.has(body.payerId) || participantIds.some((id) => !memberIds.has(id))) {
    throw createError({ statusCode: 400, statusMessage: 'پرداخت‌کننده و افراد دنگ باید عضو گروه باشند.' })
  }

  const amount = BigInt(body.amountMinor)
  let shares: Array<{ userId: string; amountMinor: bigint; status: 'pending' | 'paid' }>

  if (body.splitMode === 'equal') {
    const count = BigInt(participantIds.length)
    const baseShare = amount / count
    let remainder = amount % count
    shares = participantIds.map((userId) => {
      const extra = remainder > BigInt(0) ? BigInt(1) : BigInt(0)
      remainder -= extra
      return {
        userId,
        amountMinor: baseShare + extra,
        status: userId === body.payerId ? 'paid' : 'pending'
      }
    })
  } else {
    if (!body.shares.length) throw createError({ statusCode: 400, statusMessage: 'برای تقسیم سفارشی سهم افراد را وارد کنید.' })
    const shareUserIds = new Set(body.shares.map((share) => share.userId))
    if (body.shares.some((share) => !memberIds.has(share.userId))) {
      throw createError({ statusCode: 400, statusMessage: 'همه افراد سهم باید عضو گروه باشند.' })
    }
    if (participantIds.some((id) => !shareUserIds.has(id))) {
      throw createError({ statusCode: 400, statusMessage: 'برای همه افراد انتخاب‌شده سهم وارد کنید.' })
    }
    const sum = body.shares.reduce((total, share) => total + BigInt(share.amountMinor), BigInt(0))
    if (sum !== amount) throw createError({ statusCode: 400, statusMessage: 'جمع سهم‌ها باید دقیقاً برابر مبلغ کل باشد.' })
    shares = body.shares.map((share) => ({
      userId: share.userId,
      amountMinor: BigInt(share.amountMinor),
      status: share.userId === body.payerId ? 'paid' : 'pending'
    }))
  }

  const [group] = await db.select({ name: groups.name }).from(groups).where(eq(groups.id, groupId)).limit(1)
  const [payer] = await db.select({ name: users.name }).from(users).where(eq(users.id, body.payerId)).limit(1)

  const [expense] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(groupExpenses).values({
      groupId,
      payerId: body.payerId,
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
