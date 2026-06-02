import { Link } from "react-router-dom"
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import type { AssistantCard, ChartCardData, MetricCardData } from "@/lib/assistant-cards"

const ACCENT = "#6366f1" // indigo-500

function formatValue(value: number, prefix?: string, suffix?: string) {
  return `${prefix ?? ""}${value.toLocaleString()}${suffix ?? ""}`
}

function ActionLink({ action }: { action?: { label: string; href: string } }) {
  if (!action) return null
  return (
    <Link
      to={action.href}
      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
    >
      {action.label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  )
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm">
      {children}
    </div>
  )
}

function MetricCard({ card }: { card: MetricCardData }) {
  const up = card.delta?.direction === "up"
  return (
    <CardShell>
      <p className="text-sm font-semibold">{card.title}</p>
      {card.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{card.subtitle}</p>}
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-xs text-muted-foreground">{card.label}</span>
        <div className="text-right">
          <div className="text-2xl font-semibold leading-none tracking-tight">{card.value}</div>
          {card.delta && (
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-0.5 text-xs font-medium",
                up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {card.delta.value}
            </div>
          )}
        </div>
      </div>
      <ActionLink action={card.action} />
    </CardShell>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
  prefix,
  suffix,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  prefix?: string
  suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold">{formatValue(payload[0].value, prefix, suffix)}</div>
    </div>
  )
}

function ChartCard({ card }: { card: ChartCardData }) {
  const tick = { fontSize: 11, fill: "var(--muted-foreground)" }
  return (
    <CardShell>
      <p className="text-sm font-semibold">{card.title}</p>
      {card.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{card.subtitle}</p>}
      <div className="mt-3 h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {card.chartType === "line" ? (
            <LineChart data={card.series} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} />
              <YAxis tickLine={false} axisLine={false} tick={tick} width={36} />
              <Tooltip
                cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }}
                content={<ChartTooltip prefix={card.unitPrefix} suffix={card.unitSuffix} />}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={ACCENT}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={card.series} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} />
              <YAxis tickLine={false} axisLine={false} tick={tick} width={36} />
              <Tooltip
                cursor={{ fill: ACCENT, fillOpacity: 0.08 }}
                content={<ChartTooltip prefix={card.unitPrefix} suffix={card.unitSuffix} />}
              />
              <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <ActionLink action={card.action} />
    </CardShell>
  )
}

export function AssistantCardView({ card }: { card: AssistantCard }) {
  return card.kind === "metric" ? <MetricCard card={card} /> : <ChartCard card={card} />
}
