type ExpenseShareInput = {
  splitMode: 'equal' | 'custom'
  amountMinor: string | bigint
  payerId: string
  participantIds: string[]
  shares?: Array<{ userId: string; amountMinor: string }>
  memberIds: Set<string>
}

export function buildExpenseShares(input: ExpenseShareInput) {
  const participantIds = [...new Set(input.participantIds)]

  if (!input.memberIds.has(input.payerId) || participantIds.some((id) => !input.memberIds.has(id))) {
    throw createError({ statusCode: 400, statusMessage: 'پرداخت‌کننده و افراد دنگ باید عضو گروه باشند.' })
  }

  const amount = BigInt(input.amountMinor)

  if (input.splitMode === 'equal') {
    const count = BigInt(participantIds.length)
    const baseShare = amount / count
    let remainder = amount % count

    return participantIds.map((userId) => {
      const extra = remainder > BigInt(0) ? BigInt(1) : BigInt(0)
      remainder -= extra

      return {
        userId,
        amountMinor: baseShare + extra,
        status: userId === input.payerId ? 'paid' as const : 'pending' as const
      }
    })
  }

  const customShares = input.shares ?? []
  if (!customShares.length) throw createError({ statusCode: 400, statusMessage: 'برای تقسیم سفارشی سهم افراد را وارد کنید.' })

  const shareUserIds = new Set(customShares.map((share) => share.userId))
  if (customShares.some((share) => !input.memberIds.has(share.userId))) {
    throw createError({ statusCode: 400, statusMessage: 'همه افراد سهم باید عضو گروه باشند.' })
  }

  if (participantIds.some((id) => !shareUserIds.has(id))) {
    throw createError({ statusCode: 400, statusMessage: 'برای همه افراد انتخاب‌شده سهم وارد کنید.' })
  }

  const selectedShares = customShares.filter((share) => participantIds.includes(share.userId))
  const sum = selectedShares.reduce((total, share) => total + BigInt(share.amountMinor), BigInt(0))
  if (sum !== amount) throw createError({ statusCode: 400, statusMessage: 'جمع سهم‌ها باید دقیقاً برابر مبلغ کل باشد.' })

  return selectedShares.map((share) => ({
    userId: share.userId,
    amountMinor: BigInt(share.amountMinor),
    status: share.userId === input.payerId ? 'paid' as const : 'pending' as const
  }))
}
