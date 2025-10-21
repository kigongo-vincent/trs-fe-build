"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "@/components/ui/chart"

const data = [
  { name: "In Progress", value: 18 },
  { name: "Pending", value: 12 },
  { name: "Completed", value: 8 },
  { name: "Overdue", value: 4 },
]

const COLORS = ["#0088FE", "#FFBB28", "#00C49F", "#FF8042"]

export function DepartmentTasksChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
