"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const defaultData = [
  { name: "John Doe", hours: 40, tasks: 12 },
  { name: "Jane Smith", hours: 35, tasks: 8 },
  { name: "Mike Johnson", hours: 42, tasks: 15 },
  { name: "Sarah Wilson", hours: 38, tasks: 10 },
  { name: "David Brown", hours: 45, tasks: 18 },
];

type EmployeePerformanceChartProps = {
  data?: { name: string; hours: number }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  isLoading?: boolean;
};

export function EmployeePerformanceChart({ data = defaultData, xAxisLabel = 'Employee', yAxisLabel = 'Hours Logged', isLoading = false }: EmployeePerformanceChartProps) {
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
        <Bar dataKey="hours" fill={GRAPH_PRIMARY_COLOR} radius={[0, 4, 4, 0]} name="Hours Logged" />
      </BarChart>
    </ResponsiveContainer>
  )
}
