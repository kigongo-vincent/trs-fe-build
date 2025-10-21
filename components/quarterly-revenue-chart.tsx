"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"

const data = [
  {
    name: "Q1 2023",
    revenue: 12500,
  },
  {
    name: "Q2 2023",
    revenue: 15300,
  },
  {
    name: "Q3 2023",
    revenue: 17900,
  },
  {
    name: "Q4 2023",
    revenue: 20700,
  },
  {
    name: "Q1 2024",
    revenue: 23800,
  },
]

export function QuarterlyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}
