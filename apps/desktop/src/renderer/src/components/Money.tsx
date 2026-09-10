import { formatMoney, type Money as MoneyValue } from '@viaticocero/core'

export function Money({ value }: { value: MoneyValue }) {
  return <span className="vz-num">{formatMoney(value)}</span>
}
