"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"

const data = [
  { month: "Jan", invoices: 85 },
  { month: "Feb", invoices: 92 },
  { month: "Mar", invoices: 98 },
  { month: "Apr", invoices: 105 },
  { month: "May", invoices: 112 },
  { month: "Jun", invoices: 118 },
  { month: "Jul", invoices: 125 },
  { month: "Aug", invoices: 130 },
  { month: "Sep", invoices: 135 },
  { month: "Oct", invoices: 142 },
  { month: "Nov", invoices: 148 },
  { month: "Dec", invoices: 158 },
]

export function InvoiceVolumeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
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
        <Bar dataKey="invoices" fill="#8884d8" name="Number of Invoices" />
      </BarChart>
    </ResponsiveContainer>
  )
}
