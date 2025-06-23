"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "@/components/ui/chart"

const data = [
  {
    name: "Development",
    hours: 420,
  },
  {
    name: "Design",
    hours: 320,
  },
  {
    name: "Marketing",
    hours: 240,
  },
  {
    name: "HR",
    hours: 120,
  },
  {
    name: "Finance",
    hours: 148,
  },
]

export function DepartmentComparisonChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
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
