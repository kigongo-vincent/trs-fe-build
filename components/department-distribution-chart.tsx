"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import { getChartColorVariations } from "@/lib/utils"

interface User {
  id: string
  fullName: string
  email: string
  status: string
}

interface Department {
  id: string
  name: string
  head: string
  status: string
  description: string | null
  createdAt: string | null
  updatedAt: string
  users: User[]
  projects: any[]
}

interface DepartmentDistributionChartProps {
  departments: Department[]
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-background border shadow-md p-3">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-sm text-muted-foreground">{`Employees: ${payload[0].value}`}</p>
      </Card>
    )
  }

  return null
}

export function DepartmentDistributionChart({ departments }: DepartmentDistributionChartProps) {
  // Transform departments data for the chart
  const chartData = departments.map((dept) => ({
    name: dept.name,
    employees: dept.users.length,
    head: dept.head,
    status: dept.status,
  }))

  // Format tick labels to handle long department names
  const formatXAxis = (tickItem: string) => {
    if (tickItem.length > 12) {
      return `${tickItem.substring(0, 12)}...`
    }
    return tickItem
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No department data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 50,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            tickFormatter={formatXAxis}
            interval={0}
            fontSize={12}
          />
          <YAxis />
          {/* <Tooltip content={<CustomTooltip />} /> */}
          <Bar dataKey="employees" radius={[4, 4, 0, 0]}>
            {(() => {
              const colors = getChartColorVariations(chartData.length);
              return chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ));
            })()}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
