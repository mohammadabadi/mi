import type { z } from 'zod'

export async function readSchemaBody<T extends z.ZodType>(event: Parameters<typeof readBody>[0], schema: T): Promise<z.infer<T>> {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'داده‌های ارسالی معتبر نیستند.',
      data: result.error.flatten()
    })
  }

  return result.data
}

export function parseSchemaQuery<T extends z.ZodType>(event: Parameters<typeof getQuery>[0], schema: T): z.infer<T> {
  const result = schema.safeParse(getQuery(event))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'پارامترهای فیلتر معتبر نیستند.',
      data: result.error.flatten()
    })
  }

  return result.data
}
