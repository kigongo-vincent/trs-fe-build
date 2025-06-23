"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "@/components/ui/chart"

const data = [
  {
    name: "Today",
    hours: 32,
  },
  {
    name: "Last Week",
    hours: 180,
  },
  {
    name: "Current Week",
    hours: 220,
  },
  {
    name: "Last Month",
    hours: 720,
  },
  {
    name: "Current Month",
    hours: 820,
  },
]

export function DepartmentHoursChart() {
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
