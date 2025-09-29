"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Plus, TrendingUp, TrendingDown, Minus, Calendar1, CalendarArrowDown, CalendarArrowUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { EmployeeHoursChart } from "@/components/employee-hours-chart"
import {
  fetchEmployeeDashboard,
  type EmployeeDashboardData,
  formatMinutesToHours,
  formatHoursCount,
} from "@/services/employee"
import { useRouter } from "next/navigation"
import { getAuthUser, getUserRole, isAuthenticated, isTokenExpired } from "@/services/auth"
import { MotionBlock } from "@/components/MotionBlock"

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

  const getPercentageIcon = (percentage: number, index?: number) => {
    if (percentage > 0) return <TrendingUp className={`h-4 w-4 ${index == 0 ? "" : "text-green-600"}`} />
    if (percentage < 0) return <TrendingDown className={`h-4 w-4 ${index == 0 ? "" : "text-red-600"}`} />
    return <Minus className="h-4 w-4 " />
  }

  const getPercentageColor = (percentage: number, index?: number) => {
    if (index == 0) {
      return ""
    }
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
      {/* Header */}
      <MotionBlock delay={0}>
        <div className="flex md:h-[5vh] h-max items-center justify-between">
          <div className="">
            <h1 className="text tracking-tight">
              Hello, <span className="font-semibold">{user.lastName}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {showAdd && (
              <MotionBlock delay={.1}>
                <Button asChild className="gradient rounded-full">
                  <Link href="/dashboard/employee/time-logs/new">
                    <Plus size={25} className="h-10 w-10 rounded-full" /> Log Time
                  </Link>
                </Button>
              </MotionBlock>
            )}
          </div>
        </div>
      </MotionBlock>

      {/* Dashboard Cards */}
      <MotionBlock delay={0.1}>
        <div className="text-white bg-paper p-8 rounded-lg grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => {
            const dataMap = [
              {
                title: 'Hours This Week',
                icon: <CalendarArrowDown className="h-8 w-8 bg-white/40 text-white p-2 rounded backdrop-blur-sm" />,
                value: dashboardData.hoursWeek.count,
                percentage: dashboardData.hoursWeek.percentage,
                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/005/210/247/non_2x/bright-abstract-background-orange-color-free-vector.jpg)]',
              },
              {
                title: 'Hours This Month',
                icon: <Calendar1 className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                value: hoursMonthCount,
                percentage: hoursMonthPercentage,
                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/007/075/692/non_2x/abstract-white-fluid-wave-background-free-vector.jpg)]',
              },
              {
                title: 'Hours Today',
                icon: <Clock className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                value: hoursTodayCount,
                percentage: hoursTodayPercentage,
                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/003/127/955/non_2x/abstract-white-and-grey-background-with-dynamic-waves-shape-free-vector.jpg)]',
              },
              {
                title: 'Hours Last Month',
                icon: <CalendarArrowUp className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                value: hoursLastMonthCount,
                percentage: hoursLastMonthPercentage,
                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/036/340/598/large_2x/abstract-grey-background-poster-with-dynamic-waves-vector.jpg)]',
              },
            ];

            const card = dataMap[index];

            return (
              <MotionBlock key={index} delay={0.2 + index * 0.1}>
                <Card className={`${index == 0 && "text-white"} justify-center bg-cover bg-center border-0 shadow-none ${card.bg}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    {card.icon}
                  </CardHeader>
                  <CardContent>
                    <div className={`${index != 0 && "text-primary"} text-2xl`}>{formatHoursCount(card.value)}h</div>
                    <div className="flex items-center gap-1 text-xs">
                      {getPercentageIcon(card.percentage, index)}
                      <span className={getPercentageColor(card.percentage, index)}>
                        {card.percentage > 0 ? '+' : ''}
                        {card.percentage}% from last period
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </MotionBlock>
            );
          })}
        </div>
      </MotionBlock>

      {/* Tabs Section */}
      <MotionBlock delay={0.2}>
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList>
            <TabsTrigger onClick={() => setShowAdd(true)} value="today">
              Today's Tasks ({todayLogs.length})
            </TabsTrigger>
            <TabsTrigger onClick={() => setShowAdd(false)} value="yesterday">
              Yesterday's Tasks ({yesterdayLogs.length})
            </TabsTrigger>
          </TabsList>

          {/* Today's Tasks */}
          <TabsContent value="today" className="space-y-4">
            <MotionBlock delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient text-xl">Today's Tasks</CardTitle>
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
                              className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
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
            </MotionBlock>

            {/* Weekly Chart */}
            <MotionBlock delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gradient text-xl">Hours Overview</CardTitle>
                  <CardDescription>Your logged hours over the week</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <EmployeeHoursChart data={dashboardData.weekDistribution} />
                </CardContent>
              </Card>
            </MotionBlock>
          </TabsContent>

          {/* Yesterday's Tasks */}
          <TabsContent value="yesterday" className="space-y-4">
            <MotionBlock delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Yesterday's Tasks</CardTitle>
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
                              className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
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
            </MotionBlock>
          </TabsContent>
        </Tabs>
      </MotionBlock>
    </div>
  )
}
