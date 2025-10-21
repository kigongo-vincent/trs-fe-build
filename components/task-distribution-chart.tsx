"use client"

import { Bar, BarChart, CartesianAxis, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { getHoursByProject } from "@/services/api"
import { getAuthData } from "@/services/auth"
import { Skeleton } from "@/components/ui/skeleton"

interface HoursByProjectData {
  project: string
  totalMinutes: number
}

interface HoursByProjectResponse {
  status: number
  message: string
  data: HoursByProjectData[]
}

interface ChartData {
  name: string
  total: number
}

export function TaskDistributionChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const authData = getAuthData()
        if (!authData?.user?.company?.id) {
          throw new Error("Company ID not found")
        }

        const response = await getHoursByProject(authData.user.company.id) as HoursByProjectResponse

        // Transform data for the bar chart
        const transformedData: ChartData[] = response.data.map(item => ({
          name: item.project,
          total: Math.round(item.totalMinutes / 60) // Convert minutes to hours
        }))

        setChartData(transformedData)
      } catch (err) {
        console.error("Failed to fetch hours by project:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground text-sm">Failed to load chart data</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground text-sm">No project hours data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

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
          tickFormatter={(value) => `${value}h`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
