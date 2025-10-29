"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import type { DepartmentSummary } from "@/services/consultants"
import { getChartColorVariations } from "@/lib/utils"

interface ConsultantsByDepartmentChartProps {
  departmentSummary?: DepartmentSummary[]
}

export function ConsultantsByDepartmentChart({ departmentSummary = [] }: ConsultantsByDepartmentChartProps) {
  // Transform the data for the chart
  const data = departmentSummary.map((dept) => ({
    name: dept.name,
    count: dept.consultantCount,
    head: dept.head,
  }))

  // Sort by count (descending)
  data.sort((a, b) => b.count - a.count)

  // Get color variations for all bars
  const colors = getChartColorVariations(data.length)

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Department</span>
                      <span className="font-bold text-muted-foreground">{data.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Department Head</span>
                      <span className="font-medium text-muted-foreground">{data.head}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Consultants</span>
                      <span className="font-bold text-primary">{data.count}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
