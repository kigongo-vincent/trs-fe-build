"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getHoursByProject } from "@/services/api"
import { getAuthData } from "@/services/auth"
import { getChartColorVariations } from "@/lib/utils"

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
  value: number
  hours: string
  percentage: number
}

export function HoursByProjectChart() {
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

        // Calculate total minutes for percentage calculation
        const totalMinutes = response.data.reduce((sum, item) => sum + item.totalMinutes, 0)

        // Transform data for the chart (without fill, will use color variations)
        const transformedData: ChartData[] = response.data.map((item) => ({
          name: item.project,
          value: item.totalMinutes,
          hours: formatMinutes(item.totalMinutes),
          percentage: totalMinutes > 0 ? Math.round((item.totalMinutes / totalMinutes) * 100) : 0,
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

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours === 0) {
      return `${remainingMinutes}m`
    } else if (remainingMinutes === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${remainingMinutes}m`
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Hours: <span className="font-medium text-foreground">{data.hours}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Only show label if percentage is >= 8% to avoid overcrowding with longer text
    if (percentage < 8) return null

    // Truncate long project names
    const truncatedName = name.length > 12 ? `${name.substring(0, 12)}...` : name

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="11"
        fontWeight="bold"
        className="drop-shadow-sm"
      >
        <tspan x={x} dy="-0.3em">
          {truncatedName}
        </tspan>
        <tspan x={x} dy="1.2em">{`${percentage}%`}</tspan>
      </text>
    )
  }

  const CustomLegend = ({ payload }: any) => {
    // Get color variations to match the pie chart
    const colors = getChartColorVariations(chartData.length);

    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] || entry.color }} />
            <span className="text-muted-foreground truncate max-w-[120px]">
              {entry.value} ({chartData[index]?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-[300px] w-[300px] rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground mb-2">Failed to load chart data</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">No project hours data available</p>
        <p className="text-sm text-muted-foreground mt-1">Start logging time to see the distribution</p>
      </div>
    )
  }

  // Get color variations for pie chart segments
  const colors = getChartColorVariations(chartData.length);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
            label={CustomLabel}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
