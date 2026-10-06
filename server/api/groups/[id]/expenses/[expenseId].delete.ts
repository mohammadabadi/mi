import { and, eq } from 'drizzle-orm'
import { groupExpenses } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id') ?? ''
  const expenseId = getRouterParam(event, 'expenseId') ?? ''
  const { user, member } = await requireGroupMember(event, groupId)
  const db = useDb()

  const [expense] = await db
    .select({
      id: groupExpenses.id,
      creatorId: groupExpenses.creatorId
    })
    .from(groupExpenses)
    .where(and(eq(groupExpenses.id, expenseId), eq(groupExpenses.groupId, groupId)))
    .limit(1)

  if (!expense) throw createError({ statusCode: 404, statusMessage: 'خرج گروهی پیدا نشد.' })
  if (expense.creatorId !== user.id && !canManageGroup(member.role)) {
    throw createError({ statusCode: 403, statusMessage: 'فقط ایجادکننده یا مدیر گروه می‌تواند این خرج را حذف کند.' })
  }

  await db.delete(groupExpenses).where(eq(groupExpenses.id, expenseId))
  return { ok: true }
})
