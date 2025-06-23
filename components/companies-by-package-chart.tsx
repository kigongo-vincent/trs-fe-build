"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"

const data = [
  {
    name: "Basic",
    companies: 8,
  },
  {
    name: "Standard",
    companies: 10,
  },
  {
    name: "Premium",
    companies: 4,
  },
  {
    name: "Enterprise",
    companies: 2,
  },
]

export function CompaniesByPackageChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="companies" fill="#8884d8" name="Companies" />
      </BarChart>
    </ResponsiveContainer>
  )
}
