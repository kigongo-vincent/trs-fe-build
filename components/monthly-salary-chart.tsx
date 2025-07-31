"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

interface MonthlySalaryChartProps {
  data: Array<{
    label: string
    amount: number
    currency?: string
  }>
}

export function MonthlySalaryChart({ data }: MonthlySalaryChartProps) {
  // Use the last 8 months from the API data
  const last8Months = data.slice(-8)

  const chartData = last8Months.map((item) => ({
    month: item.label,
    amount: item.amount,
    currency: item.currency || "USD"
  }))

  const xKey = "month"

  return (
    <div className="w-full">
      <div className="text-sm font-medium text-muted-foreground mb-2">USD</div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis
            dataKey={xKey}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            formatter={(_value: number, _name: string, props: any) => {
              const currency = props.payload && props.payload.currency ? props.payload.currency.toUpperCase() : 'USD';
              return [`${props.value} ${currency}`, 'Amount'];
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
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
