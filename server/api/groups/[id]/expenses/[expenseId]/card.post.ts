import { and, eq } from 'drizzle-orm'
import { groupExpenseCardSchema } from '../../../../../../shared/schemas/finance'
import { groupExpenseShares, groupExpenses, groups } from '../../../../../database/schema'

function formatCardNumber(cardNumber: string) {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1-')
}

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id') ?? ''
  const expenseId = getRouterParam(event, 'expenseId') ?? ''
  const { user } = await requireGroupMember(event, groupId)
  const body = await readSchemaBody(event, groupExpenseCardSchema)
  const db = useDb()

  const [expense] = await db
    .select({
      id: groupExpenses.id,
      title: groupExpenses.title,
      payerId: groupExpenses.payerId,
      groupName: groups.name
    })
    .from(groupExpenses)
    .innerJoin(groups, eq(groups.id, groupExpenses.groupId))
    .where(and(eq(groupExpenses.id, expenseId), eq(groupExpenses.groupId, groupId)))
    .limit(1)

  if (!expense) throw createError({ statusCode: 404, statusMessage: 'خرج گروهی پیدا نشد.' })
  if (expense.payerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'فقط پرداخت‌کننده خرج می‌تواند شماره کارت ارسال کند.' })
  }

  const pendingShares = await db
    .select({ userId: groupExpenseShares.userId })
    .from(groupExpenseShares)
    .where(and(
      eq(groupExpenseShares.expenseId, expenseId),
      eq(groupExpenseShares.status, 'pending')
    ))

  const recipients = pendingShares.filter((share) => share.userId !== user.id)
  const formattedCard = formatCardNumber(body.cardNumber)

  await db.update(groupExpenses)
    .set({
      payerCardNumber: formattedCard,
      payerCardNote: body.note,
      updatedAt: new Date()
    })
    .where(eq(groupExpenses.id, expenseId))

  await Promise.all(recipients.map((recipient) => createNotification({
    userId: recipient.userId,
    type: 'card_shared',
    title: 'شماره کارت پرداخت‌کننده',
    body: `${user.name} برای خرج ${expense.title} شماره کارت ${formattedCard} را ارسال کرد.${body.note ? ` ${body.note}` : ''}`,
    data: { groupId, expenseId, cardNumber: formattedCard }
  })))

  return { ok: true, notifiedCount: recipients.length }
})
