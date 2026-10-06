import { and, eq } from 'drizzle-orm'
import { groupInvitations, groupMembers, groups } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()

  const [invitation] = await db
    .select({
      id: groupInvitations.id,
      groupId: groupInvitations.groupId,
      status: groupInvitations.status,
      groupName: groups.name
    })
    .from(groupInvitations)
    .innerJoin(groups, eq(groups.id, groupInvitations.groupId))
    .where(and(eq(groupInvitations.id, id), eq(groupInvitations.inviteeId, user.id)))
    .limit(1)

  if (!invitation) throw createError({ statusCode: 404, statusMessage: 'دعوت پیدا نشد.' })
  if (invitation.status !== 'pending') throw createError({ statusCode: 409, statusMessage: 'این دعوت قبلاً پاسخ داده شده است.' })

  await db.transaction(async (tx) => {
    await tx.insert(groupMembers).values({
      groupId: invitation.groupId,
      userId: user.id,
      role: 'member'
    }).onConflictDoNothing()

    await tx.update(groupInvitations).set({
      status: 'accepted',
      respondedAt: new Date()
    }).where(eq(groupInvitations.id, id))
  })

  return { accepted: true, groupId: invitation.groupId }
})
