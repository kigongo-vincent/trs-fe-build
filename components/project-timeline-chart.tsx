"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { getChartColorVariations } from "@/lib/utils"
import type { FreelancerProjectTimelineEntry } from "@/services/api"

export interface ProjectTimelineChartProps {
  timelines: FreelancerProjectTimelineEntry[]
}

export function ProjectTimelineChart({ timelines }: ProjectTimelineChartProps) {
  // Handle null/undefined timelines
  if (!timelines || !Array.isArray(timelines)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No project data available</p>
          <p className="text-sm">Projects will appear here once created</p>
        </div>
      </div>
    )
  }

  // Transform data for the chart
  const chartData = timelines
    .filter(project => project && project.projectName) // Filter out invalid entries
    .map((project) => ({
      displayName: project.projectName.length > 20 ? project.projectName.substring(0, 20) + "..." : project.projectName,
      fullName: project.projectName,
      progress: calculateProgress(project.startDate, project.endDate, project.status),
      status: project.status,
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

  // Get color variations for all bars
  const colors = getChartColorVariations(chartData.length);

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
        <Bar dataKey="progress" radius={[0, 4, 4, 0]} name="Progress">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function calculateProgress(startDate: string, endDate: string, status?: string) {
  if ((status || "").toLowerCase() === "completed") {
    return 100
  }

  if (!startDate || !endDate) {
    return 0
  }

  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }

  const now = Date.now()

  if (now <= start) {
    return 0
  }

  const elapsed = Math.min(now, end) - start
  const total = end - start

  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}
