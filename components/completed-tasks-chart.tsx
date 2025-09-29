"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { fetchCompletionTrends, formatWeekLabel } from "@/services/employee"

interface ChartData {
  name: string
  "Completed Tasks": number
  week: number
  startDate: string
  endDate: string
}

export function CompletedTasksChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCompletionTrends = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const trends = await fetchCompletionTrends()

        // Transform API data to chart format
        const transformedData: ChartData[] = trends.map((trend) => ({
          name: formatWeekLabel(trend.startDate, trend.endDate),
          "Completed Tasks": trend.completedTasks,
          week: trend.week,
          startDate: trend.startDate,
          endDate: trend.endDate,
        }))

        setChartData(transformedData)
      } catch (err) {
        console.error("Error loading completion trends:", err)
        setError("Failed to load completion trends. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCompletionTrends()
  }, [])

  const handleRetry = () => {
    const loadCompletionTrends = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const trends = await fetchCompletionTrends()

        const transformedData: ChartData[] = trends.map((trend) => ({
          name: formatWeekLabel(trend.startDate, trend.endDate),
          "Completed Tasks": trend.completedTasks,
          week: trend.week,
          startDate: trend.startDate,
          endDate: trend.endDate,
        }))

        setChartData(transformedData)
      } catch (err) {
        console.error("Error loading completion trends:", err)
        setError("Failed to load completion trends. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCompletionTrends()
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription className="flex items-center justify-between">
          {error}
          <Button onClick={handleRetry} size="sm" variant="outline">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No completion data available</p>
          <p className="text-sm">Complete some tasks to see your trends here.</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
        <YAxis />
        <Tooltip
          contentStyle={{ border: 0 }}
          formatter={(value: number, name: string) => [`${value} ${value === 1 ? "task" : "tasks"}`, name]}
          labelFormatter={(label: string, payload: any) => {
            if (payload && payload.length > 0) {
              const data = payload[0].payload
              return `Week ${data.week}: ${label}`
            }
            return label
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="Completed Tasks"
          stroke="#f6931b"
          fill="#f6931b3A"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
