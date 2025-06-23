"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Development", employees: 12 },
  { name: "Design", employees: 8 },
  { name: "Marketing", employees: 6 },
  { name: "Sales", employees: 5 },
  { name: "HR", employees: 4 },
  { name: "Finance", employees: 4 },
  { name: "Customer Support", employees: 3 },
]

export function EmployeesByDepartmentChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} employees`, "Count"]} />
        <Bar dataKey="employees" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
