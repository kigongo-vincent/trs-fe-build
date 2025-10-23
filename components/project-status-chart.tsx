"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

interface ProjectStatusChartProps {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
}

const COLORS = ["#F6931B", "#111827", "#6b7280"]

export function ProjectStatusChart({
  totalProjects,
  activeProjects,
  completedProjects,
  onHoldProjects,
}: ProjectStatusChartProps) {
  // Create data array from the summary props
  const data = [
    { name: "Active", value: activeProjects },
    { name: "Completed", value: completedProjects },
    { name: "On Hold", value: onHoldProjects },
  ].filter((item) => item.value > 0) // Only show segments with data

  // Show empty state if no projects
  if (totalProjects === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No projects data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} projects`, "Count"]}
          labelFormatter={(label) => `${label} Projects`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
