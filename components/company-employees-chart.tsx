"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "@/components/ui/chart"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  { name: "Engineering", value: 18, color: "#8884d8" },
  { name: "Marketing", value: 8, color: "#82ca9d" },
  { name: "Sales", value: 10, color: "#ffc658" },
  { name: "HR", value: 3, color: "#ff8042" },
  { name: "Finance", value: 3, color: "#0088fe" },
]

const COLORS = [GRAPH_PRIMARY_COLOR, "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

export function CompanyEmployeesChart() {
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
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
