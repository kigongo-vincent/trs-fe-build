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
import { GRAPH_PRIMARY_COLOR } from "@/lib/utils"
import {
  getAllConsultants,
  type Consultant,
  type ConsultantDashboardData,
  getConsultantDashboard,
  type DepartmentSummary,
  getConsultantsSummary,
  formatMinutesToHours,
  getDayName,
  getTrendIndicator,
  updateConsultantStatus,
  getConsultantLogsByRange,
} from "@/services/consultants"
import {
  type DepartmentHeadConsultant,
  getDepartmentHeadConsultants
} from "@/services/departmentHead"
import { formatDurationString } from "@/services/employee"
import { useState, useEffect } from "react"
import { getAuthData, getUserRole } from "@/services/auth"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { EditConsultantForm } from "@/components/edit-consultant-form"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { X } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default function ConsultantsPage() {
  // All useState hooks
  const [consultants, setConsultants] = useState<DepartmentHeadConsultant[]>([])
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([])
  const [filteredConsultants, setFilteredConsultants] = useState<DepartmentHeadConsultant[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })
  const [chartLoading, setChartLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  // Define getDefaultDates and initialize start/end before useState hooks
  const getDefaultDates = () => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
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
  const [modalSection, setModalSection] = useState<'overview' | 'recent' | 'logs' | 'personal' | 'nextOfKin' | 'bank'>('personal')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusTargetConsultant, setStatusTargetConsultant] = useState<Consultant | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | 'on-leave' | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null);
  // State for recent activity logs
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentLogsLoading, setRecentLogsLoading] = useState(false);
  const [recentLogsError, setRecentLogsError] = useState<string | null>(null);

  // Get company ID from auth data
  const authData = getAuthData();
  const companyId = authData?.user?.company?.id;

  // Function to fetch tasks by date range from API
  const fetchTasksByDateRange = async (startDate: Date, endDate: Date) => {
    if (!selectedConsultant) return

    setTasksLoading(true)
    setTasksError(null)

    try {
      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Fetch logs from API
      const res = await fetch(`/company/consultants/logs/${selectedConsultant.id}?startDate=${startDateStr}&endDate=${endDateStr}`)
      if (!res.ok) throw new Error('Failed to fetch logs')
      const result = await res.json()
      if (result.status !== 200) throw new Error(result.message || 'Failed to fetch logs')
      // Map durations to minutes (duration is string in hours, e.g. "9.00")
      const filtered = (result.data || []).map((log: any) => ({
        ...log,
        // duration in minutes (parseFloat hours * 60)
        duration: log.duration ? String(Math.round(parseFloat(log.duration) * 60)) : '0',
      }))
      setFilteredTasks(filtered)
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
        setLoading(true)

        // Fetch consultants using department head service
        const response = await getDepartmentHeadConsultants(pagination.page, pagination.limit)

        if (response.status === 200) {
          setConsultants(response.data.consultants)
          setFilteredConsultants(response.data.consultants)
          setPagination(response.data.pagination)
        }

        // Fetch department summary (if still needed)
        const authData = getAuthData()
        if (authData?.companyId) {
          const summaryResponse = await getConsultantsSummary()
          if (summaryResponse.status === 200) {
            setDepartmentSummary(summaryResponse.data)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load consultants data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pagination.page, pagination.limit])

  // Fetch logs by range only when confirmed date range or selectedConsultant changes
  useEffect(() => {
    if (!selectedConsultant || modalSection !== 'logs') return;
    setTasksLoading(true);
    setTasksError(null);
    getConsultantLogsByRange(selectedConsultant.id, confirmedStartDate, confirmedEndDate)
      .then(result => {
        // Map durations to minutes (duration is string in hours, e.g. "9.00")
        const filtered = (result.data || []).map((log: any) => ({
          ...log,
          duration: log.duration ? String(Math.round(parseFloat(log.duration) * 60)) : '0',
        }));
        setFilteredTasks(filtered);
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

  // Set current date for both start and end (for Today quick action)
  const setCurrentDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setPendingStartDate(today);
    setPendingEndDate(today);
    setConfirmedStartDate(today);
    setConfirmedEndDate(today);
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

  // Fetch recent activity logs for current week when modalSection === 'recent' and selectedConsultant changes
  useEffect(() => {
    if (!selectedConsultant || modalSection !== 'recent') return;
    setRecentLogsLoading(true);
    setRecentLogsError(null);
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const start = startOfWeek.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    getConsultantLogsByRange(selectedConsultant.id, start, end)
      .then(result => {
        // Map durations to minutes (duration is string in hours, e.g. "9.00")
        const filtered = (result.data || []).map((log: any) => ({
          ...log,
          duration: log.duration ? String(Math.round(parseFloat(log.duration) * 60)) : '0',
        })).filter((log: any) => {
          // Only include logs whose createdAt is within this week
          const logDate = new Date(log.createdAt);
          return logDate >= startOfWeek && logDate <= today;
        });
        setRecentLogs(filtered);
      })
      .catch(error => {
        setRecentLogsError(error?.message || 'Failed to load recent activity logs');
        setRecentLogs([]);
      })
      .finally(() => setRecentLogsLoading(false));
  }, [selectedConsultant, modalSection]);

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


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Consultants</h1>
        <div className="flex items-center gap-2">
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
          <CardTitle>All Consultants</CardTitle>
          <CardDescription>Manage your department consultants</CardDescription>
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
                                src="/placeholder.svg"
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
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
