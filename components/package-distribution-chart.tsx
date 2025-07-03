"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

interface PackageType {
  id: string;
  name: string;
  description: string;
  price: number;
  durationType: string;
  no_of_users: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PackageDistributionChartProps {
  packages: PackageType[];
  loading?: boolean;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF6F91"]

export function PackageDistributionChart({ packages, loading }: PackageDistributionChartProps) {
  // Group by package name and count number of packages per name
  const data = React.useMemo(() => {
    if (!packages || packages.length === 0) return [];
    const map: Record<string, { name: string; value: number }> = {};
    for (const pkg of packages) {
      if (!map[pkg.name]) {
        map[pkg.name] = { name: pkg.name, value: 1 };
      } else {
        map[pkg.name].value += 1;
      }
    }
    return Object.values(map);
  }, [packages]);

  if (loading) {
    return <Skeleton className="h-[350px] w-full rounded-md" />;
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No package data available.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value}`, "Packages"]}
          labelFormatter={(label) => `Package: ${label}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
