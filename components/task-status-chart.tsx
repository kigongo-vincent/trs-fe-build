"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { getChartColorVariations } from "@/lib/utils"

interface TaskStatusChartProps {
  activeTasks: number
  draftTasks: number
}

export function TaskStatusChart({ activeTasks, draftTasks }: TaskStatusChartProps) {
  if (activeTasks === 0 && draftTasks === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No tasks data available</p>
          <p className="text-sm">Tasks will appear here once created</p>
        </div>
      </div>
    )
  }

  const data = [
    { name: "Active", value: activeTasks },
    { name: "Draft", value: draftTasks },
  ].filter((item) => item.value > 0) // Only show segments with data

  // Get color variations for pie chart segments
  const colors = getChartColorVariations(data.length);

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
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
