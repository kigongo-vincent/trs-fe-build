"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Plus, Search, Users, Mail, TrendingUp, TrendingDown, Minus, Clock, Calendar, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ConsultantsByDepartmentChart } from "@/components/consultants-by-department-chart"
import Link from "next/link"
import {
  type Consultant,
  type DepartmentSummary,
  getAllConsultants,
  getConsultantsSummary,
  getConsultantDashboard,
  formatMinutesToHours,
  getDayName,
  getTrendIndicator,
  type ConsultantDashboardData,
} from "@/services/consultants"
import { useState, useEffect } from "react"
import { getAuthData } from "@/services/auth"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([])
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal state
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Get company ID from auth data
  const authData = getAuthData()
  const companyId = authData?.user?.company?.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!companyId) {
          console.error("Company ID not found in auth data")
          return
        }

        // Fetch both consultants and department summary in parallel
        const [consultantsResponse, summaryResponse] = await Promise.all([
          getAllConsultants(companyId),
          getConsultantsSummary(companyId),
        ])

        if (consultantsResponse.status === 200) {
          setConsultants(consultantsResponse.data)
          setFilteredConsultants(consultantsResponse.data)
        }

        if (summaryResponse.status === 200) {
          setDepartmentSummary(summaryResponse.data)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
        setChartLoading(false)
      }
    }

    fetchData()
  }, [companyId])

  useEffect(() => {
    // Filter consultants based on search query, department, and status
    let filtered = consultants

    if (searchQuery) {
      filtered = filtered.filter(
        (consultant) =>
          consultant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          consultant.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (consultant) => consultant.department.name.toLowerCase() === departmentFilter.toLowerCase(),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((consultant) => consultant.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredConsultants(filtered)
  }, [searchQuery, departmentFilter, statusFilter, consultants])

  // Handle consultant view
  const handleViewConsultant = async (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setIsConsultantModalOpen(true)
    setDashboardLoading(true)
    setDashboardError(null)
    setDashboardData(null)

    try {
      const response = await getConsultantDashboard(consultant.id)
      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching consultant dashboard:", error)
      setDashboardError("Failed to load consultant dashboard data")
    } finally {
      setDashboardLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsConsultantModalOpen(false)
    setSelectedConsultant(null)
    setDashboardData(null)
    setDashboardError(null)
  }

  const retryDashboardFetch = async () => {
    if (!selectedConsultant) return

    setDashboardLoading(true)
    setDashboardError(null)

    try {
      const response = await getConsultantDashboard(selectedConsultant.id)
      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching consultant dashboard:", error)
      setDashboardError("Failed to load consultant dashboard data")
    } finally {
      setDashboardLoading(false)
    }
  }

  // Get unique departments for filter dropdown
  const departments = Array.from(new Set(consultants.map((c) => c.department.name)))

  // Calculate stats
  const totalConsultants = consultants.length
  const activeConsultants = consultants.filter((c) => c.status === "active").length
  const onLeaveConsultants = consultants.filter((c) => c.status === "on-leave").length

  // Calculate new hires (consultants added in the last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newHires = consultants.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo).length

  // Chart data for modal
  const chartData =
    dashboardData?.weekDistribution.map((item) => ({
      day: getDayName(item.day),
      hours: item.hours / 60, // Convert minutes to hours for display
      fullDay: getDayName(item.day),
    })) || []

  const todayTrend = dashboardData ? getTrendIndicator(dashboardData.hoursToday.percentage) : null
  const weekTrend = dashboardData ? getTrendIndicator(dashboardData.hoursWeek.percentage) : null
  const monthTrend = dashboardData ? getTrendIndicator(dashboardData.hoursMonth.percentage) : null
  const lastMonthTrend = dashboardData?.hoursLastMonth ? getTrendIndicator(dashboardData.hoursLastMonth.percentage) : null

  // Default values for missing data
  const lastMonthHours = dashboardData?.hoursLastMonth?.count ?? 0
  const lastMonthMinutes = dashboardData?.hoursLastMonth?.count ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Consultants</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/company-admin/consultants/add">
              <Plus className="mr-2 h-4 w-4" /> Add Consultant
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalConsultants}</div>
                {newHires > 0 && <p className="text-xs text-muted-foreground">+{newHires} from last month</p>}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeConsultants}</div>
                <p className="text-xs text-muted-foreground">
                  {totalConsultants > 0
                    ? `${Math.round((activeConsultants / totalConsultants) * 100)}% of total consultants`
                    : "No consultants"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{onLeaveConsultants}</div>
                <p className="text-xs text-muted-foreground">
                  {totalConsultants > 0
                    ? `${Math.round((onLeaveConsultants / totalConsultants) * 100)}% of total consultants`
                    : "No consultants"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{newHires}</div>
                <p className="text-xs text-muted-foreground">In the last 30 days</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultants by Department</CardTitle>
          <CardDescription>Distribution of consultants across departments</CardDescription>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="h-[350px] w-full flex items-center justify-center">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <ConsultantsByDepartmentChart departmentSummary={departmentSummary} />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search consultants..."
            className="h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3">
            <Search className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Search</span>
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept.toLowerCase()}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Consultants</CardTitle>
          <CardDescription>Manage your company consultants</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No consultants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsultants.map((consultant) => {
                    // Get initials for avatar fallback
                    const initials = consultant.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)

                    // Format date to show how long they've been with the company
                    const joinDate = new Date(consultant.createdAt)
                    const joinMonth = joinDate.toLocaleString("default", { month: "short" })
                    const joinYear = joinDate.getFullYear()

                    return (
                      <TableRow key={consultant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={
                                  consultant.avatarUrl ||
                                  `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(consultant.fullName) || "/placeholder.svg"}`
                                }
                                alt={consultant.fullName}
                              />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{consultant.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                Since {joinMonth} {joinYear}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{consultant.department.name}</TableCell>
                        <TableCell>{consultant.jobTitle || consultant.role.name}</TableCell>
                        <TableCell>{consultant.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              consultant.status === "active"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                            }
                          >
                            {consultant.status.charAt(0).toUpperCase() + consultant.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewConsultant(consultant)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Consultant Details Modal */}
      <Dialog open={isConsultantModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedConsultant?.fullName || "Consultant"} Dashboard
            </DialogTitle>
          </DialogHeader>

          {selectedConsultant && (
            <div className="grid gap-6 md:grid-cols-4">
              {/* Consultant Profile Card */}
              <Card className="md:col-span-1">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={selectedConsultant.avatarUrl || "/placeholder.svg"}
                        alt={selectedConsultant.fullName}
                      />
                      <AvatarFallback>
                        {selectedConsultant.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold">{selectedConsultant.fullName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConsultant.jobTitle || selectedConsultant.role.name}
                    </p>
                    <Badge className="mt-2">{selectedConsultant.department.name}</Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedConsultant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedConsultant.role.name}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge
                        variant="outline"
                        className={
                          selectedConsultant.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {selectedConsultant.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Joined:</span>
                      <span className="text-sm">{new Date(selectedConsultant.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Content */}
              <div className="md:col-span-3 space-y-6">
                {dashboardLoading ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          {[1, 2, 3, 4].map((i) => (
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
                ) : dashboardError ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-red-600 mb-4">{dashboardError}</p>
                        <Button onClick={retryDashboardFetch}>Try Again</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : dashboardData ? (
                  <>
                    {/* Hours Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Hours Overview</CardTitle>
                        <CardDescription>Time tracked across different periods</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
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
                                {formatMinutesToHours(dashboardData.hoursToday.count)}
                              </div>
                              <p className="text-xs text-muted-foreground">{dashboardData.hoursToday.count} minutes</p>
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
                                {formatMinutesToHours(dashboardData.hoursWeek.count)}
                              </div>
                              <p className="text-xs text-muted-foreground">{dashboardData.hoursWeek.count} minutes</p>
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
                                {formatMinutesToHours(dashboardData.hoursMonth.count)}
                              </div>
                              <p className="text-xs text-muted-foreground">{dashboardData.hoursMonth.count} minutes</p>
                            </CardContent>
                          </Card>

                          {/* Last Month */}
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                              {lastMonthTrend && (
                                <div className={`flex items-center gap-1 ${lastMonthTrend.color}`}>
                                  {lastMonthTrend.icon === "up" && <TrendingUp className="h-4 w-4" />}
                                  {lastMonthTrend.icon === "down" && <TrendingDown className="h-4 w-4" />}
                                  {lastMonthTrend.icon === "neutral" && <Minus className="h-4 w-4" />}
                                  <span className="text-xs">{lastMonthTrend.text}</span>
                                </div>
                              )}
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {formatMinutesToHours(dashboardData?.hoursLastMonth?.count ?? 0)}
                              </div>
                              <p className="text-xs text-muted-foreground">{dashboardData?.hoursLastMonth?.count ?? 0} minutes</p>
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
                        {dashboardData.recentLogs && dashboardData.recentLogs.length > 0 ? (
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
                  </>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
