"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"

const data = [
  {
    name: "Basic",
    revenue: 12180,
  },
  {
    name: "Standard",
    revenue: 17640,
  },
  {
    name: "Premium",
    revenue: 10430,
  },
  {
    name: "Enterprise",
    revenue: 8990,
  },
]

export function RevenueByPackageChart() {
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
        <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}
