"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { getChartColorVariations } from "@/lib/utils"

interface EmployeeHoursChartProps {
  data: Array<{
    day: string
    hours: string
  }>
}

const getDayName = (day: string | number) => {
  if (typeof day === "number") {
    // Use the helper from services/employee.ts for numbers
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day] || String(day);
  }
  if (typeof day === "string") {
    const days: Record<string, string> = {
      sunday: "Sun",
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
    };
    return days[day.toLowerCase()] || day;
  }
  return String(day);
}

const formatHoursCount = (hours: string) => {
  return parseFloat(hours).toFixed(1)
}

export function EmployeeHoursChart({ data }: EmployeeHoursChartProps) {
  // Transform the data for the chart
  const chartData = data.map((item) => ({
    name: getDayName(item.day),
    hours: (Number.parseFloat(formatHoursCount(item.hours)) / 60).toFixed(2),
  }))

  // Get color variations for all bars
  const colors = getChartColorVariations(chartData.length);

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
        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
