import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BUDGET_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
} from "@/types/campaign-wizard"
import { cn } from "@/lib/utils"

export interface BudgetState {
  currency: string
  budgetType: string
  budget: string
  maxCpc: string
  maxCps: string
}

export function BudgetWithRatesFields({
  value,
  onChange,
}: {
  value: BudgetState
  onChange: (patch: Partial<BudgetState>) => void
}) {
  const currencyMeta =
    CURRENCY_OPTIONS.find((c) => c.value === value.currency) ?? CURRENCY_OPTIONS[1]
  const symbol = currencyMeta.symbol

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Currency + budget type */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Currency">
          <Select
            value={value.currency || "USD"}
            onValueChange={(v) => onChange({ currency: v ?? "USD" })}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.symbol} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Budget type">
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_TYPE_OPTIONS.filter((b) =>
              ["daily", "weekly", "monthly", "total"].includes(b.value),
            ).map((b) => {
              const active = value.budgetType === b.value
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => onChange({ budgetType: b.value })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {b.label.replace(/\sbudget$|\slimit$|\scampaign\sbudget$/i, "")}
                </button>
              )
            })}
          </div>
        </Field>
      </div>

      {/* Budget amount + CPC + CPS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label={budgetLabelFor(value.budgetType)}>
          <CurrencyInput
            symbol={symbol}
            value={value.budget}
            onChange={(v) => onChange({ budget: v })}
            placeholder="0"
          />
        </Field>
        <Field label="Max CPC" hint="Max cost per click">
          <CurrencyInput
            symbol={symbol}
            value={value.maxCpc}
            onChange={(v) => onChange({ maxCpc: v })}
            placeholder="0.00"
          />
        </Field>
        <Field label="Target CPS" hint="Target cost per sale">
          <CurrencyInput
            symbol={symbol}
            value={value.maxCps}
            onChange={(v) => onChange({ maxCps: v })}
            placeholder="0.00"
          />
        </Field>
      </div>

      <MonthlySpendSummary symbol={symbol} budget={value.budget} type={value.budgetType} />
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function CurrencyInput({
  symbol,
  value,
  onChange,
  placeholder,
}: {
  symbol: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-xs text-muted-foreground">
        {symbol}
      </span>
      <Input
        type="number"
        inputMode="decimal"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-6 text-sm"
      />
    </div>
  )
}

function budgetLabelFor(type: string): string {
  if (type === "weekly") return "Weekly budget"
  if (type === "monthly") return "Monthly budget"
  if (type === "total") return "Total budget"
  return "Average daily budget"
}

function MonthlySpendSummary({
  symbol,
  budget,
  type,
}: {
  symbol: string
  budget: string
  type: string
}) {
  const amount = Number(budget) || 0
  const monthly =
    type === "daily"
      ? amount * 30
      : type === "weekly"
        ? amount * 4
        : amount
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-xs">
      <span className="text-muted-foreground">Estimated monthly spend</span>
      <span className="font-medium tabular-nums">
        ~{symbol}
        {monthly ? Math.round(monthly).toLocaleString() : "0"} / mo
      </span>
    </div>
  )
}
