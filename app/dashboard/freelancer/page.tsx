"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Plus, TrendingUp, TrendingDown, Minus, Calendar1, CalendarArrowDown, CalendarArrowUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { getAuthUser, getUserRole, isAuthenticated, isTokenExpired } from "@/services/auth"
import { MotionBlock } from "@/components/MotionBlock"
import {
  fetchEmployeeDashboard,
  fetchEmployeeTimeLogs,
  formatMinutesToHours,
  type EmployeeDashboardData,
  type TimeLog
} from "@/services/employee"

export default function FreelancerDashboard() {
  const [showAdd, setShowAdd] = useState(true)
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [summaryStats, setSummaryStats] = useState(() => ({
    hoursToday: 0,
    hoursWeek: 0,
    hoursMonth: 0,
    billableHours: 0,
    billableRate: 0,
    draftCount: 0,
    draftHours: 0,
  }))

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isAuthenticated() || isTokenExpired()) {
        router.replace("/")
        return
      }
      const role = getUserRole()
      if (role !== "Freelancer") {
        switch (role) {
          case "Super Admin":
            router.replace("/dashboard/super-admin")
            break
          case "Company Admin":
          case "Board Member":
            router.replace("/dashboard/company-admin")
            break
          case "Consultant":
          case "Employee":
            router.replace("/dashboard/employee")
            break
          default:
            router.replace("/dashboard/freelancer")
        }
      }
    }
  }, [router])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [dashboardResult, timeLogsResult] = await Promise.all([
          fetchEmployeeDashboard(),
          fetchEmployeeTimeLogs()
        ])
        setDashboardData(dashboardResult)
        setTimeLogs(timeLogsResult.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  useEffect(() => {
    if (!dashboardData) return

    const hoursToday = dashboardData.hoursToday.count / 60
    const hoursWeek = dashboardData.hoursWeek.count / 60
    const hoursMonth = dashboardData.hoursMonth.count / 60

    let billableMinutes = 0
    let draftCount = 0
    let draftMinutes = 0

    timeLogs.forEach((log) => {
      const duration = Number.parseFloat(log.duration)
      if (log.status === "active") {
        billableMinutes += duration
      }
      if (log.status === "draft") {
        draftCount += 1
        draftMinutes += duration
      }
    })

    setSummaryStats({
      hoursToday,
      hoursWeek,
      hoursMonth,
      billableHours: billableMinutes / 60,
      billableRate: hoursMonth > 0 ? (billableMinutes / (hoursMonth * 60)) * 100 : 0,
      draftCount,
      draftHours: draftMinutes / 60,
    })
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/dashboard/freelancer/time-logs/new">
                <Clock className="mr-2 h-4 w-4" /> Log Time
              </Link>
            </Button>
          </div>
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

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  const todayLogs = dashboardData.recentLogs.filter((log) => new Date(log.date).toDateString() === today)
  const yesterdayLogs = dashboardData.recentLogs.filter((log) => new Date(log.date).toDateString() === yesterday)

  const user = getAuthUser()

  const hoursTodayCount = Math.floor(summaryStats.hoursToday)
  const hoursWeekCount = Math.floor(summaryStats.hoursWeek)
  const hoursMonthCount = Math.floor(summaryStats.hoursMonth)
  const billableHoursCount = Math.floor(summaryStats.billableHours)

  const hoursTodayPercentage = dashboardData.hoursToday?.percentage || 0
  const hoursWeekPercentage = dashboardData.hoursWeek?.percentage || 0
  const hoursMonthPercentage = dashboardData.hoursMonth?.percentage || 0
  const billableRatePercentage = Math.round(summaryStats.billableRate)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <MotionBlock delay={0}>
        <div className="flex flex-col sm:flex-row md:h-[5vh] h-max items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="">
            <h1 className="text-base sm:text-lg tracking-tight">
              Hello, <span className="font-semibold">{user?.lastName || user?.fullName?.split(" ")[1] || "Freelancer"}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showAdd && (
              <MotionBlock delay={.1}>
                <Button asChild className="gradient rounded-full w-full sm:w-auto">
                  <Link href="/dashboard/freelancer/time-logs/new">
                    <Clock size={25} className="h-6 w-6 sm:h-10 sm:w-10 rounded-full" /> 
                    <span className="ml-2">Log Time</span>
                  </Link>
                </Button>
              </MotionBlock>
            )}
          </div>
        </div>
      </MotionBlock>

      {/* Dashboard Cards */}
      <MotionBlock delay={0.1}>
        <div className="text-white bg-paper p-4 sm:p-6 md:p-8 rounded-lg grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
            ]

            const card = dataMap[index]

            return (
              <MotionBlock key={index} delay={0.2 + index * 0.1}>
                <Card className={`${index == 0 && "text-white"} justify-center bg-cover bg-center border-0 shadow-none ${card.bg}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    {card.icon}
                  </CardHeader>
                  <CardContent>
                    <div className={`${index != 0 && "text-primary"} text-xl sm:text-2xl`}>
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
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
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
            )
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
                        <div key={log.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Clock className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{log.title}</p>
                              <p className="text-xs text-muted-foreground truncate">Project: {log.project}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">{formatMinutesToHours(log.minutes)}</span>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${log.status === 'active'
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
                        <div key={log.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Clock className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{log.title}</p>
                              <p className="text-xs text-muted-foreground truncate">Project: {log.project}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">{formatMinutesToHours(log.minutes)}</span>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${log.status === 'active'
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
