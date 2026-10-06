import { and, eq } from 'drizzle-orm'
import { groupInviteSchema } from '../../../../../shared/schemas/finance'
import { groupInvitations, groupMembers, groups, users } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id') ?? ''
  const { user, member } = await requireGroupMember(event, groupId)
  if (!canManageGroup(member.role)) {
    throw createError({ statusCode: 403, statusMessage: 'برای دعوت عضو باید مدیر گروه باشید.' })
  }

  const body = await readSchemaBody(event, groupInviteSchema)
  if (body.userId === user.id) throw createError({ statusCode: 400, statusMessage: 'شما همین حالا عضو گروه هستید.' })

  const db = useDb()
  const [group] = await db.select({ id: groups.id, name: groups.name }).from(groups).where(eq(groups.id, groupId)).limit(1)
  const [invitee] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, body.userId)).limit(1)
  if (!group || !invitee) throw createError({ statusCode: 404, statusMessage: 'کاربر یا گروه پیدا نشد.' })

  const [existingMember] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, body.userId)))
    .limit(1)

  if (existingMember) throw createError({ statusCode: 409, statusMessage: 'این کاربر عضو گروه است.' })

  const [existingInvitation] = await db
    .select({ id: groupInvitations.id, status: groupInvitations.status })
    .from(groupInvitations)
    .where(and(eq(groupInvitations.groupId, groupId), eq(groupInvitations.inviteeId, body.userId)))
    .limit(1)

  const [invitation] = existingInvitation
    ? await db.update(groupInvitations).set({
      inviterId: user.id,
      status: 'pending',
      respondedAt: null
    }).where(eq(groupInvitations.id, existingInvitation.id)).returning()
    : await db.insert(groupInvitations).values({
      groupId,
      inviterId: user.id,
      inviteeId: body.userId
    }).returning()

  if (!invitation) throw createError({ statusCode: 500, statusMessage: 'ثبت دعوت ناموفق بود.' })

  await createNotification({
    userId: body.userId,
    type: 'group_invite',
    title: 'دعوت به گروه',
    body: `${user.name} شما را به گروه ${group.name} دعوت کرد.`,
    data: { groupId, invitationId: invitation.id }
  })

  return { invitation: serializeRow(invitation) }
})
