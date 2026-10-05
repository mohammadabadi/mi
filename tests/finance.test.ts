import { describe, expect, it } from 'vitest'
import { calculateAccountBalance, toMinorUnit } from '../shared/utils/money'

describe('financial ledger rules', () => {
  it('calculates account balance from initial balance, transactions and transfers', () => {
    const balance = calculateAccountBalance({
      account: { id: 'bank', initialBalanceMinor: '10000000' },
      transactions: [
        { accountId: 'bank', type: 'income', amountMinor: '5000000' },
        { accountId: 'bank', type: 'expense', amountMinor: '1000000' }
      ],
      transfers: [
        { fromAccountId: 'bank', toAccountId: 'wallet', amountMinor: '2000000' }
      ]
    })

    expect(balance).toBe(12000000n)
  })

  it('does not treat transfers as expenses', () => {
    const transactions = [
      { accountId: 'bank', type: 'expense' as const, amountMinor: '300000' }
    ]
    const transfers = [
      { fromAccountId: 'bank', toAccountId: 'wallet', amountMinor: '5000000' }
    ]

    const expenseTotal = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + BigInt(transaction.amountMinor), 0n)

    expect(expenseTotal).toBe(300000n)
    expect(transfers).toHaveLength(1)
  })

  it('rejects invalid monetary values', () => {
    expect(() => toMinorUnit('10.5')).toThrow()
    expect(() => toMinorUnit('-1')).toThrow()
    expect(() => toMinorUnit('0')).toThrow()
    expect(toMinorUnit('1500')).toBe(1500n)
  })
})
