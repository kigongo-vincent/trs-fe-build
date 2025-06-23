"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jun 2024", salary: 3875 },
  { month: "Jul 2024", salary: 4000 },
  { month: "Aug 2024", salary: 4125 },
  { month: "Sep 2024", salary: 4250 },
  { month: "Oct 2024", salary: 4000 },
  { month: "Nov 2024", salary: 3875 },
  { month: "Dec 2024", salary: 3750 },
  { month: "Jan 2025", salary: 4375 },
  { month: "Feb 2025", salary: 4000 },
  { month: "Mar 2025", salary: 4375 },
  { month: "Apr 2025", salary: 4125 },
  { month: "May 2025", salary: 4250 },
]

const primaryColor = "#F6931B"

export function MonthlySalaryChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, "Salary"]} labelFormatter={(label) => `Period: ${label}`} />
        <Legend />
        <Bar name="Monthly Salary" dataKey="salary" fill={primaryColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
