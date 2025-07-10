"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

interface TasksByDepartmentChartProps {
  data: Array<{
    department: string
    tasks: number
  }>
}

export function TasksByDepartmentChart({ data }: TasksByDepartmentChartProps) {
  // Transform data for the chart
  const chartData = data?.map((item) => ({
    name: item.department,
    tasks: item.tasks,
  })) || []

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No tasks data available</p>
          <p className="text-sm">Tasks will appear here once created</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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
          interval={0}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
        <Bar dataKey="tasks" fill={GRAPH_PRIMARY_COLOR} radius={[4, 4, 0, 0]} name="Tasks" />
      </BarChart>
    </ResponsiveContainer>
  )
}
