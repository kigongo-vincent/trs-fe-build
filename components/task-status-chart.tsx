"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts"

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

  const COLORS = ["#10b981", "#f59e0b"] // Green for Active, Yellow for Draft

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
        <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
