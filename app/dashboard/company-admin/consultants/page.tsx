"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Plus, Search, Users, Mail, TrendingUp, TrendingDown, Minus, Clock, Calendar, User, Filter, Edit, UserCheck, UserX, SearchIcon, FileText, Download, PhoneCall, PhoneIcon, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
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
  updateConsultantStatus,
} from "@/services/consultants"
import { formatDurationString } from "@/services/employee"
import { useState, useEffect } from "react"
import { getAuthData } from "@/services/auth"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { EditConsultantForm } from "@/components/edit-consultant-form"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { X } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

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

  // Date range and tasks state
  const [startDate, setStartDate] = useState<string>("2024-01-05")
  const [endDate, setEndDate] = useState<string>("2024-02-05")
  const [filteredTasks, setFilteredTasks] = useState<any[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editConsultant, setEditConsultant] = useState<Consultant | null>(null)

  // Sidebar section state for consultant modal
  const [modalSection, setModalSection] = useState<'overview' | 'recent' | 'logs' | 'personal' | 'nextOfKin' | 'bank'>('personal')

  // Get company ID from auth data
  const authData = getAuthData()
  const companyId = authData?.user?.company?.id

  // State for status confirmation dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusTargetConsultant, setStatusTargetConsultant] = useState<Consultant | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | 'on-leave' | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

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
      filtered = filtered.filter((consultant) => {
        const status = consultant.status === "" ? "on-leave" : consultant.status.toLowerCase();
        return status === statusFilter.toLowerCase();
      })
    }

    setFilteredConsultants(filtered)
  }, [searchQuery, departmentFilter, statusFilter, consultants])

  // Filter tasks based on date range
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredTasks([])
      return
    }

    fetchTasksByDateRange(new Date(startDate), new Date(endDate))
  }, [startDate, endDate])

  // Function to fetch tasks by date range from API
  const fetchTasksByDateRange = async (startDate: Date, endDate: Date) => {
    if (!selectedConsultant) return

    setTasksLoading(true)
    setTasksError(null)

    try {
      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/consultants/${selectedConsultant.id}/time-logs?startDate=${startDateStr}&endDate=${endDateStr}`)
      // const data = await response.json()

      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay

      // Mock API response - replace this with actual API call
      const mockApiResponse = [
        {
          id: "1",
          duration: "1920", // 32 hours in minutes
          title: "Frontend Development - Dashboard",
          description: "Developed the main dashboard interface with React components and implemented responsive design patterns",
          status: "completed",
          projectId: "proj-1",
          createdAt: "2024-01-15T09:00:00Z",
          updatedAt: "2024-01-20T17:30:00Z",
          userId: selectedConsultant?.id || "user-1",
          user: {
            id: selectedConsultant?.id || "user-1",
            fullName: selectedConsultant?.fullName || "John Doe",
            firstName: "John",
            lastName: "Doe",
            email: selectedConsultant?.email || "john@example.com",
            password: "",
            employeeId: "EMP001",
            status: "active",
            jobTitle: "Frontend Developer",
            bio: null,
            avatarUrl: null,
            resetToken: null,
            resetTokenExpires: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          project: "TRS Platform"
        },
        {
          id: "2",
          duration: "1080", // 18 hours in minutes
          title: "API Integration - User Management",
          description: "Integrated user management APIs with frontend components and implemented authentication flows",
          status: "active",
          projectId: "proj-1",
          createdAt: "2024-01-22T10:15:00Z",
          updatedAt: "2024-01-25T16:45:00Z",
          userId: selectedConsultant?.id || "user-1",
          user: {
            id: selectedConsultant?.id || "user-1",
            fullName: selectedConsultant?.fullName || "John Doe",
            firstName: "John",
            lastName: "Doe",
            email: selectedConsultant?.email || "john@example.com",
            password: "",
            employeeId: "EMP001",
            status: "active",
            jobTitle: "Frontend Developer",
            bio: null,
            avatarUrl: null,
            resetToken: null,
            resetTokenExpires: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          project: "TRS Platform"
        },
        {
          id: "3",
          duration: "720", // 12 hours in minutes
          title: "Database Schema Design",
          description: "Designed and implemented database schema for inventory management system with proper relationships",
          status: "completed",
          projectId: "proj-2",
          createdAt: "2024-01-10T08:30:00Z",
          updatedAt: "2024-01-12T14:20:00Z",
          userId: selectedConsultant?.id || "user-1",
          user: {
            id: selectedConsultant?.id || "user-1",
            fullName: selectedConsultant?.fullName || "John Doe",
            firstName: "John",
            lastName: "Doe",
            email: selectedConsultant?.email || "john@example.com",
            password: "",
            employeeId: "EMP001",
            status: "active",
            jobTitle: "Frontend Developer",
            bio: null,
            avatarUrl: null,
            resetToken: null,
            resetTokenExpires: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          project: "Inventory System"
        },
        {
          id: "4",
          duration: "2700", // 45 hours in minutes
          title: "Mobile App Development",
          description: "Developing mobile application for customer self-service portal with React Native",
          status: "active",
          projectId: "proj-3",
          createdAt: "2024-01-28T11:00:00Z",
          updatedAt: "2024-02-05T18:15:00Z",
          userId: selectedConsultant?.id || "user-1",
          user: {
            id: selectedConsultant?.id || "user-1",
            fullName: selectedConsultant?.fullName || "John Doe",
            firstName: "John",
            lastName: "Doe",
            email: selectedConsultant?.email || "john@example.com",
            password: "",
            employeeId: "EMP001",
            status: "active",
            jobTitle: "Frontend Developer",
            bio: null,
            avatarUrl: null,
            resetToken: null,
            resetTokenExpires: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          project: "Customer Portal"
        },
        {
          id: "5",
          duration: "1440", // 24 hours in minutes
          title: "Security Audit Implementation",
          description: "Implemented security audit features and compliance checks for the platform",
          status: "completed",
          projectId: "proj-1",
          createdAt: "2024-01-05T07:45:00Z",
          updatedAt: "2024-01-08T15:30:00Z",
          userId: selectedConsultant?.id || "user-1",
          user: {
            id: selectedConsultant?.id || "user-1",
            fullName: selectedConsultant?.fullName || "John Doe",
            firstName: "John",
            lastName: "Doe",
            email: selectedConsultant?.email || "john@example.com",
            password: "",
            employeeId: "EMP001",
            status: "active",
            jobTitle: "Frontend Developer",
            bio: null,
            avatarUrl: null,
            resetToken: null,
            resetTokenExpires: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          project: "TRS Platform"
        },
        {
          id: "6",
          duration: "960", // 16 hours in minutes
          title: "Performance Optimization",
          description: "Optimizing application performance and reducing load times through code refactoring",
          status: "active",
          projectId: "proj-1",
          createdAt: "2024-01-30T09:30:00Z",
          updatedAt: "2024-02-02T16:00:00Z",
          userId: selectedConsultant?.id || "user-1",
          user: {
            id: selectedConsultant?.id || "user-1",
            fullName: selectedConsultant?.fullName || "John Doe",
            firstName: "John",
            lastName: "Doe",
            email: selectedConsultant?.email || "john@example.com",
            password: "",
            employeeId: "EMP001",
            status: "active",
            jobTitle: "Frontend Developer",
            bio: null,
            avatarUrl: null,
            resetToken: null,
            resetTokenExpires: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          project: "TRS Platform"
        }
      ]

      // Filter mock data based on date range (this would be done by the API in real implementation)
      const filtered = mockApiResponse.filter(timeLog => {
        const logDate = new Date(timeLog.createdAt)

        return logDate >= startDate && logDate <= endDate
      })

      setFilteredTasks(filtered)
    } catch (error) {
      console.error("Error fetching time logs by date range:", error)
      setTasksError("Failed to load time logs for the selected date range")
      setFilteredTasks([])
    } finally {
      setTasksLoading(false)
    }
  }

  // Function to set current date as both start and end dates
  const setCurrentDate = () => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
  }

  // Calculate total hours for the selected date range
  const calculateTotalHours = () => {
    return filteredTasks.reduce((total, timeLog) => {
      return total + Number(timeLog.duration)
    }, 0)
  }

  const totalMinutes = calculateTotalHours()
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  // Handle consultant view
  const handleViewConsultant = async (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setIsConsultantModalOpen(true)
    setDashboardLoading(true)
    setDashboardError(null)
    try {
      const dashboardResponse = await getConsultantDashboard(consultant.id)
      if (dashboardResponse.status === 200) {
        setDashboardData(dashboardResponse.data)
      } else {
        setDashboardError("Failed to load dashboard data.")
      }
    } catch (error) {
      setDashboardError("Failed to load dashboard data.")
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

  // Handle edit consultant
  const handleEditConsultant = (consultant: Consultant) => {
    setEditConsultant(consultant)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditConsultant(null)
  }

  // Open confirmation dialog for status change
  const handleStatusDialog = (consultant: Consultant, action: 'activate' | 'deactivate' | 'on-leave') => {
    setStatusAction(action)
    setStatusTargetConsultant(consultant)
    setStatusDialogOpen(true)
  }

  // Confirm status change handler
  const handleConfirmStatusChange = async () => {
    if (!statusTargetConsultant || !statusAction) return
    let newStatus: "active" | "inactive" | "on-leave" = "active"
    if (statusAction === 'activate') newStatus = 'active'
    else if (statusAction === 'deactivate') newStatus = 'inactive'
    else if (statusAction === 'on-leave') newStatus = 'on-leave'
    setStatusLoading(true)
    try {
      if (!companyId) throw new Error('Company ID not found')
      await updateConsultantStatus(companyId, statusTargetConsultant.id, newStatus)
      // Refetch consultants after status change
      const consultantsResponse = await getAllConsultants(companyId)
      if (consultantsResponse.status === 200) {
        setConsultants(consultantsResponse.data)
        setFilteredConsultants(consultantsResponse.data)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update consultant status')
    } finally {
      setStatusLoading(false)
      setStatusDialogOpen(false)
      setStatusTargetConsultant(null)
      setStatusAction(null)
    }
  }

  // Cancel status change
  const handleCancelStatusChange = () => {
    setStatusDialogOpen(false)
    setStatusTargetConsultant(null)
    setStatusAction(null)
  }

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
        <div className="relative flex items-center h-12 w-[260px] border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-100">
          <span className="absolute left-3 text-gray-400">
            <SearchIcon className="h-6 w-6" />
          </span>
          <Input
            type="text"
            placeholder="Search consultants..."
            className="pl-12 h-12 w-full border-none bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              <SelectItem value="inactive">Inactive</SelectItem>
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
                                src={consultant?.avatarUrl || "/placeholder.svg"}
                                alt={consultant?.fullName || "User"}
                              />
                              <AvatarFallback>
                                {(consultant?.fullName || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
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
                                : consultant.status === "inactive"
                                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                                  : consultant.status === "on-leave" || consultant.status === ""
                                    ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-400 dark:border-primary-800"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {(consultant.status === "on-leave" || consultant.status === "")
                              ? "On Leave"
                              : consultant.status.charAt(0).toUpperCase() + consultant.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewConsultant(consultant)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditConsultant(consultant)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusDialog(consultant, consultant.status === 'active' ? 'deactivate' : 'activate')}
                              title={consultant.status === 'active' ? 'Deactivate Consultant' : 'Activate Consultant'}
                            >
                              {consultant.status === 'active' ? (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <UserX className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            {consultant.status === "" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusDialog(consultant, 'activate')}
                                title="Activate Consultant"
                              >
                                <UserCheck className="h-4 w-4 text-green-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusDialog(consultant, 'on-leave')}
                                title="Set On Leave"
                              >
                                <Clock className="h-4 w-4 text-yellow-500" />
                              </Button>
                            )}
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
      {selectedConsultant && isConsultantModalOpen && (
        <Dialog open={true} onOpenChange={open => { if (!open) handleCloseModal(); }}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"></div>
            {/* Fullscreen Modal Content */}
            <div
              className="relative w-screen h-screen bg-background flex flex-col overflow-y-auto !rounded-none border-0 shadow-2xl"
              style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between bg-background border-b px-8 py-4">
                <DialogHeader className="flex flex-row items-center gap-4 w-full">
                  <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                    {/* <User className="h-6 w-6" /> */}
                    {selectedConsultant?.fullName || "Consultant"}
                  </DialogTitle>
                </DialogHeader>
                <button
                  onClick={handleCloseModal}
                  className="ml-auto rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                >
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Sidebar + Main Content Layout */}
              <div className="flex flex-1 w-full h-[calc(100vh-80px)] px-0">
                {/* Sidebar Navigation */}
                <div className="w-56 min-w-[180px] border-r bg-muted/30 flex flex-col py-8 gap-2 text-base">
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'overview' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('overview')}>Overview</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'recent' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('recent')}>Recent Activity</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'logs' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('logs')}>Logs by Range</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'personal' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('personal')}>Personal</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'nextOfKin' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('nextOfKin')}>Next of Kin</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'bank' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('bank')}>Bank Details</button>
                </div>
                {/* Main Content - only this is scrollable */}
                <div className="flex-1 py-8 md:py-12 px-8 overflow-y-auto h-full pb-0">
                  {modalSection === 'overview' && (
                    <div className="flex flex-col gap-8">
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
                                  {formatMinutesToHours(dashboardData?.hoursLastMonth?.count || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">{dashboardData?.hoursLastMonth?.count || 0} minutes</p>
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
                    </div>
                  )}
                  {modalSection === 'recent' && (
                    <div className="flex flex-col gap-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                          <CardDescription>Latest time logs and tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {dashboardData?.recentLogs && dashboardData.recentLogs.filter((log) => log.status !== "draft").length > 0 ? (
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
                                {dashboardData.recentLogs
                                  .filter((log) => log.status !== "draft")
                                  .map((log) => (
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
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                              <Clock className="h-10 w-10 mb-3 opacity-40" />
                              <div className="text-lg font-semibold mb-1">No recent activity</div>
                              <div className="text-sm">This consultant hasn't logged any recent work yet. Check back soon!</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {modalSection === 'logs' && (
                    <div className="flex flex-col gap-8">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Time Logs by Date Range</CardTitle>
                              <CardDescription>View time logs within a specific time period</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {/* <Filter className="h-4 w-4 text-muted-foreground" /> */}
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col gap-1">
                                    <label htmlFor="start-date" className="text-xs text-muted-foreground">
                                      Start Date
                                    </label>
                                    <Input
                                      id="start-date"
                                      type="date"
                                      value={startDate}
                                      onChange={(e) => setStartDate(e.target.value)}
                                      className="w-40"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label htmlFor="end-date" className="text-xs text-muted-foreground">
                                      End Date
                                    </label>
                                    <Input
                                      id="end-date"
                                      type="date"
                                      value={endDate}
                                      onChange={(e) => setEndDate(e.target.value)}
                                      className="w-40"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-xs text-muted-foreground">
                                      Quick Actions
                                    </label>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={setCurrentDate}
                                      className="w-40"
                                    >
                                      Today
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {tasksLoading ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                  <p className="text-sm text-muted-foreground">Loading time logs...</p>
                                </div>
                              </div>
                            </div>
                          ) : tasksError ? (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              <div className="text-center">
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-red-600 mb-2">{tasksError}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startDate && endDate && fetchTasksByDateRange(new Date(startDate), new Date(endDate))}
                                >
                                  Try Again
                                </Button>
                              </div>
                            </div>
                          ) : filteredTasks.length > 0 ? (
                            <>
                              {/* Summary Card */}
                              <Card className="mb-6">
                                <CardContent className="pt-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-muted/50">
                                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                      <p className="text-2xl font-bold">
                                        {totalHours}h {remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
                                      </p>
                                      <p className="text-sm text-muted-foreground">Total Hours</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/50">
                                      <div className="h-8 w-8 mx-auto mb-2 text-muted-foreground flex items-center justify-center">
                                        <span className="text-xl">📊</span>
                                      </div>
                                      <p className="text-2xl font-bold">{filteredTasks.length}</p>
                                      <p className="text-sm text-muted-foreground">Time Logs</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Task Title</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredTasks.map((timeLog) => (
                                    <TableRow key={timeLog.id}>
                                      <TableCell className="font-medium">
                                        <div>
                                          <div className="font-medium">{timeLog.title}</div>
                                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                            {timeLog.description}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{timeLog.project}</Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          {new Date(timeLog.createdAt).toLocaleDateString()}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                          {formatDurationString(timeLog.duration)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={
                                            timeLog.status === "active"
                                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                              : timeLog.status === "completed"
                                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
                                                : "bg-gray-50 text-gray-700 border-gray-200"
                                          }
                                        >
                                          {timeLog.status}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              <div className="text-center">
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No time logs found in the selected date range</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {modalSection === 'personal' && (
                    <div className="flex flex-col gap-8">
                      {/* Profile Section - All Personal Info Merged */}
                      <Card className="w-full">
                        <CardContent className="pt-8 pb-6 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                          <Avatar className="h-28 w-28 mx-auto md:mx-0">
                            <AvatarImage
                              src={selectedConsultant?.avatarUrl || "/placeholder.svg"}
                              alt={selectedConsultant?.fullName || "User"}
                            />
                            <AvatarFallback>
                              {(selectedConsultant?.fullName || "U")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex flex-col gap-2">
                            <h2 className="text-2xl font-bold">{selectedConsultant?.fullName || '-'}</h2>
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge>{selectedConsultant?.department?.name || "-"}</Badge>
                              <span className="text-base text-muted-foreground">{selectedConsultant?.jobTitle || selectedConsultant?.role?.name || "-"}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{selectedConsultant?.email || "-"}</span>
                              </div>
                              <div><div className="text-muted-foreground text-sm flex items-center space-x-2">
                                <PhoneIcon size={14} className="mr-2" />
                                +{(selectedConsultant as any)?.phoneNumber || '-'}</div></div>

                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{selectedConsultant?.role?.name || "-"}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    selectedConsultant?.status === "active"
                                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                      : selectedConsultant?.status === "inactive"
                                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                                        : selectedConsultant?.status === "on-leave" || selectedConsultant?.status === ""
                                          ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-400 dark:border-primary-800"
                                          : "bg-gray-50 text-gray-700 border-gray-200"
                                  }
                                >
                                  {(selectedConsultant?.status === "on-leave" || selectedConsultant?.status === "")
                                    ? "On Leave"
                                    : selectedConsultant?.status || "-"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center space-x-3 mx-4"><Label>Born: </Label><div className="text-muted-foreground text-sm">{(selectedConsultant as any)?.dateOfBirth || (selectedConsultant as any)?.date_of_birth ? new Date((selectedConsultant as any)?.dateOfBirth || (selectedConsultant as any)?.date_of_birth).toLocaleDateString() : '-'}</div></div>
                                <span className="text-sm text-muted-foreground">Joined:</span>
                                <span className="text-sm">{selectedConsultant?.createdAt ? new Date(selectedConsultant.createdAt).toLocaleDateString() : "-"}</span>
                              </div>
                            </div>

                            <div className="xl:col-span-2 flex items-center space-x-2 mt-2"><MapPin className="text-red-500" size={15} /><div className="text-muted-foreground text-sm whitespace-pre-line">{(selectedConsultant as any)?.address ? `${(selectedConsultant as any).address.street || ''}${(selectedConsultant as any).address.city ? ', ' + (selectedConsultant as any).address.city : ''}${(selectedConsultant as any).address.state ? ', ' + (selectedConsultant as any).address.state : ''}${(selectedConsultant as any).address.country ? ', ' + (selectedConsultant as any).address.country : ''}${(selectedConsultant as any).address.postalCode ? ', ' + (selectedConsultant as any).address.postalCode : ''}` : '-'}</div></div>


                            {/* IDs Section */}
                            <div className="flex flex-col gap-2 mt-4">
                              <Label>IDs</Label>
                              <div className="space-y-2">
                                {Array.isArray((selectedConsultant as any)?.attachments) && (selectedConsultant as any).attachments.length > 0 ? (
                                  (selectedConsultant as any).attachments.map((att: string, idx: number) => {
                                    // Assume all are PDFs
                                    let fileName = `ID ${idx + 1}.pdf`;
                                    let url = att;
                                    // Try to extract name if present
                                    const nameMatch = att.match(/name=([^;]+);/);
                                    if (nameMatch) fileName = nameMatch[1];
                                    // PDF icon
                                    const icon = (
                                      <FileText className="h-5 w-5 text-red-500" />
                                    );
                                    return (
                                      <div key={idx} className="flex items-center gap-3 p-3 border rounded shadow-sm bg-muted/10">
                                        <div className="flex-shrink-0">{icon}</div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">{fileName}</div>
                                        </div>
                                        <a
                                          href={url}
                                          download={fileName}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            View
                                          </Button>
                                        </a>
                                        <a
                                          href={url}
                                          download={fileName}
                                          rel="noopener noreferrer"
                                        >
                                          <Button variant="outline" size="sm" className="flex items-center gap-2 ml-2">
                                            <Download className="h-4 w-4" />
                                            Download
                                          </Button>
                                        </a>
                                      </div>
                                    );
                                  })
                                ) : (
                                  // Default sample documents
                                  <>
                                    <div className="flex items-center gap-3 p-3 border rounded shadow-sm bg-muted/10">
                                      <FileText className="h-5 w-5 text-red-500" />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">Passport.pdf</div>
                                      </div>
                                      <a
                                        href="https://images.pexels.com/photos/8061986/pexels-photo-8061986.jpeg"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          View
                                        </Button>
                                      </a>
                                      <a
                                        href="https://images.pexels.com/photos/8061986/pexels-photo-8061986.jpeg"
                                        download="Passport.pdf"
                                        rel="noopener noreferrer"
                                      >
                                        <Button variant="outline" size="sm" className="flex items-center gap-2 ml-2">
                                          <Download className="h-4 w-4" />
                                          Download
                                        </Button>
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 border rounded shadow-sm bg-muted/10">
                                      <FileText className="h-5 w-5 text-red-500" />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">Driving License.pdf</div>
                                      </div>
                                      <a
                                        href="https://images.pexels.com/photos/45113/pexels-photo-45113.jpeg"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          View
                                        </Button>
                                      </a>
                                      <a
                                        href="https://images.pexels.com/photos/45113/pexels-photo-45113.jpeg"
                                        download="Driving License.pdf"
                                        rel="noopener noreferrer"
                                      >
                                        <Button variant="outline" size="sm" className="flex items-center gap-2 ml-2">
                                          <Download className="h-4 w-4" />
                                          Download
                                        </Button>
                                      </a>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            {/* End IDs Section */}
                            <div className="flex flex-col gap-2 mt-4">
                              {/* Gross Pay with visual hierarchy (no outside label) */}
                              <div className="w-full">
                                <Card className="bg-primary/10 border-primary/20 shadow-none mb-2">
                                  <CardContent className="py-4 flex flex-col items-center">
                                    <span className="text-3xl font-extrabold text-primary">
                                      {(() => {
                                        let grossPay = (selectedConsultant as any)?.grossPay || (selectedConsultant as any)?.gross_pay;
                                        let currency = (selectedConsultant as any)?.currency;
                                        if (!currency) currency = 'USD';
                                        if (!grossPay || isNaN(Number(grossPay))) return '-';
                                        // Format with commas
                                        const formattedGrossPay = Number(grossPay).toLocaleString();
                                        return `${currency} ${formattedGrossPay}`;
                                      })()}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">Monthly Gross Pay</span>
                                  </CardContent>
                                </Card>
                                <span className="text-xs text-muted-foreground block text-center mt-1">If no currency is set, USD is used by default.</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-4">
                              <Label>Office Days</Label>
                              <div className="flex flex-row gap-2 flex-wrap">
                                {(() => {
                                  let days: string[] = [];
                                  if (Array.isArray((selectedConsultant as any)?.days_to_come)) days = (selectedConsultant as any).days_to_come;
                                  else if ((selectedConsultant as any)?.days_to_come) days = JSON.parse((selectedConsultant as any).days_to_come);
                                  else if ((selectedConsultant as any)?.officeDays) days = (selectedConsultant as any).officeDays;
                                  if (!days || days.length === 0) return <span className="text-muted-foreground">-</span>;
                                  return days.map((day: string, idx: number) => (
                                    <Card key={idx} className="px-3 py-1 bg-muted/50 shadow-none text-sm font-medium rounded-full">
                                      <CardContent className="p-0 flex items-center justify-center">{day}</CardContent>
                                    </Card>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {modalSection === 'nextOfKin' && (
                    <div className="flex flex-col gap-8">
                      <Card className="w-full">
                        <CardHeader>
                          <CardTitle>Next of Kin</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-6 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Name</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.nextOfKin?.name || ((selectedConsultant as any)?.next_of_kin && (selectedConsultant as any).next_of_kin.name) || '-'}</div></div>
                            <div><Label>Relationship</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.nextOfKin?.relationship || ((selectedConsultant as any)?.next_of_kin && (selectedConsultant as any).next_of_kin.relationship) || '-'}</div></div>
                            <div><Label>Phone</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.nextOfKin?.phoneNumber || ((selectedConsultant as any)?.next_of_kin && (selectedConsultant as any).next_of_kin.phoneNumber) || '-'}</div></div>
                            <div><Label>Email</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.nextOfKin?.email || ((selectedConsultant as any)?.next_of_kin && (selectedConsultant as any).next_of_kin.email) || '-'}</div></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {modalSection === 'bank' && (
                    <div className="flex flex-col gap-8">
                      <Card className="w-full">
                        <CardHeader>
                          <CardTitle>Bank Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-6 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Account Name</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.bankDetails?.accountName || ((selectedConsultant as any)?.bank_details && (selectedConsultant as any).bank_details.accountName) || '-'}</div></div>
                            <div><Label>Account Number</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.bankDetails?.accountNumber || ((selectedConsultant as any)?.bank_details && (selectedConsultant as any).bank_details.accountNumber) || '-'}</div></div>
                            <div><Label>Bank Name</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.bankDetails?.bankName || ((selectedConsultant as any)?.bank_details && (selectedConsultant as any).bank_details.bankName) || '-'}</div></div>
                            <div><Label>SWIFT Code</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.bankDetails?.swiftCode || ((selectedConsultant as any)?.bank_details && (selectedConsultant as any).bank_details.swiftCode) || '-'}</div></div>
                            <div><Label>Branch</Label><div className="text-muted-foreground">{(selectedConsultant as any)?.bankDetails?.branch || ((selectedConsultant as any)?.bank_details && (selectedConsultant as any).bank_details.branch) || '-'}</div></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Consultant Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="inset-0 w-screen h-screen max-w-none max-h-none p-0 m-0 !rounded-none border-0 overflow-y-auto flex flex-col" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px' }}>
          <DialogTitle><VisuallyHidden>Edit Consultant</VisuallyHidden></DialogTitle>
          <div className="sticky top-0 left-0 w-full bg-background border-b shadow z-20 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <Edit className="h-5 w-5" />
              Edit Consultant
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="ml-auto rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </DialogClose>
          </div>
          <div className="flex-1 overflow-auto px-8 py-6 pb-0">
            {editConsultant && (
              <EditConsultantForm consultant={editConsultant} onClose={handleCloseEditModal} onUpdated={async () => {
                setIsEditModalOpen(false);
                setEditConsultant(null);
                // Refetch consultants and department summary after update
                if (companyId) {
                  setLoading(true);
                  setChartLoading(true);
                  try {
                    const [consultantsResponse, summaryResponse] = await Promise.all([
                      getAllConsultants(companyId),
                      getConsultantsSummary(companyId),
                    ]);
                    if (consultantsResponse.status === 200) {
                      setConsultants(consultantsResponse.data);
                      setFilteredConsultants(consultantsResponse.data);
                    }
                    if (summaryResponse.status === 200) {
                      setDepartmentSummary(summaryResponse.data);
                    }
                  } catch (error) {
                    console.error("Failed to refetch data after consultant update:", error);
                  } finally {
                    setLoading(false);
                    setChartLoading(false);
                  }
                }
              }} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={handleCancelStatusChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {statusAction === 'activate' && 'Activate Consultant'}
              {statusAction === 'deactivate' && 'Deactivate Consultant'}
              {statusAction === 'on-leave' && 'Set Consultant On Leave'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {statusAction === 'activate' && `Are you sure you want to activate ${statusTargetConsultant?.fullName}?`}
            {statusAction === 'deactivate' && `Are you sure you want to deactivate ${statusTargetConsultant?.fullName}?`}
            {statusAction === 'on-leave' && `Are you sure you want to set ${statusTargetConsultant?.fullName} as On Leave?`}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelStatusChange} disabled={statusLoading}>Cancel</Button>
            <Button
              variant={statusAction === 'deactivate' ? 'destructive' : 'default'}
              onClick={handleConfirmStatusChange}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>Processing...</span>
              ) : (
                <>
                  {statusAction === 'activate' && 'Activate'}
                  {statusAction === 'deactivate' && 'Deactivate'}
                  {statusAction === 'on-leave' && 'Set On Leave'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
