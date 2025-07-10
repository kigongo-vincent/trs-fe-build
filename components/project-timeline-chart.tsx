"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

interface Project {
  id: string
  name: string
  progress: number
  department: {
    name: string
  }
}

interface ProjectTimelineChartProps {
  projects: Project[]
}

export function ProjectTimelineChart({ projects }: ProjectTimelineChartProps) {
  // Transform data for the chart
  const chartData = projects
    .map((project) => ({
      displayName: project.name.length > 20 ? project.name.substring(0, 20) + "..." : project.name,
      fullName: project.name,
      progress: project.progress,
      department: project.department.name,
    }))
    .sort((a, b) => b.progress - a.progress) // Sort by progress descending

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No project data available</p>
          <p className="text-sm">Projects will appear here once created</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <YAxis type="category" dataKey="displayName" width={120} tick={{ fontSize: 12 }} interval={0} />
        <Tooltip
          formatter={(value, name) => [`${value}%`, "Progress"]}
          labelFormatter={(label) => {
            const item = chartData.find((d) => d.displayName === label)
            return item ? item.fullName : label
          }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Bar dataKey="progress" fill={GRAPH_PRIMARY_COLOR} radius={[0, 4, 4, 0]} name="Progress" />
      </BarChart>
    </ResponsiveContainer>
  )
}
