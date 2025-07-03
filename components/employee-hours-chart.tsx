"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { type WeekDistribution, getDayName, formatHoursCount } from "@/services/employee"

interface EmployeeHoursChartProps {
  data: WeekDistribution[]
}

const primaryColor = "#F6931B"

export function EmployeeHoursChart({ data }: EmployeeHoursChartProps) {
  // Transform the data for the chart
  const chartData = data.map((item) => ({
    name: getDayName(item.day),
    hours: Number.parseFloat(formatHoursCount(item.hours)),
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          label={{ value: "Day (Sun-Sat)", position: "insideBottom", offset: -5, fontSize: 14 }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          label={{ value: "Hours", angle: -90, position: "insideLeft", fontSize: 14 }}
        />
        <Tooltip formatter={(value: number) => [`${value}h`, "Hours"]} labelFormatter={(label) => `${label}`} />
        <Bar dataKey="hours" fill={primaryColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
