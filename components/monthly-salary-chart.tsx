"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { getChartColorVariations } from "@/lib/utils"
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

  // Get color variations for all bars
  const colors = getChartColorVariations(chartData.length);

  const xKey = "month"


  return (
    <div className="w-full">
      <div className="text-sm font-medium text-muted-foreground mb-2">{userCurrency}</div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey={xKey}
            stroke={`hsl(var(--muted-foreground))`}
            fontSize={12}
          // tickLine={false}
          // axisLine={false}
          />
          <YAxis
            stroke={`hsl(var(--muted-foreground))`}
            fontSize={12}
            // tickLine={false}
            // axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            formatter={(value: number, _name: string, props: any) => {
              const currency = props.payload && props.payload.currency ? props.payload.currency.toUpperCase() : 'USD';
              const numValue = typeof value === 'string' ? parseFloat(value) : value;
              const formattedValue = isNaN(numValue) ? '0' : numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return [`${currency} ${formattedValue}`, 'Amount'];
            }}
            cursor={{ fill: '#f4f4f4' }}
            contentStyle={{
              border: "none"
            }}
          />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
