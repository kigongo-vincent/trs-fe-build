"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    companies: 10,
    revenue: 4000,
    users: 240,
  },
  {
    name: "Feb",
    companies: 12,
    revenue: 4500,
    users: 280,
  },
  {
    name: "Mar",
    companies: 15,
    revenue: 6000,
    users: 320,
  },
  {
    name: "Apr",
    companies: 18,
    revenue: 8000,
    users: 380,
  },
  {
    name: "May",
    companies: 20,
    revenue: 9500,
    users: 420,
  },
  {
    name: "Jun",
    companies: 22,
    revenue: 11000,
    users: 480,
  },
  {
    name: "Jul",
    companies: 24,
    revenue: 12500,
    users: 520,
  },
  {
    name: "Aug",
    companies: 24,
    revenue: 13000,
    users: 540,
  },
  {
    name: "Sep",
    companies: 24,
    revenue: 13500,
    users: 560,
  },
  {
    name: "Oct",
    companies: 24,
    revenue: 14000,
    users: 570,
  },
  {
    name: "Nov",
    companies: 24,
    revenue: 14200,
    users: 573,
  },
  {
    name: "Dec",
    companies: 24,
    revenue: 14500,
    users: 580,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
        <Area type="monotone" dataKey="users" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
        <Area type="monotone" dataKey="companies" stackId="3" stroke="#ffc658" fill="#ffc658" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
