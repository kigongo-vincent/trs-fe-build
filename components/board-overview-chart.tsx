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
    hours: 980,
  },
  {
    name: "Feb",
    hours: 1050,
  },
  {
    name: "Mar",
    hours: 1100,
  },
  {
    name: "Apr",
    hours: 1150,
  },
  {
    name: "May",
    hours: 1200,
  },
  {
    name: "Jun",
    hours: 1248,
  },
]

export function BoardOverviewChart() {
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
        <Line type="monotone" dataKey="hours" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
