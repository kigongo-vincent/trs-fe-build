"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CalendarIcon,
  Check,
  Download,
  Eye,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  User,
  CalendarIcon as CalendarIconComponent,
  FileText,
} from "lucide-react"
import { CompletedTasksChart } from "@/components/completed-tasks-chart"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  fetchTaskCompletionData,
  fetchEmployeeTimeLogsByRange,
  getTrendIndicator,
  formatDurationString,
  formatDate,
  formatDateTime,
  getDefaultDateRange,
  formatDateForAPI,
  type TaskCompletionData,
  type TimeLog,
} from "@/services/employee"

export default function CompletedTasksPage() {
  const [selectedTask, setSelectedTask] = useState<TimeLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [completionData, setCompletionData] = useState<TaskCompletionData | null>(null)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [filteredTimeLogs, setFilteredTimeLogs] = useState<TimeLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTimeLogsLoading, setIsTimeLogsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")

  // Date range state
  const defaultRange = getDefaultDateRange()
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(defaultRange.startDate),
    to: new Date(defaultRange.endDate),
  })

  // Load completion data
  useEffect(() => {
    const loadCompletionData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchTaskCompletionData()
        setCompletionData(data)
      } catch (err) {
        console.error("Error loading completion data:", err)
        setError("Failed to load completion data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCompletionData()
  }, [])

  // Load time logs based on date range
  useEffect(() => {
    const loadTimeLogs = async () => {
      try {
        setIsTimeLogsLoading(true)
        const startDate = formatDateForAPI(dateRange.from)
        const endDate = formatDateForAPI(dateRange.to)
        const data = await fetchEmployeeTimeLogsByRange(startDate, endDate)
        setTimeLogs(data)
      } catch (err) {
        console.error("Error loading time logs:", err)
        setError("Failed to load time logs. Please try again.")
      } finally {
        setIsTimeLogsLoading(false)
      }
    }

    loadTimeLogs()
  }, [dateRange])

  // Filter time logs based on search and filters
  useEffect(() => {
    let filtered = timeLogs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.project.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter((log) => log.project === projectFilter)
    }

    setFilteredTimeLogs(filtered)
  }, [timeLogs, searchTerm, statusFilter, projectFilter])

  const handleViewTask = (task: TimeLog) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const handleRetry = () => {
    const loadCompletionData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchTaskCompletionData()
        setCompletionData(data)
      } catch (err) {
        console.error("Error loading completion data:", err)
        setError("Failed to load completion data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCompletionData()
  }

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  const getTrendIcon = (change: number) => {
    const trend = getTrendIndicator(change)
    if (trend === "positive") return <TrendingUp className="h-3 w-3 text-green-600" />
    if (trend === "negative") return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  const getTrendText = (change: number, period: string) => {
    if (change === 0) return `No change from ${period}`
    const sign = change > 0 ? "+" : ""
    const color = change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"
    return (
      <span className={color}>
        {sign}
        {change} from {period}
      </span>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
      case "draft":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800"
    }
  }

  // Get unique projects for filter
  const uniqueProjects = Array.from(new Set(timeLogs.map((log) => log.project)))

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Completed Tasks</h1>
        </div>
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button onClick={handleRetry} size="sm" variant="outline">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Completed Tasks</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{completionData?.completedToday.count || 0}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(completionData?.completedToday.change || 0)}
                  {getTrendText(completionData?.completedToday.change || 0, "yesterday")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{completionData?.completedThisWeek.count || 0}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(completionData?.completedThisWeek.change || 0)}
                  {getTrendText(completionData?.completedThisWeek.change || 0, "last week")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{completionData?.completedThisMonth.count || 0}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(completionData?.completedThisMonth.change || 0)}
                  {getTrendText(completionData?.completedThisMonth.change || 0, "last month")}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{completionData?.completionRate.rate || 0}%</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(completionData?.completionRate.change || 0)}
                  {getTrendText(completionData?.completionRate.change || 0, "last month")}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Trends</CardTitle>
          <CardDescription>Tasks completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <CompletedTasksChart />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search tasks..."
            className="h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3">
            <Search className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Search</span>
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>
                  {formatDate(dateRange.from.toISOString())} - {formatDate(dateRange.to.toISOString())}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {uniqueProjects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Logs</CardTitle>
          <CardDescription>
            Showing {filteredTimeLogs.length} of {timeLogs.length} time logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTimeLogsLoading ? (
            <div className="space-y-3">
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
          ) : filteredTimeLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No time logs found for the selected criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{log.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">{log.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.project}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDurationString(log.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewTask(log)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Time Log Details</DialogTitle>
            <DialogDescription>Detailed information about the time log entry.</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6 pt-2">
              <div>
                <h3 className="text-lg font-semibold text-primary">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedTask.project}</Badge>
                  <Badge variant="outline" className={getStatusBadgeColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold">{formatDurationString(selectedTask.duration)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarIconComponent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="text-sm">{formatDateTime(selectedTask.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarIconComponent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{formatDateTime(selectedTask.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employee</p>
                      <p className="text-sm font-semibold">{selectedTask.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{selectedTask.user.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employee Status</p>
                    <Badge variant="outline" className={getStatusBadgeColor(selectedTask.user.status)}>
                      {selectedTask.user.status}
                    </Badge>
                  </div>

                  {selectedTask.user.jobTitle && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                      <p className="text-sm">{selectedTask.user.jobTitle}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm leading-relaxed">{selectedTask.description}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
