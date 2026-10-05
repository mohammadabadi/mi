import { and, eq } from 'drizzle-orm'
import { categoryUpdateSchema } from '../../../shared/schemas/finance'
import { categories } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readSchemaBody(event, categoryUpdateSchema)
  const db = useDb()
  const [category] = await db.update(categories).set({ ...body, updatedAt: new Date() }).where(and(eq(categories.id, id), eq(categories.userId, user.id))).returning()

  if (!category) throw createError({ statusCode: 404, statusMessage: 'دسته‌بندی پیدا نشد.' })
  return { category: serializeRow(category) }
})
