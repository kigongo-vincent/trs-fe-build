"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "@/components/ui/chart"

const data = [
  { name: "North America", value: 25400, color: "#8884d8" },
  { name: "Europe", value: 12800, color: "#82ca9d" },
  { name: "Asia", value: 5600, color: "#ffc658" },
  { name: "Australia", value: 1400, color: "#ff8042" },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]

export function RevenueByRegionChart() {
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
        <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
