"use client"

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    companies: 10,
    users: 240,
    licenses: 42,
  },
  {
    name: "Feb",
    companies: 12,
    users: 280,
    licenses: 48,
  },
  {
    name: "Mar",
    companies: 15,
    users: 320,
    licenses: 60,
  },
  {
    name: "Apr",
    companies: 18,
    users: 380,
    licenses: 72,
  },
  {
    name: "May",
    companies: 20,
    users: 420,
    licenses: 84,
  },
  {
    name: "Jun",
    companies: 22,
    users: 480,
    licenses: 96,
  },
  {
    name: "Jul",
    companies: 24,
    users: 520,
    licenses: 108,
  },
  {
    name: "Aug",
    companies: 24,
    users: 540,
    licenses: 114,
  },
  {
    name: "Sep",
    companies: 24,
    users: 560,
    licenses: 120,
  },
  {
    name: "Oct",
    companies: 24,
    users: 570,
    licenses: 126,
  },
  {
    name: "Nov",
    companies: 24,
    users: 573,
    licenses: 132,
  },
  {
    name: "Dec",
    companies: 24,
    users: 580,
    licenses: 138,
  },
]

export function SuperAdminChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
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
        <Legend />
        <Line type="monotone" dataKey="companies" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="users" stroke="#82ca9d" />
        <Line type="monotone" dataKey="licenses" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  )
}
