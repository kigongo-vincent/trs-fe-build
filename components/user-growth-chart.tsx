"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "@/components/ui/chart"

const data = [
  { month: "Jan", users: 240 },
  { month: "Feb", users: 280 },
  { month: "Mar", users: 320 },
  { month: "Apr", users: 380 },
  { month: "May", users: 420 },
  { month: "Jun", users: 480 },
  { month: "Jul", users: 520 },
  { month: "Aug", users: 540 },
  { month: "Sep", users: 560 },
  { month: "Oct", users: 570 },
  { month: "Nov", users: 573 },
  { month: "Dec", users: 580 },
]

export function UserGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="users" stroke="#82ca9d" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
