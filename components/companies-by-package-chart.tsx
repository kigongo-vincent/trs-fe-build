"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  { name: "Basic", companies: 15 },
  { name: "Standard", companies: 25 },
  { name: "Premium", companies: 18 },
  { name: "Enterprise", companies: 8 },
]

export function CompaniesByPackageChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} companies`, "Count"]} />
        <Legend />
        <Bar dataKey="companies" fill={GRAPH_PRIMARY_COLOR} name="Companies" />
      </BarChart>
    </ResponsiveContainer>
  )
}
