export type AccountType = 'bank' | 'cash' | 'wallet' | 'credit_card' | 'other'
export type CategoryType = 'income' | 'expense'
export type TransactionType = 'income' | 'expense'
export type CurrencyCode = 'IRR'

export interface LedgerAccount {
  id: string
  initialBalanceMinor: bigint | number | string
}

export interface LedgerTransaction {
  accountId: string
  type: TransactionType
  amountMinor: bigint | number | string
}

export interface LedgerTransfer {
  fromAccountId: string
  toAccountId: string
  amountMinor: bigint | number | string
}

export interface BalanceInput {
  account: LedgerAccount
  transactions: LedgerTransaction[]
  transfers: LedgerTransfer[]
}
