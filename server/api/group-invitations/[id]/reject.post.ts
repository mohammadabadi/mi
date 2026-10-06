import { and, eq } from 'drizzle-orm'
import { groupInvitations } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()

  const [invitation] = await db
    .update(groupInvitations)
    .set({
      status: 'rejected',
      respondedAt: new Date()
    })
    .where(and(eq(groupInvitations.id, id), eq(groupInvitations.inviteeId, user.id), eq(groupInvitations.status, 'pending')))
    .returning()

  if (!invitation) throw createError({ statusCode: 404, statusMessage: 'دعوت فعالی پیدا نشد.' })

  return { rejected: true }
})
