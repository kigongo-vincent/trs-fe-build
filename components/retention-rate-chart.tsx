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
  { month: "Jan", retention: 92 },
  { month: "Feb", retention: 93 },
  { month: "Mar", retention: 94 },
  { month: "Apr", retention: 95 },
  { month: "May", retention: 96 },
  { month: "Jun", retention: 97 },
  { month: "Jul", retention: 97 },
  { month: "Aug", retention: 98 },
  { month: "Sep", retention: 98 },
  { month: "Oct", retention: 97 },
  { month: "Nov", retention: 98 },
  { month: "Dec", retention: 98 },
]

export function RetentionRateChart() {
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
        <YAxis domain={[90, 100]} />
        <Tooltip formatter={(value) => [`${value}%`, "Retention Rate"]} />
        <Legend />
        <Line type="monotone" dataKey="retention" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
