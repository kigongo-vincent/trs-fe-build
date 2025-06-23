"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

const data = [
  { date: "May 1", hours: 38 },
  { date: "May 2", hours: 42 },
  { date: "May 3", hours: 45 },
  { date: "May 4", hours: 39 },
  { date: "May 5", hours: 41 },
  { date: "May 6", hours: 40 },
  { date: "May 7", hours: 44 },
  { date: "May 8", hours: 46 },
  { date: "May 9", hours: 43 },
  { date: "May 10", hours: 40 },
  { date: "May 11", hours: 42 },
  { date: "May 12", hours: 45 },
  { date: "May 13", hours: 47 },
  { date: "May 14", hours: 44 },
  { date: "May 15", hours: 42 },
  { date: "May 16", hours: 40 },
  { date: "May 17", hours: 38 },
  { date: "May 18", hours: 41 },
  { date: "May 19", hours: 43 },
  { date: "May 20", hours: 45 },
  { date: "May 21", hours: 44 },
  { date: "May 22", hours: 42 },
  { date: "May 23", hours: 40 },
  { date: "May 24", hours: 38 },
  { date: "May 25", hours: 41 },
  { date: "May 26", hours: 43 },
  { date: "May 27", hours: 45 },
  { date: "May 28", hours: 44 },
  { date: "May 29", hours: 42 },
  { date: "May 30", hours: 40 },
  { date: "May 31", hours: 38 },
]

export function HoursLoggedChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} hours`, "Hours Logged"]} />
        <Legend />
        <Line type="monotone" dataKey="hours" stroke="#4f46e5" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
