"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Plus, Search, Users, Mail, TrendingUp, TrendingDown, Minus, Clock, Calendar, User, Filter, Edit, UserCheck, UserX, SearchIcon, FileText, Download, PhoneCall, PhoneIcon, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ConsultantsByDepartmentChart } from "@/components/consultants-by-department-chart"
import Link from "next/link"
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"
import {
  type Consultant,
  type DepartmentSummary,
  getAllConsultants,
  getConsultantsPaginated,
  getConsultantsSummary,
  getConsultantDashboard,
  formatMinutesToHours,
  getDayName,
  getTrendIndicator,
  type ConsultantDashboardData,
  updateConsultantStatus,
  getConsultantLogsByRange,
} from "@/services/consultants"
import { formatDurationString } from "@/services/employee"
import { useState, useEffect } from "react"
import { getAuthData, getUserRole } from "@/services/auth"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { EditConsultantForm } from "@/components/edit-consultant-form"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { X } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { BASE_URL } from "@/services/api"

export default function ConsultantsPage() {
  // All useState hooks
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([])
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Get unique departments for filter dropdown - use both name and ID
  const departments = Array.from(new Set(consultants.map((c) => c.department.name)))
  const departmentMap = new Map(consultants.map((c) => [c.department.name, c.department.id]))

  // Fetch consultants with filters/search using paginated service
  const fetchConsultants = async (page: number = 1, limit?: number) => {
    setListLoading(true);
    try {
      const params: {
        page?: number;
        limit?: number;
        search?: string;
        departmentId?: string;
        status?: string;
      } = {
        page,
        limit: limit || pagination.limit
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (departmentFilter !== "all") {
        const departmentId = departmentMap.get(departmentFilter);
        if (departmentId) params.departmentId = departmentId;
      }
      if (statusFilter !== "all") params.status = statusFilter;

      const result = await getConsultantsPaginated(params);
      if (result.status !== 200) throw new Error(result.message || "Failed to fetch consultants");

      // Handle paginated response structure
      setFilteredConsultants(result.data.items);
      setPagination(result.data.pagination);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch consultants");
      setFilteredConsultants([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setListLoading(false);
    }
  };

  // Reset filters and reload consultants
  const handleResetConsultants = async () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setStatusFilter("all");
    setPagination(prev => ({ ...prev, page: 1 }));
    await fetchConsultants(1);
  };
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  // Define getDefaultDates and initialize start/end before useState hooks
  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const end = tomorrow.toISOString().split('T')[0];
    const startDateObj = new Date(today);
    startDateObj.setDate(today.getDate() - 30);
    const start = startDateObj.toISOString().split('T')[0];
    return { start, end };
  };
  const { start, end } = getDefaultDates();
  // Confirmed date range (used for fetching)
  const [confirmedStartDate, setConfirmedStartDate] = useState<string>(start);
  const [confirmedEndDate, setConfirmedEndDate] = useState<string>(end);
  // Pending date range (used for input fields)
  const [pendingStartDate, setPendingStartDate] = useState<string>(start);
  const [pendingEndDate, setPendingEndDate] = useState<string>(end);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editConsultant, setEditConsultant] = useState<Consultant | null>(null)
  const [modalSection, setModalSection] = useState<'overview' | 'logs' | 'personal' | 'nextOfKin' | 'bank'>('personal')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusTargetConsultant, setStatusTargetConsultant] = useState<Consultant | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | 'on-leave' | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null);
  // Removed recent activity logs state

  // Get company ID from auth data
  const authData = getAuthData();
  const companyId = authData?.user?.company?.id;
  const companyCurrency = authData?.user?.company?.currency

  // Function to fetch tasks by date range from API
  const fetchTasksByDateRange = async (startDate: Date, endDate: Date) => {
    if (!selectedConsultant) return

    setTasksLoading(true)
    setTasksError(null)

    try {
      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0]
      // Ensure end date is tomorrow if user selects today as end
      let endDateStr = endDate.toISOString().split('T')[0]
      const todayStr = new Date().toISOString().split('T')[0]
      if (endDateStr === todayStr) {
        const tmr = new Date()
        tmr.setDate(tmr.getDate() + 1)
        endDateStr = tmr.toISOString().split('T')[0]
      }

      // Fetch logs from API
      const res = await fetch(`/company/consultants/logs/${selectedConsultant.id}?startDate=${startDateStr}&endDate=${endDateStr}`)
      if (!res.ok) throw new Error('Failed to fetch logs')
      const result = await res.json()
      if (result.status !== 200) throw new Error(result.message || 'Failed to fetch logs')
      // Logs already come as minutes; no conversion needed
      setFilteredTasks(result.data || [])
    } catch (error: any) {
      console.error("Error fetching time logs by date range:", error)
      setTasksError(error?.message || "Failed to load time logs for the selected date range")
      setFilteredTasks([])
    } finally {
      setTasksLoading(false)
    }
  }

  // All useEffect hooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both consultants and department summary in parallel
        const [consultantsResponse, summaryResponse] = await Promise.all([
          getConsultantsPaginated({ page: 1, limit: 10 }),
          getConsultantsSummary(),
        ])

        // Handle paginated consultants response
        if (consultantsResponse.status === 200) {
          setConsultants(consultantsResponse.data.items)
          setFilteredConsultants(consultantsResponse.data.items)
          setPagination(consultantsResponse.data.pagination)
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
  }, [])

  // Fetch logs by range only when confirmed date range or selectedConsultant changes
  useEffect(() => {
    if (!selectedConsultant || modalSection !== 'logs') return;
    setTasksLoading(true);
    setTasksError(null);
    // Normalize end date: if today, use tomorrow
    const todayStr = new Date().toISOString().split('T')[0];
    let normalizedEnd = confirmedEndDate;
    if (confirmedEndDate === todayStr) {
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      normalizedEnd = tmr.toISOString().split('T')[0];
    }
    getConsultantLogsByRange(selectedConsultant.id, confirmedStartDate, normalizedEnd)
      .then(result => {
        setFilteredTasks(result.data || []);
      })
      .catch(error => {
        setTasksError(error?.message || 'Failed to load time logs for the selected date range');
        setFilteredTasks([]);
      })
      .finally(() => setTasksLoading(false));
  }, [selectedConsultant, confirmedStartDate, confirmedEndDate, modalSection]);

  // When switching to logs tab, reset pending dates to confirmed
  useEffect(() => {
    if (modalSection === 'logs') {
      setPendingStartDate(confirmedStartDate);
      setPendingEndDate(confirmedEndDate);
    }
  }, [modalSection, confirmedStartDate, confirmedEndDate]);

  // Set current date for start and tomorrow for end (for Today quick action)
  const setCurrentDate = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setPendingStartDate(todayStr);
    setPendingEndDate(tomorrowStr);
    setConfirmedStartDate(todayStr);
    setConfirmedEndDate(tomorrowStr);
  };

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  // Helper to get start of current week (Monday)
  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Removed recent activity effect

  // Only now, after all hooks, do the early return
  if (userRole === null) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
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

  // Calculate stats - use pagination total for accurate counts
  const totalConsultants = pagination.total
  const activeConsultants = filteredConsultants.filter((c) => c.status === "active").length
  const onLeaveConsultants = filteredConsultants.filter((c) => c.status === "on-leave").length

  // Calculate new hires (consultants added in the last 30 days) - only from current page
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newHires = filteredConsultants.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo).length

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
      await updateConsultantStatus(statusTargetConsultant.id, newStatus)
      // Refetch current page after status change
      await fetchConsultants(pagination.page)
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
        <h1 className="text-xl font-medium tracking-tight ">Consultants</h1>
        <div className="flex items-center gap-2">
          {userRole !== "Board Member" && (
            <Button asChild>
              <Link href="/dashboard/company-admin/consultants/add">
                <Plus className="mr-2 h-4 w-4" /> Add Consultant
              </Link>
            </Button>
          )}
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
                <div className="text-2xl text-primary font-bold">{totalConsultants}</div>
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
                <div className="text-2xl font-bold text-primary">{activeConsultants}</div>
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
                <div className="text-2xl font-bold text-primary">{onLeaveConsultants}</div>
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
                <div className="text-2xl font-bold text-primary">{newHires}</div>
                <p className="text-xs text-muted-foreground">In the last 30 days</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Consultants by Department</CardTitle>
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

      <div className="flex  p-4 rounded bg-paper flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center h-12 border border-gray-200 rounded-lg  focus-within:ring-2 focus-within:ring-blue-100">
            <span className="absolute left-3 text-gray-400">
              <SearchIcon className="h-6 w-6" />
            </span>
            <Input
              type="text"
              placeholder="Search consultants..."
              className="pl-12 h-12 w-full border-none bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={listLoading}
            />
          </div>
          <Button className="mr-1" onClick={() => fetchConsultants(1)} disabled={listLoading}>
            {listLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span> : null}
            <Search />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex flex-row items-center gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter} disabled={listLoading}>
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
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={listLoading}>
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
          <Button onClick={() => fetchConsultants(1)} disabled={listLoading}>
            {listLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span> : null}
            Filter
          </Button>
          <Button variant="outline" onClick={handleResetConsultants} disabled={listLoading}>
            {listLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></span> : null}
            Reset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Consultants</CardTitle>
          <CardDescription>Manage your company consultants</CardDescription>
        </CardHeader>
        <CardContent>
          {(loading || listLoading) ? (
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
                                src={consultant?.profileImage || "/placeholder.svg"}
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
                            <Button className="hover:bg-gray-200/50" variant="ghost" size="icon" onClick={() => handleViewConsultant(consultant)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {userRole !== "Board Member" && (
                              <>
                                <Button className="hover:bg-gray-200/50" variant="ghost" size="icon" onClick={() => handleEditConsultant(consultant)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button className="hover:bg-gray-200/50"
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
                              </>
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => {
                const newLimit = parseInt(value);
                setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                fetchConsultants(1, newLimit);
              }}
              disabled={listLoading}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchConsultants(pagination.page - 1)}
              disabled={!pagination.hasPrev || listLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {(() => {
                const totalPages = pagination.totalPages;
                const currentPage = pagination.page;
                const pages = [];

                if (totalPages <= 7) {
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Show smart pagination
                  if (currentPage <= 4) {
                    // Show first 5 pages + ... + last page
                    for (let i = 1; i <= 5; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    // Show first page + ... + last 5 pages
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show first + ... + current-1, current, current+1 + ... + last
                    pages.push(1);
                    pages.push('...');
                    pages.push(currentPage - 1);
                    pages.push(currentPage);
                    pages.push(currentPage + 1);
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="text-muted-foreground px-2">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchConsultants(page as number)}
                      disabled={listLoading}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                });
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchConsultants(pagination.page + 1)}
              disabled={!pagination.hasNext || listLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Consultant Details Modal */}
      {selectedConsultant && isConsultantModalOpen && (
        <Dialog open={true} onOpenChange={open => { if (!open) handleCloseModal(); }}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"></div>
            {/* Fullscreen Modal Content */}
            <div
              className="relative w-screen h-screen bg-pale flex flex-col overflow-y-auto !rounded-none border-0 shadow-2xl"
              style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between bg-paper border-b px-8 py-4">
                <DialogHeader className="flex flex-row items-center gap-4 w-full">
                  <DialogTitle className="flex items-center gap-2  font-nomal text-base">
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
                <div className="w-56 min-w-[180px]  bg-paper flex flex-col py-8 gap-2 text-base">
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'overview' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200/50'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('overview')}>Overview</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'logs' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200/50'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('logs')}>Logs by Range</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'personal' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200/50'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('personal')}>Personal</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'nextOfKin' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200/50'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('nextOfKin')}>Next of Kin</button>
                  <button className={`mx-3 text-left px-4 py-2 rounded transition-colors ${modalSection === 'bank' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200/50'}`} style={{ fontSize: '14px' }} onClick={() => setModalSection('bank')}>Bank Details</button>
                </div>
                {/* Main Content - only this is scrollable */}
                <div className="flex-1 py-8 md:py-12 bg-pale px-8 overflow-y-auto h-full pb-0">
                  {modalSection === 'overview' && (
                    <div className="flex flex-col gap-8">
                      {/* Hours Overview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl font-medium">Hours Overview</CardTitle>
                          <CardDescription>Time tracked across different periods</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                            {/* Today */}
                            <Card className="bg-pale">
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
                                <div className="text-2xl font-normal text-gradient">
                                  {formatMinutesToHours(dashboardData?.hoursToday.count || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">{dashboardData?.hoursToday.count || 0} minutes</p>
                              </CardContent>
                            </Card>
                            {/* This Week */}
                            <Card className="bg-pale">
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
                                <div className="text-2xl font-normal text-gradient">
                                  {formatMinutesToHours(dashboardData?.hoursWeek.count || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">{dashboardData?.hoursWeek.count || 0} minutes</p>
                              </CardContent>
                            </Card>
                            {/* This Month */}
                            <Card className="bg-pale">
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
                                <div className="text-2xl font-normal text-gradient">
                                  {formatMinutesToHours(dashboardData?.hoursMonth.count || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">{dashboardData?.hoursMonth.count || 0} minutes</p>
                              </CardContent>
                            </Card>
                            {/* Last Month */}
                            <Card className="bg-pale">
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
                                <div className="text-2xl font-normal text-gradient">
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
                                  <Bar dataKey="hours" fill={GRAPH_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
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
                  {/* Recent Activity section removed */}
                  {modalSection === 'logs' && (
                    <div className="flex flex-col gap-8">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl font-medium">Time Logs by Date Range</CardTitle>
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
                                      value={pendingStartDate}
                                      onChange={(e) => setPendingStartDate(e.target.value)}
                                      className="w-40"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label htmlFor="end-date" className="text-xs text-muted-foreground">
                                      End Date
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        id="end-date"
                                        type="date"
                                        value={pendingEndDate}
                                        onChange={(e) => setPendingEndDate(e.target.value)}
                                        className="w-40"
                                      />
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="ml-2"
                                        onClick={() => {
                                          setConfirmedStartDate(pendingStartDate);
                                          setConfirmedEndDate(pendingEndDate);
                                        }}
                                        disabled={tasksLoading}
                                      >
                                        {tasksLoading ? (
                                          <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Loading...</span>
                                        ) : (
                                          "Confirm"
                                        )}
                                      </Button>
                                    </div>
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
                                      disabled={tasksLoading}
                                    >
                                      {tasksLoading ? (
                                        <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>Loading...</span>
                                      ) : (
                                        "Today"
                                      )}
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
                                  onClick={() => {
                                    setConfirmedStartDate(pendingStartDate);
                                    setConfirmedEndDate(pendingEndDate);
                                  }}
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
                                    <div className="text-center p-4 rounded-lg bg-pale">
                                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                      <p className="text-2xl font-bold">
                                        {totalHours}h {remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
                                      </p>
                                      <p className="text-sm text-muted-foreground">Total Hours</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-pale">
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
                                    <TableHead>Description</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Updated Date</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tasksLoading ? (
                                    // Show 5 skeleton rows, 7 columns each
                                    [...Array(5)].map((_, i) => (
                                      <TableRow key={i}>
                                        {[...Array(7)].map((_, j) => (
                                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                        ))}
                                      </TableRow>
                                    ))
                                  ) : (
                                    filteredTasks.map((timeLog) => (
                                      <TableRow key={timeLog.id}>
                                        <TableCell className="font-medium">{timeLog.title}</TableCell>
                                        <TableCell>
                                          <div className="text-sm text-muted-foreground max-w-[250px] truncate" style={{ maxWidth: 250 }}>
                                            <span dangerouslySetInnerHTML={{ __html: timeLog.description || '' }} />
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{timeLog.project}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {timeLog.createdAt ? new Date(timeLog.createdAt).toLocaleDateString() : '-'}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {timeLog.updatedAt ? new Date(timeLog.updatedAt).toLocaleDateString() : '-'}
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
                                    ))
                                  )}
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
                              src={selectedConsultant?.profileImage || "/placeholder.svg"}
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
                            <h2 className="text-2xl text-gradient font-medium">{selectedConsultant?.fullName || '-'}</h2>
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
                                {(selectedConsultant as any)?.phoneNumber || '-'}</div></div>

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
                                  (selectedConsultant as any).attachments.map((att: { url: string; name: string }, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 border rounded shadow-sm bg-muted/10">
                                      <div className="flex-shrink-0">
                                        <FileText className="h-5 w-5 text-red-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{att.name || `Attachment ${idx + 1}`}</div>
                                      </div>
                                      <a
                                        href={att.url}
                                        download={att.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          View
                                        </Button>
                                      </a>
                                      <a
                                        href={att.url}
                                        download={att.name}
                                        rel="noopener noreferrer"
                                      >
                                        <Button variant="outline" size="sm" className="flex items-center gap-2 ml-2">
                                          <Download className="h-4 w-4" />
                                          Download
                                        </Button>
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground text-sm">No attachments found.</div>
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
                                        if (!currency) currency = companyCurrency;
                                        if (!grossPay || isNaN(Number(grossPay))) return '-';
                                        // Format with commas
                                        const formattedGrossPay = Number(grossPay).toLocaleString();
                                        return `${currency} ${formattedGrossPay}`;
                                      })()}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">Monthly Gross Pay</span>
                                  </CardContent>
                                </Card>
                                <span className="text-xs text-muted-foreground block text-center mt-1">If no currency is set,the company currency is used by default.</span>
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
                                    <Card key={idx} className="px-3 py-1 border shadow-none text-sm font-medium rounded-full">
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
                          <CardTitle className="text-xl font-medium">Next of Kin</CardTitle>
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
                          <CardTitle className="text-xl font-medium">Bank Details</CardTitle>
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
        <DialogContent className="inset-0 w-screen h-screen max-w-none max-h-none p-0 m-0 bg-pale !rounded-none border-0 overflow-y-auto flex flex-col" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px' }}>
          <DialogTitle><VisuallyHidden>Edit Consultant</VisuallyHidden></DialogTitle>
          <div className="sticky top-0 left-0 w-full bg-paper shadow z-20 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <Edit className="h-5 w-5" />
              {/* Edit Consultant */}
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
          <div className="flex-1  px-8 py-6 pb-0">
            {editConsultant && (
              <EditConsultantForm consultant={editConsultant} onClose={handleCloseEditModal} onUpdated={async () => {
                setIsEditModalOpen(false);
                setEditConsultant(null);
                // Refetch current page and department summary after update
                setLoading(true);
                setChartLoading(true);
                try {
                  const [summaryResponse] = await Promise.all([
                    getConsultantsSummary(),
                    fetchConsultants(pagination.page),
                  ]);
                  if (summaryResponse.status === 200) {
                    setDepartmentSummary(summaryResponse.data);
                  }
                } catch (error) {
                  console.error("Failed to refetch data after consultant update:", error);
                } finally {
                  setLoading(false);
                  setChartLoading(false);
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
