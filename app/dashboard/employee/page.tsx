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
  fetchEmployeeTimeLogs,
  type EmployeeDashboardData,
  formatMinutesToHours,
  formatHoursCount,
  type TimeLog,
} from "@/services/employee"
import { useRouter } from "next/navigation"
import { getAuthUser, getUserRole, isAuthenticated, isTokenExpired } from "@/services/auth"
import { MotionBlock } from "@/components/MotionBlock"

export default function EmployeeDashboard() {
  const [showAdd, setShowAdd] = useState(true)

  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [summaryStats, setSummaryStats] = useState(() => {
    // initial value for summaryStats
    return {
      hoursToday: 0,
      hoursWeek: 0,
      hoursMonth: 0,
      billableHours: 0,
      billableRate: 0,
      draftCount: 0,
      draftHours: 0,
    }
  })

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
          case "Board Member":
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
        const [dashboardData, timeLogsData] = await Promise.all([
          fetchEmployeeDashboard(),
          fetchEmployeeTimeLogs()
        ])
        setDashboardData(dashboardData)
        setTimeLogs(timeLogsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Calculate summary statistics from dashboard API data
  useEffect(() => {
    if (dashboardData) {
      // Use API data for hours calculations
      const hoursToday = dashboardData.hoursToday.count / 60 // Convert minutes to hours
      const hoursWeek = dashboardData.hoursWeek.count / 60
      const hoursMonth = dashboardData.hoursMonth.count / 60

      // Calculate billable hours from time logs (since this isn't in dashboard API)
      let billableHours = 0
      let draftCount = 0
      let draftHours = 0

      timeLogs.forEach((log) => {
        const duration = Number.parseFloat(log.duration)
        if (log.status === "active") {
          billableHours += duration
        }
        if (log.status === "draft") {
          draftCount += 1
          draftHours += duration
        }
      })

      setSummaryStats({
        hoursToday: hoursToday,
        hoursWeek: hoursWeek,
        hoursMonth: hoursMonth,
        billableHours: billableHours / 60,
        billableRate: hoursMonth > 0 ? (billableHours / (hoursMonth * 60)) * 100 : 0,
        draftCount: draftCount,
        draftHours: draftHours / 60,
      })
    }
  }, [dashboardData, timeLogs])

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

  // Calculate percentages for time-logs data using API data
  const hoursTodayCount = Math.floor(summaryStats.hoursToday)
  const hoursWeekCount = Math.floor(summaryStats.hoursWeek)
  const hoursMonthCount = Math.floor(summaryStats.hoursMonth)
  const billableHoursCount = Math.floor(summaryStats.billableHours)

  // Use API percentages when available, fallback to calculated percentages
  const hoursTodayPercentage = dashboardData?.hoursToday?.percentage || 0
  const hoursWeekPercentage = dashboardData?.hoursWeek?.percentage || 0
  const hoursMonthPercentage = dashboardData?.hoursMonth?.percentage || 0
  const billableRatePercentage = Math.round(summaryStats.billableRate)




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
                title: 'Hours Today',
                icon: <Clock className="h-8 w-8 bg-white/40 text-white p-2 rounded backdrop-blur-sm" />,
                value: hoursTodayCount,
                percentage: hoursTodayPercentage,
                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/005/210/247/non_2x/bright-abstract-background-orange-color-free-vector.jpg)]',
              },
              {
                title: 'Hours This Week',
                icon: <CalendarArrowDown className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                value: hoursWeekCount,
                percentage: hoursWeekPercentage,
                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/007/075/692/non_2x/abstract-white-fluid-wave-background-free-vector.jpg)]',
              },
              {
                title: 'Hours This Month',
                icon: <Calendar1 className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                value: hoursMonthCount,
                percentage: hoursMonthPercentage,
                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/003/127/955/non_2x/abstract-white-and-grey-background-with-dynamic-waves-shape-free-vector.jpg)]',
              },
              {
                title: 'Billable Hours',
                icon: <CalendarArrowUp className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                value: billableHoursCount,
                percentage: billableRatePercentage,
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
                    <div className={`${index != 0 && "text-primary"} text-2xl`}>
                      {card.title === 'Billable Hours'
                        ? `${Math.floor(summaryStats.billableHours)}h ${Math.round((summaryStats.billableHours % 1) * 60)}m`
                        : card.title === 'Hours Today'
                          ? `${Math.floor(summaryStats.hoursToday)}h ${Math.round((summaryStats.hoursToday % 1) * 60)}m`
                          : card.title === 'Hours This Week'
                            ? `${Math.floor(summaryStats.hoursWeek)}h ${Math.round((summaryStats.hoursWeek % 1) * 60)}m`
                            : card.title === 'Hours This Month'
                              ? `${Math.floor(summaryStats.hoursMonth)}h ${Math.round((summaryStats.hoursMonth % 1) * 60)}m`
                              : `${card.value}h`
                      }
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {getPercentageIcon(card.percentage, index)}
                      <span className={getPercentageColor(card.percentage, index)}>
                        {card.title === 'Billable Hours'
                          ? `${Math.round(summaryStats.billableRate)}% billable rate`
                          : card.title === 'Hours Today'
                            ? `${hoursTodayPercentage}% of target`
                            : card.title === 'Hours This Week'
                              ? `${hoursWeekPercentage}% of target`
                              : card.title === 'Hours This Month'
                                ? `${hoursMonthPercentage}% of target`
                                : `${card.percentage}% from last period`
                        }
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
                  <EmployeeHoursChart data={dashboardData?.weekDistribution?.map(d => ({
                    day: d.day.toString(),
                    hours: d.hours.toString()
                  })) || []} />
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
