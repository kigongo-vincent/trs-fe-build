"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

interface MonthlySalaryChartProps {
  data: Array<{
    month: string
    amount: number
    currency: string
  }>
}

export function MonthlySalaryChart({ data }: MonthlySalaryChartProps) {
  // Fill in missing months with zero values
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const filledData = months.map((month) => {
    const existingData = data.find((item) => item.month === month)
    return existingData || { month, amount: 0, currency: "USD" }
  })

  const xKey = "month"
  const yAxisCurrency = "USD"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={filledData}>
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
          tickFormatter={(value) => `${value} ${yAxisCurrency}`}
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
  )
}
