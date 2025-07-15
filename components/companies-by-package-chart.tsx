"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"
import React from "react"

type Company = {
  id: string
  name: string
  email?: string
  users?: number
  status?: string
  createdAt?: string
  package?: string
}

type CompaniesByPackageChartProps = {
  data: Company[]
}

export function CompaniesByPackageChart({ data }: CompaniesByPackageChartProps) {
  // Aggregate companies by package
  const packageCounts: Record<string, number> = {}
  data.forEach((company) => {
    const pkg = company.package || "Unknown"
    packageCounts[pkg] = (packageCounts[pkg] || 0) + 1
  })
  const chartData = Object.entries(packageCounts).map(([name, companies]) => ({ name, companies }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value) => [`${value} companies`, "Count"]} />
        <Legend />
        <Bar dataKey="companies" fill={GRAPH_PRIMARY_COLOR} name="Companies" />
      </BarChart>
    </ResponsiveContainer>
  )
}
