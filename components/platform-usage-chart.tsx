"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"

const data = [
  {
    name: "Task Management",
    usage: 85,
  },
  {
    name: "Time Tracking",
    usage: 78,
  },
  {
    name: "Reporting",
    usage: 65,
  },
  {
    name: "Invoicing",
    usage: 60,
  },
  {
    name: "Analytics",
    usage: 45,
  },
]

export function PlatformUsageChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis dataKey="name" type="category" />
        <Tooltip formatter={(value: number) => [`${value}%`, "Usage"]} />
        <Legend />
        <Bar dataKey="usage" fill="#8884d8" name="Usage %" />
      </BarChart>
    </ResponsiveContainer>
  )
}
