"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "@/components/ui/chart"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const data = [
  {
    name: "Jan",
    basic: 1200,
    standard: 1800,
    premium: 2400,
    enterprise: 3600,
  },
  {
    name: "Feb",
    basic: 1300,
    standard: 1900,
    premium: 2500,
    enterprise: 3700,
  },
  {
    name: "Mar",
    basic: 1400,
    standard: 2000,
    premium: 2600,
    enterprise: 3800,
  },
  {
    name: "Apr",
    basic: 1500,
    standard: 2100,
    premium: 2700,
    enterprise: 3900,
  },
  {
    name: "May",
    basic: 1600,
    standard: 2200,
    premium: 2800,
    enterprise: 4000,
  },
  {
    name: "Jun",
    basic: 1700,
    standard: 2300,
    premium: 2900,
    enterprise: 4100,
  },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
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
        <Bar dataKey="basic" fill={GRAPH_PRIMARY_COLOR} />
        <Bar dataKey="standard" fill={`hsl(var(--chart-2))`} />
        <Bar dataKey="premium" fill={`hsl(var(--chart-4))`} />
        <Bar dataKey="enterprise" fill={`hsl(var(--chart-5))`} />
      </BarChart>
    </ResponsiveContainer>
  )
}
