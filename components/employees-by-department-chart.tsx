"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  { name: "Engineering", employees: 18 },
  { name: "Marketing", employees: 8 },
  { name: "Sales", employees: 10 },
  { name: "HR", employees: 3 },
  { name: "Finance", employees: 3 },
  { name: "Customer Support", employees: 5 },
]

export function EmployeesByDepartmentChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="employees" fill={GRAPH_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
