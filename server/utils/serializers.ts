function serializeValue(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value
  if (Array.isArray(value)) return value.map((item) => serializeValue(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeValue(item)])
    )
  }
  return value
}

export function serializeRow<T extends Record<string, unknown>>(row: T) {
  return serializeValue(row) as Record<string, unknown>
}

export function serializeRows<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map((row) => serializeRow(row))
}
