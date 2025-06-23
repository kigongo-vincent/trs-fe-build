"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "John Smith", hours: 42, tasks: 12, efficiency: 95 },
  { name: "Sarah Johnson", hours: 40, tasks: 10, efficiency: 92 },
  { name: "Emily Davis", hours: 38, tasks: 9, efficiency: 88 },
  { name: "Michael Brown", hours: 36, tasks: 8, efficiency: 85 },
  { name: "Jessica Wilson", hours: 35, tasks: 7, efficiency: 82 },
  { name: "Robert Taylor", hours: 34, tasks: 7, efficiency: 80 },
  { name: "Amanda Martinez", hours: 32, tasks: 6, efficiency: 78 },
  { name: "David Anderson", hours: 30, tasks: 5, efficiency: 75 },
]

export function EmployeePerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={120} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "hours") return [`${value} hours`, "Hours Logged"]
            if (name === "efficiency") return [`${value}%`, "Efficiency"]
            return [value, name]
          }}
        />
        <Bar dataKey="hours" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Hours Logged" />
      </BarChart>
    </ResponsiveContainer>
  )
}
