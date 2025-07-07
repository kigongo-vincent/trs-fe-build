"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"
import { MonthlySalaryData } from "@/services/employee"
import { ConsultantMonthlySummaryItem } from "@/services/consultants"
import { useMemo } from "react"

type MonthlySalaryChartProps =
  | { data: MonthlySalaryData[] }
  | { data: ConsultantMonthlySummaryItem[] }

export function MonthlySalaryChart({ data }: MonthlySalaryChartProps) {
  // Determine if the data uses 'month' or 'label' for the x-axis
  const xKey = data.length > 0 && 'month' in data[0] ? 'month' : 'label'
  // Use actual currency code as string (default to USD)
  const firstCurrency = data.length > 0 ? (data[0] as any).currency : undefined;
  const yAxisCurrency = (firstCurrency ? firstCurrency.toUpperCase() : 'USD');

  // Ensure all 12 months are shown (for ConsultantMonthlySummaryItem[])
  const filledData = useMemo(() => {
    if (xKey === 'label') {
      // Get all months from the data (should be 12, but fill if missing)
      const months = [
        'August 2024', 'September 2024', 'October 2024', 'November 2024', 'December 2024',
        'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025', 'July 2025'
      ];
      const currency = firstCurrency ? firstCurrency.toUpperCase() : 'USD';
      const map = new Map((data as ConsultantMonthlySummaryItem[]).map(item => [item.label, item]));
      const allMonths = months.map(label => map.get(label) || { label, amount: 0, currency });
      // Only show the last 8 months
      return allMonths.slice(-8);
    }
    return data;
  }, [data, xKey, firstCurrency]);

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
