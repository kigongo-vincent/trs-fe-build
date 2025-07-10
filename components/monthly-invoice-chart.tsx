"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

interface MonthlyInvoiceChartProps {
  data: Array<{
    month: string
    totalAmount: number
    currency: string
  }>
}

export function MonthlyInvoiceChart({ data }: MonthlyInvoiceChartProps) {
  // Fill in missing months with zero values
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const filledData = months.map((month) => {
    const existingData = data.find((item) => item.month === month)
    return existingData || { month, totalAmount: 0, currency: "USD" }
  })

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={filledData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(_value: number, _name: string, props: any) => {
            const currency = props.payload && props.payload.currency ? props.payload.currency.toUpperCase() : 'USD';
            return [`${props.value} ${currency}`, 'Amount'];
          }}
          cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
        />
        <Bar dataKey="totalAmount" fill={GRAPH_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
