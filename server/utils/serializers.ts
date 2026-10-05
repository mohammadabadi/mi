export function serializeRow<T extends Record<string, unknown>>(row: T) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
  )
}

export function serializeRows<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map((row) => serializeRow(row))
}
