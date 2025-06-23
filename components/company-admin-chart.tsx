"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "@/components/ui/chart"

const data = [
  {
    name: "Today",
    hours: 42,
  },
  {
    name: "Last Week",
    hours: 280,
  },
  {
    name: "Current Week",
    hours: 320,
  },
  {
    name: "Last Month",
    hours: 1120,
  },
  {
    name: "Current Month",
    hours: 1248,
  },
]

export function CompanyAdminChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="hours" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
