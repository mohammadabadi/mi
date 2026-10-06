import { groupCreateSchema } from '../../../shared/schemas/finance'
import { groupMembers, groups } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readSchemaBody(event, groupCreateSchema)
  const db = useDb()

  const [group] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(groups).values({
      ownerId: user.id,
      name: body.name,
      description: body.description
    }).returning()

    if (!created) throw createError({ statusCode: 500, statusMessage: 'ساخت گروه ناموفق بود.' })

    await tx.insert(groupMembers).values({
      groupId: created.id,
      userId: user.id,
      role: 'owner'
    })

    return [created]
  })

  if (!group) throw createError({ statusCode: 500, statusMessage: 'ساخت گروه ناموفق بود.' })

  return { group: serializeRow(group) }
})
