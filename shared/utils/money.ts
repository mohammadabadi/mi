export const DEFAULT_CURRENCY = 'IRR'

export function toMinorUnit(value: string | number | bigint): bigint {
  if (typeof value === 'bigint') return value
  const normalized = String(value).trim().replace(/,/g, '')
  if (!/^\d+$/.test(normalized)) {
    throw new Error('Amount must be a positive integer in the selected currency minor unit.')
  }
  const parsed = BigInt(normalized)
  if (parsed <= BigInt(0)) {
    throw new Error('Amount must be positive.')
  }
  return parsed
}

export function formatMoney(value: string | number | bigint, currency = DEFAULT_CURRENCY): string {
  const numeric = Number(value)
  const unit = currency === 'IRR' ? 'ریال' : currency

  return `${new Intl.NumberFormat('fa-IR').format(numeric)} ${unit}`
}

export function calculateAccountBalance(input: import('../types/finance').BalanceInput): bigint {
  let balance = BigInt(input.account.initialBalanceMinor)

  for (const transaction of input.transactions) {
    if (transaction.accountId !== input.account.id) continue
    const amount = BigInt(transaction.amountMinor)
    balance += transaction.type === 'income' ? amount : -amount
  }

  for (const transfer of input.transfers) {
    const amount = BigInt(transfer.amountMinor)
    if (transfer.fromAccountId === input.account.id) balance -= amount
    if (transfer.toAccountId === input.account.id) balance += amount
  }

  return balance
}

export function toIsoDate(input: string | Date): string {
  if (input instanceof Date) return input.toISOString().slice(0, 10)
  return input.slice(0, 10)
}
