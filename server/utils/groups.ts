import { and, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { groupMembers, notifications } from '../database/schema'

export async function requireGroupMember(event: H3Event, groupId: string) {
  const user = await requireUser(event)
  const db = useDb()
  const [member] = await db
    .select({
      id: groupMembers.id,
      role: groupMembers.role,
      userId: groupMembers.userId,
      groupId: groupMembers.groupId
    })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)))
    .limit(1)

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'به این گروه دسترسی ندارید.' })
  }

  return { user, member }
}

export function canManageGroup(role: string) {
  return role === 'owner' || role === 'admin'
}

export async function createNotification(input: {
  userId: string
  type: 'group_invite' | 'group_expense' | 'share_paid'
  title: string
  body?: string
  data?: Record<string, unknown>
}) {
  const db = useDb()
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? '',
    data: JSON.stringify(input.data ?? {})
  })
}
