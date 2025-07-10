"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, Settings, User, Search as SearchIcon, Eye, Clock, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAllConsultants, Consultant, getConsultantDashboard, formatMinutesToHours, getDayName, getTrendIndicator, ConsultantDashboardData } from "@/services/consultants"
import { getAuthData } from "@/services/auth"
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatDurationString } from "@/services/employee"
import { Label } from "@/components/ui/label"
import { FileText, Download, MapPin, Mail, PhoneIcon } from "lucide-react"

export default function DepartmentAdminDashboard() {
    const [consultants, setConsultants] = useState<Consultant[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [departmentFilter, setDepartmentFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([])
    const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false)
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
    const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null)
    const [dashboardLoading, setDashboardLoading] = useState(false)
    const [dashboardError, setDashboardError] = useState<string | null>(null)
    const [modalSection, setModalSection] = useState<'overview' | 'recent' | 'logs' | 'personal' | 'nextOfKin' | 'bank'>('overview')
    const [startDate, setStartDate] = useState<string>("2024-01-05")
    const [endDate, setEndDate] = useState<string>("2024-02-05")
    const [filteredTasks, setFilteredTasks] = useState<any[]>([])
    const [tasksLoading, setTasksLoading] = useState(false)
    const [tasksError, setTasksError] = useState<string | null>(null)

    useEffect(() => {
        const fetchConsultants = async () => {
            setLoading(true)
            const authData = getAuthData()
            const companyId = authData?.user?.company?.id
            if (!companyId) {
                setConsultants([])
                setLoading(false)
                return
            }
            const response = await getAllConsultants(companyId)
            if (response.status === 200) {
                setConsultants(response.data)
            } else {
                setConsultants([])
            }
            setLoading(false)
        }
        fetchConsultants()
    }, [])

    useEffect(() => {
        // Filter consultants based on search query, department, and status
        let filtered = consultants
        if (searchQuery) {
            filtered = filtered.filter(
                (consultant) =>
                    consultant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    consultant.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        if (departmentFilter !== "all") {
            filtered = filtered.filter(
                (consultant) => consultant.department.name.toLowerCase() === departmentFilter.toLowerCase()
            )
        }
        if (statusFilter !== "all") {
            filtered = filtered.filter((consultant) => {
                const status = consultant.status === "" ? "on-leave" : consultant.status.toLowerCase()
                return status === statusFilter.toLowerCase()
            })
        }
        setFilteredConsultants(filtered)
    }, [searchQuery, departmentFilter, statusFilter, consultants])

    // Overview stats
    const totalConsultants = consultants.length
    const activeConsultants = consultants.filter((c) => c.status === "active").length
    const onLeaveConsultants = consultants.filter((c) => c.status === "on-leave" || c.status === "").length
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newHires = consultants.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo).length
    const departments = Array.from(new Set(consultants.map((c) => c.department.name)))

    // Chart data for modal
    const chartData =
        dashboardData?.weekDistribution?.map((item: any) => ({
            day: getDayName(item.day),
            hours: item.hours / 60, // Convert minutes to hours for display
            fullDay: getDayName(item.day),
        })) || []

    const todayTrend = dashboardData ? getTrendIndicator(dashboardData.hoursToday?.percentage) : null
    const weekTrend = dashboardData ? getTrendIndicator(dashboardData.hoursWeek?.percentage) : null
    const monthTrend = dashboardData ? getTrendIndicator(dashboardData.hoursMonth?.percentage) : null
    const lastMonthTrend = dashboardData?.hoursLastMonth ? getTrendIndicator(dashboardData.hoursLastMonth?.percentage) : null

    const setCurrentDate = () => {
        const today = new Date().toISOString().split('T')[0]
        setStartDate(today)
        setEndDate(today)
    }

    const fetchTasksByDateRange = async (start: Date, end: Date) => {
        if (!selectedConsultant) return
        setTasksLoading(true)
        setTasksError(null)
        try {
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
            // Mock API response - replace with real API call if available
            const mockApiResponse: any[] = [
                // ... (copy the mock data from company admin)
            ]
            const filtered = mockApiResponse.filter(timeLog => {
                const logDate = new Date(timeLog.createdAt)
                return logDate >= start && logDate <= end
            })
            setFilteredTasks(filtered)
        } catch (error) {
            setTasksError("Failed to load time logs for the selected date range")
            setFilteredTasks([])
        } finally {
            setTasksLoading(false)
        }
    }

    useEffect(() => {
        if (!startDate || !endDate) {
            setFilteredTasks([])
            return
        }
        fetchTasksByDateRange(new Date(startDate), new Date(endDate))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, selectedConsultant])

    const calculateTotalHours = () => {
        return filteredTasks.reduce((total, timeLog) => {
            return total + Number(timeLog.duration)
        }, 0)
    }
    const totalMinutes = calculateTotalHours()
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

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
        setModalSection('overview')
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Department Admin Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/profile">
                            <User className="mr-2 h-4 w-4" /> Profile
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" /> Settings
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
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="consultants">Consultants</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Overview</CardTitle>
                            <CardDescription>Summary of department activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Welcome, Department Admin! Here you can view your department's consultants and activity.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="consultants" className="space-y-4">
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
                            <CardDescription>View and search company consultants</CardDescription>
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
                                                const initials = consultant.fullName
                                                    .split(" ")
                                                    .map((name) => name[0])
                                                    .join("")
                                                    .toUpperCase()
                                                    .substring(0, 2)
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
                                                                        {initials}
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
                                                                        +{(selectedConsultant as any)?.phoneNumber || '-'}
                                                                    </div></div>

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
                </TabsContent>
            </Tabs>
        </div>
    )
} 