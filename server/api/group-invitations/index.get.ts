import { desc, eq } from 'drizzle-orm'
import { groupInvitations, groups, users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()

  const invitations = await db
    .select({
      id: groupInvitations.id,
      status: groupInvitations.status,
      groupId: groups.id,
      groupName: groups.name,
      groupDescription: groups.description,
      inviterName: users.name,
      createdAt: groupInvitations.createdAt
    })
    .from(groupInvitations)
    .innerJoin(groups, eq(groups.id, groupInvitations.groupId))
    .innerJoin(users, eq(users.id, groupInvitations.inviterId))
    .where(eq(groupInvitations.inviteeId, user.id))
    .orderBy(desc(groupInvitations.createdAt))

  return { invitations: serializeRows(invitations) }
})
