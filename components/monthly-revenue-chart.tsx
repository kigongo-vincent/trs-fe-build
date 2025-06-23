"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "@/components/ui/chart"

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 4200 },
  { month: "Mar", revenue: 4500 },
  { month: "Apr", revenue: 4800 },
  { month: "May", revenue: 5100 },
  { month: "Jun", revenue: 5400 },
  { month: "Jul", revenue: 5700 },
  { month: "Aug", revenue: 6000 },
  { month: "Sep", revenue: 6300 },
  { month: "Oct", revenue: 6600 },
  { month: "Nov", revenue: 6900 },
  { month: "Dec", revenue: 7200 },
]

export function MonthlyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
