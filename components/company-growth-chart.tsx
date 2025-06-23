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
  { month: "Jan", companies: 10 },
  { month: "Feb", companies: 12 },
  { month: "Mar", companies: 15 },
  { month: "Apr", companies: 18 },
  { month: "May", companies: 20 },
  { month: "Jun", companies: 22 },
  { month: "Jul", companies: 24 },
  { month: "Aug", companies: 24 },
  { month: "Sep", companies: 24 },
  { month: "Oct", companies: 24 },
  { month: "Nov", companies: 24 },
  { month: "Dec", companies: 24 },
]

export function CompanyGrowthChart() {
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
        <Line type="monotone" dataKey="companies" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
