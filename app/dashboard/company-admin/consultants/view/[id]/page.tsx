"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Mail, TrendingUp, TrendingDown, Minus, Clock, Calendar, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  getConsultantDashboard,
  formatMinutesToHours,
  getDayName,
  getTrendIndicator,
  type ConsultantDashboardData,
} from "@/services/consultants"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ConsultantDetailsPage({ params }: { params: { id: string } }) {
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get consultant basic info from sessionStorage (passed from consultants list)
  const [consultantInfo, setConsultantInfo] = useState<any>(null)

  useEffect(() => {
    // Get consultant info from sessionStorage
    const storedConsultant = sessionStorage.getItem(`consultant_${params.id}`)
    if (storedConsultant) {
      setConsultantInfo(JSON.parse(storedConsultant))
    }

    // Fetch dashboard data
    fetchDashboardData()
  }, [params.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getConsultantDashboard(params.id)
      setDashboardData(response.data)
    } catch (err) {
      console.error("Error fetching consultant dashboard:", err)
      setError("Failed to load consultant dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const chartData =
    dashboardData?.weekDistribution.map((item) => ({
      day: getDayName(item.day),
      hours: item.hours / 60, // Convert minutes to hours for display
      fullDay: getDayName(item.day),
    })) || []

  const todayTrend = dashboardData ? getTrendIndicator(dashboardData.hoursToday.percentage) : null
  const weekTrend = dashboardData ? getTrendIndicator(dashboardData.hoursWeek.percentage) : null
  const monthTrend = dashboardData ? getTrendIndicator(dashboardData.hoursMonth.percentage) : null

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/company-admin/consultants">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-4 w-16 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Skeleton className="h-64 w-full mt-6" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/company-admin/consultants">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Consultant Dashboard</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/company-admin/consultants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Consultant Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
          {consultantInfo?.email && (
            <Button>
              <Mail className="mr-2 h-4 w-4" /> Contact
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Consultant Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={consultantInfo?.avatarUrl || "/placeholder.svg"}
                  alt={consultantInfo?.fullName || "Consultant"}
                />
                <AvatarFallback>
                  {consultantInfo?.fullName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "C"}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{consultantInfo?.fullName || "Consultant"}</h2>
              <p className="text-sm text-muted-foreground">
                {consultantInfo?.jobTitle || consultantInfo?.role?.name || "Consultant"}
              </p>
              <Badge className="mt-2">{consultantInfo?.department?.name || "Department"}</Badge>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              {consultantInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{consultantInfo.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{consultantInfo?.role?.name || "Consultant"}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge
                  variant="outline"
                  className={
                    consultantInfo?.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }
                >
                  {consultantInfo?.status || "Active"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Joined:</span>
                <span className="text-sm">
                  {consultantInfo?.createdAt ? new Date(consultantInfo.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Hours Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Hours Overview</CardTitle>
              <CardDescription>Time tracked across different periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Today */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today</CardTitle>
                    {todayTrend && (
                      <div className={`flex items-center gap-1 ${todayTrend.color}`}>
                        {todayTrend.icon === "up" && <TrendingUp className="h-4 w-4" />}
                        {todayTrend.icon === "down" && <TrendingDown className="h-4 w-4" />}
                        {todayTrend.icon === "neutral" && <Minus className="h-4 w-4" />}
                        <span className="text-xs">{todayTrend.text}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatMinutesToHours(dashboardData?.hoursToday.count || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">{dashboardData?.hoursToday.count || 0} minutes</p>
                  </CardContent>
                </Card>

                {/* This Week */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    {weekTrend && (
                      <div className={`flex items-center gap-1 ${weekTrend.color}`}>
                        {weekTrend.icon === "up" && <TrendingUp className="h-4 w-4" />}
                        {weekTrend.icon === "down" && <TrendingDown className="h-4 w-4" />}
                        {weekTrend.icon === "neutral" && <Minus className="h-4 w-4" />}
                        <span className="text-xs">{weekTrend.text}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatMinutesToHours(dashboardData?.hoursWeek.count || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">{dashboardData?.hoursWeek.count || 0} minutes</p>
                  </CardContent>
                </Card>

                {/* This Month */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    {monthTrend && (
                      <div className={`flex items-center gap-1 ${monthTrend.color}`}>
                        {monthTrend.icon === "up" && <TrendingUp className="h-4 w-4" />}
                        {monthTrend.icon === "down" && <TrendingDown className="h-4 w-4" />}
                        {monthTrend.icon === "neutral" && <Minus className="h-4 w-4" />}
                        <span className="text-xs">{monthTrend.text}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatMinutesToHours(dashboardData?.hoursMonth.count || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">{dashboardData?.hoursMonth.count || 0} minutes</p>
                  </CardContent>
                </Card>
              </div>

              {/* Week Distribution Chart */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Week Distribution</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}h`, "Hours"]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hours data available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest time logs and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentLogs && dashboardData.recentLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Title</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.title}</TableCell>
                        <TableCell>{log.project}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(log.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatMinutesToHours(log.minutes)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              log.status === "active"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                : log.status === "completed"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
