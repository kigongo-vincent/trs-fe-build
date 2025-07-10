"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  {
    name: "Mon",
    "Website Redesign": 150,
    "Bug Fixes": 60,
    "Product Launch": 0,
    "Marketing Campaign": 90,
  },
  {
    name: "Tue",
    "Website Redesign": 60,
    "Bug Fixes": 120,
    "Product Launch": 90,
    "Marketing Campaign": 0,
  },
  {
    name: "Wed",
    "Website Redesign": 0,
    "Bug Fixes": 90,
    "Product Launch": 180,
    "Marketing Campaign": 0,
  },
  {
    name: "Thu",
    "Website Redesign": 120,
    "Bug Fixes": 0,
    "Product Launch": 60,
    "Marketing Campaign": 120,
  },
  {
    name: "Fri",
    "Website Redesign": 120,
    "Bug Fixes": 90,
    "Product Launch": 0,
    "Marketing Campaign": 210,
  },
  {
    name: "Sat",
    "Website Redesign": 0,
    "Bug Fixes": 0,
    "Product Launch": 60,
    "Marketing Campaign": 0,
  },
  {
    name: "Sun",
    "Website Redesign": 0,
    "Bug Fixes": 0,
    "Product Launch": 0,
    "Marketing Campaign": 0,
  },
]

export function TimeLogsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Website Redesign" fill={GRAPH_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Bug Fixes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Product Launch" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Marketing Campaign" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
