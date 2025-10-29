"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { getChartColorVariations } from "@/lib/utils"
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

  // Calculate dynamic domain based on data
  const maxValue = Math.max(...data.map(item => item.hours));
  const minValue = Math.min(...data.map(item => item.hours));
  const padding = Math.max(1, Math.ceil(maxValue * 0.1)); // 10% padding, minimum 1, rounded up
  const domain = [Math.max(0, Math.floor(minValue - padding)), Math.ceil(maxValue + padding)];

  // Get color variations for all bars
  const colors = getChartColorVariations(data.length);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
        <YAxis
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          domain={domain}
          tickFormatter={(value) => Math.round(value).toString()}
        />
        <Tooltip formatter={(value, name) => [`${value} hours`, "Hours Logged"]} />
        <Bar dataKey="hours" radius={[4, 4, 0, 0]} name="Hours Logged">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
