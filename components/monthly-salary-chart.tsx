"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"
import { getAuthData } from "@/services/auth"


interface MonthlySalaryChartProps {
  data: Array<{
    label: string
    amount: number
    currency?: string
  }>
}

const user = getAuthData()
const currency = user?.company?.currency

export function MonthlySalaryChart({ data }: MonthlySalaryChartProps) {
  // Use the last 8 months from the API data
  const last8Months = data.slice(-8)
  const userCurrency = getAuthData()?.user?.currency


  const chartData = last8Months.map((item) => ({
    month: item.label,
    amount: item.amount,
    currency: userCurrency
  }))

  const xKey = "month"


  return (
    <div className="w-full">
      <div className="text-sm font-medium text-muted-foreground mb-2">{userCurrency}</div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis
            dataKey={xKey}
            stroke={`hsl(var(--muted-foreground))`}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={`hsl(var(--muted-foreground))`}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            formatter={(_value: number, _name: string, props: any) => {
              const currency = props.payload && props.payload.currency ? props.payload.currency.toUpperCase() : 'USD';
              return [` ${currency} ${props.value}`, 'Amount'];
            }}
            cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
          />
          <Bar
            dataKey="amount"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
