"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  {
    name: "Mon",
    hours: 6.5,
  },
  {
    name: "Tue",
    hours: 7.0,
  },
  {
    name: "Wed",
    hours: 5.5,
  },
  {
    name: "Thu",
    hours: 8.0,
  },
  {
    name: "Fri",
    hours: 7.5,
  },
  {
    name: "Sat",
    hours: 2.0,
  },
  {
    name: "Sun",
    hours: 0.0,
  },
]

export function ConsultantHoursChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="hours" fill={GRAPH_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
