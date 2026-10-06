import { and, eq } from 'drizzle-orm'
import { notifications } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDb()

  const [notification] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)))
    .returning()

  if (!notification) throw createError({ statusCode: 404, statusMessage: 'اعلان پیدا نشد.' })

  return { notification: serializeRow(notification) }
})
