"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

const data = [
  { month: "Jan", completion: 65 },
  { month: "Feb", completion: 68 },
  { month: "Mar", completion: 72 },
  { month: "Apr", completion: 75 },
  { month: "May", completion: 78 },
]

export function ProjectCompletionChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
        <Legend />
        <Line
          type="monotone"
          dataKey="completion"
          stroke="#4f46e5"
          activeDot={{ r: 8 }}
          name="Project Completion Rate"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
