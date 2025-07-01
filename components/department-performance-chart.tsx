"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const defaultData = [
  { name: "Development", hours: 420, tasks: 42, completion: 85 },
  { name: "Design", hours: 320, tasks: 28, completion: 92 },
  { name: "Marketing", hours: 240, tasks: 18, completion: 78 },
  { name: "Sales", hours: 180, tasks: 24, completion: 75 },
  { name: "HR", hours: 120, tasks: 12, completion: 95 },
  { name: "Finance", hours: 148, tasks: 16, completion: 82 },
  { name: "Customer Support", hours: 160, tasks: 16, completion: 88 },
]

export function DepartmentPerformanceChart({ data = defaultData }: { data?: { name: string; hours: number; tasks: number; completion: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
        <Tooltip
          formatter={(value, name) => {
            if (name === "hours") return [`${value} hours`, "Hours Logged"]
            if (name === "completion") return [`${value}%`, "Completion Rate"]
            return [value, name]
          }}
        />
        <Bar yAxisId="left" dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Hours Logged" />
        <Bar yAxisId="right" dataKey="completion" fill="#10b981" radius={[4, 4, 0, 0]} name="Completion Rate (%)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
