"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  { name: "North America", value: 45, companies: 12 },
  { name: "Europe", value: 30, companies: 8 },
  { name: "Asia Pacific", value: 15, companies: 4 },
  { name: "South America", value: 6, companies: 2 },
  { name: "Africa", value: 4, companies: 1 },
]

const COLORS = [GRAPH_PRIMARY_COLOR, "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function RegionalDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value}%`, "Percentage"]}
          labelFormatter={(label) => `Region: ${label}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
