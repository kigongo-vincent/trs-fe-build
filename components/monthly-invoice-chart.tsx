"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

interface SingleSeriesProps {
  data: Array<{
    month: string
    totalAmount: number
    currency: string
  }>
}

interface MultiSeriesProps {
  multiSeries?: {
    data: Array<{
      month: string
      [currency: string]: string | number
    }>
    currencies: string[]
    colors?: string[]
  }
}

type MonthlyInvoiceChartProps = SingleSeriesProps & MultiSeriesProps

export function MonthlyInvoiceChart({ data, multiSeries }: MonthlyInvoiceChartProps) {
  // Fill in missing months with zero values
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Single-series fallback
  const filledData = months.map((month) => {
    const existingData = data?.find((item) => item.month === month)
    return existingData || { month, totalAmount: 0, currency: "USD" }
  })

  // Colors: very pale pastel shades of provided primary rgb(246, 147, 27)
  const baseRgb: [number, number, number] = [246, 147, 27]
  // Opacity decreases by 30% per series: 1.0, 0.7, 0.49, ... (min clamp 0.06)
  const seriesCount = 8
  const alphas = Array.from({ length: seriesCount }, (_, i) => Math.max(0.06, Math.pow(0.7, i)))
  const defaultColors = alphas.map(a => `rgba(${baseRgb[0]}, ${baseRgb[1]}, ${baseRgb[2]}, ${a})`)

  return (
    <div className="w-full" style={{ minHeight: "50vh", height: "50vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={multiSeries ? multiSeries.data : filledData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          {multiSeries && <Legend />}
          {multiSeries
            ? (multiSeries.currencies || []).map((code, idx) => (
              <Bar
                key={code}
                dataKey={code}
                fill={(multiSeries.colors && multiSeries.colors[idx]) || defaultColors[idx % defaultColors.length]}
                yAxisId={code.toUpperCase() === 'UGX' ? 'right' : 'left'}
              />
            ))
            : <Bar dataKey="totalAmount" fill={GRAPH_PRIMARY_COLOR} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
