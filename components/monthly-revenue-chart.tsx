"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 4500 },
  { month: "Mar", revenue: 6000 },
  { month: "Apr", revenue: 8000 },
  { month: "May", revenue: 9500 },
  { month: "Jun", revenue: 11000 },
  { month: "Jul", revenue: 12500 },
  { month: "Aug", revenue: 13000 },
  { month: "Sep", revenue: 13500 },
  { month: "Oct", revenue: 14000 },
  { month: "Nov", revenue: 14200 },
  { month: "Dec", revenue: 14500 },
]

export function MonthlyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
        <Area type="monotone" dataKey="revenue" stroke={GRAPH_PRIMARY_COLOR} fill={GRAPH_PRIMARY_COLOR} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
