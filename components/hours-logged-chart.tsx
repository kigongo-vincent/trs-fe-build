"use client"

import { Line, LineChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"

const defaultData = [
  { date: "May 1", hours: 38 },
  { date: "May 2", hours: 42 },
  { date: "May 3", hours: 45 },
  { date: "May 4", hours: 39 },
  { date: "May 5", hours: 41 },
  { date: "May 6", hours: 40 },
  { date: "May 7", hours: 44 },
  { date: "May 8", hours: 46 },
  { date: "May 9", hours: 43 },
  { date: "May 10", hours: 40 },
  { date: "May 11", hours: 42 },
  { date: "May 12", hours: 45 },
  { date: "May 13", hours: 47 },
  { date: "May 14", hours: 44 },
  { date: "May 15", hours: 42 },
  { date: "May 16", hours: 40 },
  { date: "May 17", hours: 38 },
  { date: "May 18", hours: 41 },
  { date: "May 19", hours: 43 },
  { date: "May 20", hours: 45 },
  { date: "May 21", hours: 44 },
  { date: "May 22", hours: 42 },
  { date: "May 23", hours: 40 },
  { date: "May 24", hours: 38 },
  { date: "May 25", hours: 41 },
  { date: "May 26", hours: 43 },
  { date: "May 27", hours: 45 },
  { date: "May 28", hours: 44 },
  { date: "May 29", hours: 42 },
  { date: "May 30", hours: 40 },
  { date: "May 31", hours: 38 },
]

type HoursLoggedChartProps = {
  data?: { date: string; hours: number }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  isLoading?: boolean;
};

export function HoursLoggedChart({ data = defaultData, xAxisLabel = 'Date', yAxisLabel = 'Hours', isLoading = false }: HoursLoggedChartProps) {
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

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
        <YAxis
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          domain={domain}
          tickFormatter={(value) => Math.round(value).toString()}
        />
        <Tooltip formatter={(value) => [`${value} hours`, "Hours Logged"]} />
        <Legend />
        <Area type="monotone" dataKey="hours" stroke={GRAPH_PRIMARY_COLOR} fill={GRAPH_PRIMARY_COLOR} fillOpacity={0.2} />
        <Line type="monotone" dataKey="hours" stroke={GRAPH_PRIMARY_COLOR} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
