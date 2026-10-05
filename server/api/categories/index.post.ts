import { categoryCreateSchema } from '../../../shared/schemas/finance'
import { categories } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readSchemaBody(event, categoryCreateSchema)
  const db = useDb()
  const [category] = await db.insert(categories).values({ ...body, userId: user.id }).returning()

  if (!category) throw createError({ statusCode: 500, statusMessage: 'ثبت دسته‌بندی ناموفق بود.' })

  return { category: serializeRow(category) }
})
