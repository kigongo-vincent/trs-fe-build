"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTasksByDepartment, type TasksByDepartmentData } from "@/services/tasks"

interface TasksByDepartmentChartProps {
  className?: string
}

export function TasksByDepartmentChart({ className }: TasksByDepartmentChartProps) {
  const [data, setData] = useState<TasksByDepartmentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTasksByDepartment() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetchTasksByDepartment()
        setData(response.data)
      } catch (err) {
        console.error("Failed to fetch tasks by department:", err)
        setError(err instanceof Error ? err.message : "Failed to load tasks by department")
      } finally {
        setIsLoading(false)
      }
    }

    loadTasksByDepartment()
  }, [])

  if (isLoading) {
    return (
      <div className={`h-[300px] flex items-center justify-center ${className}`}>
        <div className="space-y-2 text-center">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
          <div className="grid grid-cols-4 gap-2 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`h-[300px] flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Failed to load tasks by department</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`h-[300px] flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No tasks found</p>
          <p className="text-xs mt-1">Tasks will appear here once they are created</p>
        </div>
      </div>
    )
  }

  // Transform data for the chart
  const chartData = data.map((item) => ({
    name: item.departmentName,
    tasks: item.totalTasks,
  }))

  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => [`${value} ${value === 1 ? "task" : "tasks"}`, "Count"]}
          labelFormatter={(label) => `Department: ${label}`}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Bar dataKey="tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Tasks" />
      </BarChart>
    </ResponsiveContainer>
  )
}
