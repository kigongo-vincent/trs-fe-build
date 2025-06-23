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
  ReferenceLine,
} from "@/components/ui/chart"

const data = [
  // Historical data
  { month: "Jan", revenue: 4000, projected: null },
  { month: "Feb", revenue: 4200, projected: null },
  { month: "Mar", revenue: 4500, projected: null },
  { month: "Apr", revenue: 4800, projected: null },
  { month: "May", revenue: 5100, projected: null },
  { month: "Jun", revenue: 5400, projected: null },
  // Projected data
  { month: "Jul", revenue: null, projected: 5700 },
  { month: "Aug", revenue: null, projected: 6000 },
  { month: "Sep", revenue: null, projected: 6300 },
  { month: "Oct", revenue: null, projected: 6600 },
  { month: "Nov", revenue: null, projected: 6900 },
  { month: "Dec", revenue: null, projected: 7200 },
]

export function RevenueProjectionChart() {
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
        <Tooltip formatter={(value) => (value ? [`$${value}`, "Revenue"] : ["", ""])} />
        <Legend />
        <ReferenceLine x="Jun" stroke="#666" label="Current" />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Actual Revenue" />
        <Line type="monotone" dataKey="projected" stroke="#82ca9d" strokeDasharray="5 5" name="Projected Revenue" />
      </LineChart>
    </ResponsiveContainer>
  )
}
