"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan 2025", amount: 28750 },
  { month: "Feb 2025", amount: 27500 },
  { month: "Mar 2025", amount: 29375 },
  { month: "Apr 2025", amount: 28125 },
  { month: "May 2025", amount: 30000 },
]

export function MonthlyInvoiceChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />
        <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
