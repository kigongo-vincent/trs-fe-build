"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const defaultData = [
  { name: "Development", hours: 420, tasks: 42, completion: 85 },
  { name: "Design", hours: 320, tasks: 28, completion: 92 },
  { name: "Marketing", hours: 240, tasks: 18, completion: 78 },
  { name: "Sales", hours: 180, tasks: 24, completion: 75 },
  { name: "HR", hours: 120, tasks: 12, completion: 95 },
  { name: "Finance", hours: 148, tasks: 16, completion: 82 },
  { name: "Customer Support", hours: 160, tasks: 16, completion: 88 },
]

type DepartmentPerformanceChartProps = {
  data?: { name: string; hours: number }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  isLoading?: boolean;
};

export function DepartmentPerformanceChart({ data = defaultData, xAxisLabel = 'Department', yAxisLabel = 'Hours Logged', isLoading = false }: DepartmentPerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value, name) => [`${value} hours`, "Hours Logged"]} />
        <Bar dataKey="hours" fill={GRAPH_PRIMARY_COLOR} radius={[4, 4, 0, 0]} name="Hours Logged" />
      </BarChart>
    </ResponsiveContainer>
  )
}
