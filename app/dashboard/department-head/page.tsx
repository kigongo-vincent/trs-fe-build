"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, FileText, Plus, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react";
import { fetchDepartmentHeadStats, DepartmentHeadStatItem } from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from '@/components/ui/chart';

// Hardcoded data for Hours Overview (Bar Chart)
const hoursData = [
  { week: 'Week 1', hours: 40 },
  { week: 'Week 2', hours: 55 },
  { week: 'Week 3', hours: 60 },
  { week: 'Week 4', hours: 50 },
];

// Hardcoded data for Task Status (Pie Chart)
const taskStatusData = [
  { name: 'Completed', value: 20 },
  { name: 'In Progress', value: 15 },
  { name: 'Pending', value: 7 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function DepartmentHeadDashboard() {
  const [stats, setStats] = useState<DepartmentHeadStatItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartmentHeadStats()
      .then(res => setStats(res.data))
      .catch(err => setError("Failed to load statistics."))
      .finally(() => setLoading(false));
  }, []);

  // Map stats to card values
  const getStatValue = (label: string) =>
    stats?.find(item => item.label.toLowerCase().includes(label.toLowerCase()))?.value ?? '--';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Department Head Dashboard</h1>
        <div className="flex items-center gap-2"></div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading statistics...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatValue('project')}</div>
              <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
  {loading ? (
    <Skeleton className="h-8 w-20 mb-2" />
  ) : (
    <div className="text-2xl font-bold">{getStatValue('task')}</div>
  )}
  <p className="text-xs text-muted-foreground">&nbsp;</p>
</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
  {loading ? (
    <Skeleton className="h-8 w-20 mb-2" />
  ) : (
    <div className="text-2xl font-bold">{getStatValue('team')}</div>
  )}
  <p className="text-xs text-muted-foreground">&nbsp;</p>
</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
  {loading ? (
    <Skeleton className="h-8 w-24 mb-2" />
  ) : (
    <div className="text-2xl font-bold">
      {isNaN(Number(getStatValue('minute')))
        ? getStatValue('minute')
        : (Number(getStatValue('minute')) / 60).toFixed(2)}
    </div>
  )}
</CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
