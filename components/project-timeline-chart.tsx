"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getProjectsTimeline, type ProjectTimelineItem } from "@/services/projects"
import { getAuthData } from "@/services/auth"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectTimelineChartProps {
  refreshTrigger?: number
}

export function ProjectTimelineChart({ refreshTrigger }: ProjectTimelineChartProps) {
  const [data, setData] = useState<ProjectTimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimelineData = async () => {
    try {
      setLoading(true)
      setError(null)

      const authData = getAuthData()
      if (!authData || !authData.user || !authData.user.company || !authData.user.company.id) {
        setError("Authentication data is missing")
        setLoading(false)
        return
      }

      const companyId = authData.user.company.id
      const response = await getProjectsTimeline(companyId)

      setData(response.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching project timeline:", err)
      setError("Failed to load timeline data")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimelineData()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No project timeline data available</p>
      </div>
    )
  }

  // Truncate long project names for better display
  const chartData = data.map((item) => ({
    ...item,
    displayName: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
    fullName: item.name,
  }))

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
        <Bar dataKey="progress" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Progress" />
      </BarChart>
    </ResponsiveContainer>
  )
}
