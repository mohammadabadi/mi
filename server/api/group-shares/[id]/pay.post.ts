import { and, eq } from 'drizzle-orm'
import { groupSharePaySchema } from '../../../../shared/schemas/finance'
import { groupExpenseShares, groupExpenses, groups, users } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readSchemaBody(event, groupSharePaySchema)
  const db = useDb()

  const [shareInfo] = await db
    .select({
      shareId: groupExpenseShares.id,
      amountMinor: groupExpenseShares.amountMinor,
      status: groupExpenseShares.status,
      expenseId: groupExpenses.id,
      title: groupExpenses.title,
      groupId: groups.id,
      groupName: groups.name,
      payerId: groupExpenses.payerId,
      payerName: users.name,
      shareUserId: groupExpenseShares.userId
    })
    .from(groupExpenseShares)
    .innerJoin(groupExpenses, eq(groupExpenses.id, groupExpenseShares.expenseId))
    .innerJoin(groups, eq(groups.id, groupExpenses.groupId))
    .innerJoin(users, eq(users.id, groupExpenses.payerId))
    .where(eq(groupExpenseShares.id, id))
    .limit(1)

  if (!shareInfo) throw createError({ statusCode: 404, statusMessage: 'سهم پرداختی پیدا نشد.' })
  const isShareOwner = shareInfo.shareUserId === user.id
  const isExpensePayer = shareInfo.payerId === user.id
  if (!isShareOwner && !isExpensePayer) {
    throw createError({ statusCode: 403, statusMessage: 'اجازه ثبت پرداخت این دنگ را ندارید.' })
  }
  if (shareInfo.status === 'paid') throw createError({ statusCode: 409, statusMessage: 'این دنگ قبلاً پرداخت شده است.' })

  const [share] = await db
    .update(groupExpenseShares)
    .set({
      status: 'paid',
      note: body.note,
      paidAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(groupExpenseShares.id, id))
    .returning()

  if (!share) throw createError({ statusCode: 500, statusMessage: 'ثبت پرداخت دنگ ناموفق بود.' })

  if (isShareOwner && shareInfo.payerId !== user.id) {
    await createNotification({
      userId: shareInfo.payerId,
      type: 'share_paid',
      title: 'دنگ پرداخت شد',
      body: `${user.name} دنگ ${shareInfo.title} را پرداخت کرد.`,
      data: { groupId: shareInfo.groupId, expenseId: shareInfo.expenseId, shareId: id }
    })
  }

  if (isExpensePayer && shareInfo.shareUserId !== user.id) {
    await createNotification({
      userId: shareInfo.shareUserId,
      type: 'share_paid',
      title: 'پرداخت دنگ تایید شد',
      body: `${user.name} پرداخت دنگ ${shareInfo.title} را تایید کرد.`,
      data: { groupId: shareInfo.groupId, expenseId: shareInfo.expenseId, shareId: id }
    })
  }

  return { share: serializeRow(share) }
})
