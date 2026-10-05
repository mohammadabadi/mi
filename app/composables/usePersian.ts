export function usePersian() {
  const dateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const numberFormatter = new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 0
  })
  const latinNumberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  })

  function moneyFormatter(value: string | number | bigint, currency = 'IRR') {
    const unit = currency === 'IRR' ? 'ریال' : currency
    return `${numberFormatter.format(Number(value))} ${unit}`
  }

  function normalizeDigits(value: string | number | bigint | null | undefined) {
    return String(value ?? '')
      .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
  }

  function digitsOnly(value: string | number | bigint | null | undefined) {
    return normalizeDigits(value).replace(/\D/g, '')
  }

  function formatAmountInput(value: string | number | bigint | null | undefined) {
    const digits = digitsOnly(value)
    return digits ? latinNumberFormatter.format(Number(digits)) : ''
  }

  return {
    money: (value: string | number | bigint | null | undefined, currency = 'IRR') => value === null || value === undefined ? '-' : moneyFormatter(value, currency),
    number: (value: string | number | bigint | null | undefined) => value === null || value === undefined ? '-' : numberFormatter.format(Number(value)),
    rawDigits: digitsOnly,
    inputAmount: formatAmountInput,
    date: (value: string | Date | null | undefined) => value === null || value === undefined ? '-' : dateFormatter.format(new Date(value))
  }
}
