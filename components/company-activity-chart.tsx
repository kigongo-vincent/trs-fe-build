"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "@/components/ui/chart"

const data = [
  {
    date: "Mon",
    tasks: 12,
    logins: 25,
    reports: 5,
  },
  {
    date: "Tue",
    tasks: 18,
    logins: 30,
    reports: 8,
  },
  {
    date: "Wed",
    tasks: 15,
    logins: 28,
    reports: 6,
  },
  {
    date: "Thu",
    tasks: 20,
    logins: 32,
    reports: 10,
  },
  {
    date: "Fri",
    tasks: 22,
    logins: 35,
    reports: 12,
  },
  {
    date: "Sat",
    tasks: 8,
    logins: 15,
    reports: 3,
  },
  {
    date: "Sun",
    tasks: 5,
    logins: 10,
    reports: 2,
  },
]

export function CompanyActivityChart() {
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
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="tasks" stackId="1" stroke="#8884d8" fill="#8884d8" name="Tasks Created" />
        <Area type="monotone" dataKey="logins" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="User Logins" />
        <Area type="monotone" dataKey="reports" stackId="3" stroke="#ffc658" fill="#ffc658" name="Reports Generated" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
