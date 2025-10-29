"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { getChartColorVariations } from "@/lib/utils"

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

  // Get color variations for multi-series (one color per currency)
  const currencyColors = multiSeries?.currencies
    ? getChartColorVariations(multiSeries.currencies.length)
    : []

  // Get color variations for single-series (one color per month)
  const monthlyColors = getChartColorVariations(filledData.length)

  // Multi-series: we'll always render both left and right axes to avoid id mismatches
  const hasRightAxis = true
  const hasLeftAxis = true

  // Custom tooltip formatter to format currency with commas
  const formatCurrencyValue = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return '0'
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {multiSeries ? (
            <div className="space-y-1">
              {payload.map((entry: any, index: number) => {
                const currencyCode = entry.dataKey || 'USD'
                const formattedValue = formatCurrencyValue(entry.value || 0)
                return (
                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {`${currencyCode}: ${formattedValue}`}
                  </p>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm">
                Amount: <span className="font-semibold">{formatCurrencyValue(payload[0]?.value || 0)}</span>
              </p>
              {payload[0]?.payload?.currency && (
                <p className="text-xs text-muted-foreground">
                  Currency: {payload[0].payload.currency}
                </p>
              )}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full" style={{ minHeight: "50vh", height: "50vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={multiSeries ? multiSeries.data : filledData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          {multiSeries ? (
            <>
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
            </>
          ) : (
            <YAxis />
          )}
          <Tooltip content={<CustomTooltip />} />
          {multiSeries && <Legend />}
          {multiSeries
            ? (multiSeries.currencies || []).map((code, idx) => (
              <Bar
                key={code}
                dataKey={code}
                fill={(multiSeries.colors && multiSeries.colors[idx]) || currencyColors[idx]}
                yAxisId={code.toUpperCase() === 'UGX' ? 'right' : 'left'}
              />
            ))
            : (
              <Bar dataKey="totalAmount" radius={[4, 4, 0, 0]}>
                {filledData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={monthlyColors[index]} />
                ))}
              </Bar>
            )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
