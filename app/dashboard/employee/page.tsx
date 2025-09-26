"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import { EmployeeHoursChart } from "@/components/employee-hours-chart"
import {
  fetchEmployeeDashboard,
  type EmployeeDashboardData,
  formatMinutesToHours,
  formatHoursCount,
} from "@/services/employee"
import { useRouter } from "next/navigation"
import { getAuthUser, getUserRole, isAuthenticated, isTokenExpired } from "@/services/auth"

export default function EmployeeDashboard() {
  const [showAdd, setShowAdd] = useState(true)

  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const bgs = [
    "https://static.vecteezy.com/system/resources/previews/011/171/103/large_2x/white-and-orange-modern-background-free-vector.jpg",

  ]

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isAuthenticated() || isTokenExpired()) {
        router.replace("/")
        return
      }
      const role = getUserRole()
      if (role !== "Consultant" && role !== "Employee") {
        switch (role) {
          case "Super Admin":
            router.replace("/dashboard/super-admin")
            break
          case "Company Admin":
            router.replace("/dashboard/company-admin")
            break
          default:
            router.replace("/dashboard/employee")
        }
      }
    }
  }, [router])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchEmployeeDashboard()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const getPercentageIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (percentage < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 " />
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage > 0) return "text-green-600"
    if (percentage < 0) return "text-red-600"
    return ""
  }

  // Helper to calculate percentage increase if not provided
  function calculatePercentage(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Get today's and yesterday's hours from weekDistribution
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sun, 1=Mon, ...
  const yesterdayIdx = (todayIdx - 1 + 7) % 7;
  const weekDistribution = dashboardData?.weekDistribution ?? [];
  const todayDist = weekDistribution.find((d) => d.day === todayIdx);
  const yesterdayDist = weekDistribution.find((d) => d.day === yesterdayIdx);
  const hoursTodayCount = todayDist ? todayDist.hours : 0;
  const hoursYesterdayCount = yesterdayDist ? yesterdayDist.hours : 0;
  const hoursTodayPercentage = calculatePercentage(hoursTodayCount, hoursYesterdayCount);

  // For 'Hours This Month', compare to last month
  const hoursMonthCount = dashboardData?.hoursMonth?.count ?? 0;
  const hoursLastMonthCount = (dashboardData as any)?.hoursLastMonth?.count ?? 0;
  const hoursMonthPercentage = calculatePercentage(hoursMonthCount, hoursLastMonthCount);

  // For 'Hours Last Month', compare to two months ago if available
  // If API provides hoursTwoMonthsAgo, use it; otherwise fallback to 0
  const hoursTwoMonthsAgoCount = (dashboardData as any)?.hoursTwoMonthsAgo?.count ?? 0;
  const hoursLastMonthPercentage = calculatePercentage(hoursLastMonthCount, hoursTwoMonthsAgoCount);

  // Debug output
  if (typeof window !== 'undefined') {

  }



  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Hello</h1>
          <Button asChild>
            <Link href="/dashboard/employee/time-logs/new">
              <Plus className="mr-2 h-4 w-4" /> Log Time
            </Link>
          </Button>
        </div>
        <Alert>
          <AlertDescription>{error}. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  // Separate today's and yesterday's logs
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  const todayLogs = dashboardData.recentLogs.filter((log) => new Date(log.date).toDateString() === today)

  const yesterdayLogs = dashboardData.recentLogs.filter((log) => new Date(log.date).toDateString() === yesterday)

  const user = getAuthUser()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gradient">Hello, {user.fullName}</h1>
        <div className="flex items-center gap-2">
          {
            showAdd ? <Button asChild className="gradient">
              <Link href="/dashboard/employee/time-logs/new">
                <Plus className="mr-2 h-4 w-4" /> Log Time
              </Link>
            </Button>
              : ""
          }
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-[url(https://static.vecteezy.com/system/resources/previews/011/171/103/large_2x/white-and-orange-modern-background-free-vector.jpg)] bg-right bg-cover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl  text-primary">{formatHoursCount(hoursTodayCount)}h</div>
            <div className="flex items-center backdrop-blur-sm p-4 bg-white/30 rounded gap-1 text-xs">
              {getPercentageIcon(hoursTodayPercentage)}
              <span className={getPercentageColor(hoursTodayPercentage)}>
                {hoursTodayPercentage > 0 ? "+" : ""}
                {hoursTodayPercentage}% from yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex items-center p-4 justify-center bg-[url(https://static.vecteezy.com/system/resources/previews/011/171/105/large_2x/white-background-with-orange-geometric-free-vector.jpg)] bg-cover border-0">
          <div className="bg-white/70 backdrop-blur-sm rounded w-full">
            <CardHeader className="flex flex-row items-center  justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className=" mx-4 p-4 ">
              <div className="text-2xl  text-primary">{formatHoursCount(dashboardData.hoursWeek.count)}h</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getPercentageIcon(dashboardData.hoursWeek.percentage)}
                <span className={getPercentageColor(dashboardData.hoursWeek.percentage)}>
                  {dashboardData.hoursWeek.percentage > 0 ? "+" : ""}
                  {dashboardData.hoursWeek.percentage}% from last week
                </span>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="text-white bg-[url(https://static.vecteezy.com/system/resources/previews/005/181/853/large_2x/minimal-orange-background-gradient-abstract-creative-scratch-digital-background-free-vector.jpg)] bg-bottom bg-cover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-white font-medium">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl  ">{formatHoursCount(hoursMonthCount)}h</div>
            <div className="flex items-center gap-1 text-xs d">
              {getPercentageIcon(hoursMonthPercentage)}
              <span className={getPercentageColor(hoursMonthPercentage)}>
                {hoursMonthPercentage > 0 ? "+" : ""}
                {hoursMonthPercentage}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className=" bg-center border-0 bg-cover bg-[url(https://static.vecteezy.com/system/resources/previews/046/849/177/non_2x/3d-white-abstract-background-overlap-layer-on-bright-space-with-cutout-shape-effect-decoration-modern-graphic-design-element-circles-style-concept-for-web-banner-flyer-card-or-brochure-cover-vector.jpg)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Last Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl  text-primary">{formatHoursCount(hoursLastMonthCount)}h</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getPercentageIcon(hoursLastMonthPercentage)}
              <span className={getPercentageColor(hoursLastMonthPercentage)}>
                {hoursLastMonthPercentage > 0 ? "+" : ""}
                {hoursLastMonthPercentage}% from previous month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger onClick={() => setShowAdd(true)} value="today">Today's Tasks ({todayLogs.length})</TabsTrigger>
          <TabsTrigger onClick={() => setShowAdd(false)} value="yesterday">Yesterday's Tasks ({yesterdayLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gradient">Today's Tasks</CardTitle>
              <CardDescription>Tasks logged for today</CardDescription>
            </CardHeader>
            <CardContent>
              {todayLogs.length > 0 ? (
                <div className="space-y-4">
                  {todayLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.title}</p>
                          <p className="text-xs text-muted-foreground">Project: {log.project}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatMinutesToHours(log.minutes)}</span>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {log.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks logged for today yet.</p>
                  <p className="text-sm">Start logging your time to see your progress!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gradient">Hours Overview</CardTitle>
              <CardDescription>Your logged hours over the week</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <EmployeeHoursChart data={dashboardData.weekDistribution} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yesterday" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yesterday's Tasks</CardTitle>
              <CardDescription>Tasks logged for yesterday</CardDescription>
            </CardHeader>
            <CardContent>
              {yesterdayLogs.length > 0 ? (
                <div className="space-y-4">
                  {yesterdayLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.title}</p>
                          <p className="text-xs text-muted-foreground">Project: {log.project}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatMinutesToHours(log.minutes)}</span>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {log.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks logged for yesterday.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
