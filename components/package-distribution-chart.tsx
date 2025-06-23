"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "Basic", value: 35, companies: 9 },
  { name: "Professional", value: 40, companies: 10 },
  { name: "Enterprise", value: 20, companies: 5 },
  { name: "Premium", value: 5, companies: 1 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function PackageDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value}%`, "Percentage"]}
          labelFormatter={(label) => `Package: ${label}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
