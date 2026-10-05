import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath: string) {
  const filePath = resolve(repoRoot, relativePath)

  expect(existsSync(filePath), `${relativePath} should exist`).toBe(true)

  return readFileSync(filePath, 'utf8')
}

function compact(source: string) {
  return source.replace(/\s+/g, ' ')
}

const protectedRoutes = [
  'server/api/accounts/index.get.ts',
  'server/api/accounts/index.post.ts',
  'server/api/accounts/[id].get.ts',
  'server/api/accounts/[id].patch.ts',
  'server/api/accounts/[id].delete.ts',
  'server/api/categories/index.get.ts',
  'server/api/categories/index.post.ts',
  'server/api/categories/[id].patch.ts',
  'server/api/categories/[id].delete.ts',
  'server/api/transactions/index.get.ts',
  'server/api/transactions/index.post.ts',
  'server/api/transactions/[id].get.ts',
  'server/api/transactions/[id].patch.ts',
  'server/api/transactions/[id].delete.ts',
  'server/api/transfers/index.post.ts',
  'server/api/dashboard/index.get.ts',
  'server/api/reports/monthly.get.ts',
  'server/api/reports/expenses.get.ts',
  'server/api/reports/income.get.ts',
]

const ownershipChecks = [
  {
    route: 'server/api/accounts/index.get.ts',
    guards: ['eq(accounts.userId, user.id)'],
  },
  {
    route: 'server/api/accounts/index.post.ts',
    guards: ['userId: user.id'],
  },
  {
    route: 'server/api/accounts/[id].get.ts',
    guards: ['eq(accounts.userId, user.id)'],
  },
  {
    route: 'server/api/accounts/[id].patch.ts',
    guards: ['eq(accounts.userId, user.id)'],
  },
  {
    route: 'server/api/accounts/[id].delete.ts',
    guards: ['eq(accounts.userId, user.id)'],
  },
  {
    route: 'server/api/categories/index.get.ts',
    guards: ['eq(categories.userId, user.id)'],
  },
  {
    route: 'server/api/categories/index.post.ts',
    guards: ['userId: user.id'],
  },
  {
    route: 'server/api/categories/[id].patch.ts',
    guards: ['eq(categories.userId, user.id)'],
  },
  {
    route: 'server/api/categories/[id].delete.ts',
    guards: ['eq(categories.userId, user.id)'],
  },
  {
    route: 'server/api/transactions/index.get.ts',
    guards: ['eq(transactions.userId, user.id)'],
  },
  {
    route: 'server/api/transactions/index.post.ts',
    guards: ['eq(accounts.userId, user.id)', 'eq(categories.userId, user.id)', 'userId: user.id'],
  },
  {
    route: 'server/api/transactions/[id].get.ts',
    guards: ['eq(transactions.userId, user.id)'],
  },
  {
    route: 'server/api/transactions/[id].patch.ts',
    guards: ['eq(transactions.userId, user.id)', 'eq(accounts.userId, user.id)', 'eq(categories.userId, user.id)'],
  },
  {
    route: 'server/api/transactions/[id].delete.ts',
    guards: ['eq(transactions.userId, user.id)'],
  },
  {
    route: 'server/api/transfers/index.post.ts',
    guards: ['eq(accounts.userId, user.id)', 'userId: user.id'],
  },
  {
    route: 'server/api/dashboard/index.get.ts',
    guards: ['eq(accounts.userId, user.id)', 'eq(transactions.userId, user.id)'],
  },
  {
    route: 'server/api/reports/monthly.get.ts',
    guards: ['eq(transactions.userId, user.id)'],
  },
  {
    route: 'server/api/reports/expenses.get.ts',
    guards: ['eq(transactions.userId, user.id)'],
  },
  {
    route: 'server/api/reports/income.get.ts',
    guards: ['eq(transactions.userId, user.id)'],
  },
]

describe('server-side tenant isolation', () => {
  it.each(protectedRoutes)('%s requires an authenticated user', (route) => {
    expect(compact(read(route))).toContain('requireUser(event)')
  })

  it.each(ownershipChecks)('$route applies user ownership guards', ({ route, guards }) => {
    const source = compact(read(route))

    for (const guard of guards) {
      expect(source).toContain(compact(guard))
    }
  })

  it('stores a tenant owner on every user financial table', () => {
    const schema = compact(read('server/database/schema.ts'))

    for (const table of ['sessions', 'accounts', 'categories', 'transactions', 'transfers']) {
      expect(schema).toContain(`export const ${table} =`)
      expect(schema).toContain('userId: uuid(\'user_id\')')
    }
  })
})
