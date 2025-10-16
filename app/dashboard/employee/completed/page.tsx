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
  X,
  LinkIcon,
  Loader2,
  MoveRight,
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
  fetchEmployeeTimeLogsWithFilters,
  getTrendIndicator,
  formatDurationString,
  formatDate,
  formatDateTime,
  getDefaultDateRange,
  formatDateForAPI,
  type TaskCompletionData,
  type TimeLog,
} from "@/services/employee"
import { IMAGE_BASE_URL } from "@/services/api"
import DOMPurify from 'dompurify'
import TaskDetailModal, { Attachment } from "@/components/TaskDetailModal"

export default function CompletedTasksPage() {
  const [selectedTask, setSelectedTask] = useState<TimeLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [completionData, setCompletionData] = useState<TaskCompletionData | null>(null)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [filteredTimeLogs, setFilteredTimeLogs] = useState<TimeLog[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTimeLogsLoading, setIsTimeLogsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [projectLoading, setProjectLoading] = useState(false)

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
        const data = await fetchEmployeeTimeLogsWithFilters({
          startDate,
          endDate,
          status: "active" // Only show completed/active tasks, exclude drafts
        })
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

  // Search handler to fetch from server
  const handleSearch = async () => {
    setIsSearchLoading(true)
    setError(null)
    try {
      const startDate = formatDateForAPI(dateRange.from)
      const endDate = formatDateForAPI(dateRange.to)
      const logs = await fetchEmployeeTimeLogsWithFilters({
        search: searchTerm,
        startDate,
        endDate,
        status: "active", // Only show completed/active tasks, exclude drafts
        project: projectFilter,
      })
      // Apply client-side filtering as backup protection
      const filteredLogs = filterOutDrafts(logs)
      setFilteredTimeLogs(filteredLogs)
    } catch (err) {
      setError("Failed to search time logs. Please try again.")
    } finally {
      setIsSearchLoading(false)
    }
  }

  // Client-side filter to exclude drafts (backup protection)
  const filterOutDrafts = (logs: TimeLog[]) => {
    return logs.filter(log => log.status !== 'draft')
  }

  // Initial load: set filteredTimeLogs to all timeLogs (excluding drafts)
  useEffect(() => {
    const filteredLogs = filterOutDrafts(timeLogs)
    setFilteredTimeLogs(filteredLogs)
  }, [timeLogs])

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

  // Get unique projects for filter (id and name)
  const uniqueProjects = Array.from(
    new Map(timeLogs.map((log) => [log.projectId, { id: log.projectId, name: log.project }])).values()
  )

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Completed Tasks</h1>
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

  const getAttachmentsFromTimeLog = (timeLog: TimeLog): Attachment[] => {
    if (!timeLog.attachments || timeLog.attachments.length === 0) {
      return []
    }
    return []
  }

  return (
    <div className="flex flex-col gap-4">


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
                <div className="text-2xl font-medium text-gradient">{completionData?.completedToday.count || 0}</div>
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
                <div className="text-2xl font-medium text-gradient">{completionData?.completedThisWeek.count || 0}</div>
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
                <div className="text-2xl font-medium text-gradient">{completionData?.completedThisMonth.count || 0}</div>
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
                <div className="text-2xl font-medium text-gradient">{completionData?.completionRate.rate || 0}%</div>
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
          <CardTitle className="text-xl text-gradient">Completion Trends</CardTitle>
          <CardDescription>Tasks completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <CompletedTasksChart />
        </CardContent>
      </Card>

      <div className="md:flex flex-col hidden gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1  items-center space-x-2">
          {/* <Input
            type="text"
            placeholder="Search tasks..."
            className="h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          /> */}
          {/* <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 lg:px-3"
            onClick={handleSearch}
            disabled={isSearchLoading}
          >
            {isSearchLoading ? (
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent rounded-full border-primary" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="sr-only md:not-sr-only md:ml-2">Search</span>
          </Button> */}
          <div className="p-2 flex-1 bg-paper gap-3 rounded flex items-center ">
            <div />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={handleSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="Search for your tasks..." type="text" className="bg-none bg-transparent flex-1 text-sm outline-none border-none" />
            <Button className=" bg-gray-900 hover:bg-gray-600" onClick={handleSearch}>
              {isSearchLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin" />
                  <span className="sr-only md:not-sr-only md:ml-2">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />

                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex md:flex-row  bg-paper p-2 rounded overflow-auto justify-between items-center gap-2">
          <div className="flex flex-col gap-1 ">
            <Input
              id="start-date"
              type="date"
              className="h-9 px-2 border rounded"
              value={dateRange.from.toISOString().slice(0, 10)}
              onChange={e => {
                const newFrom = new Date(e.target.value)
                setDateRange(r => ({ ...r, from: newFrom }))
              }}
              max={dateRange.to.toISOString().slice(0, 10)}
            />
          </div>
          <MoveRight size={15} className="opacity-40" />

          <div className="flex flex-col gap-1">
            <Input
              id="end-date"
              type="date"
              className="h-9 px-2 border rounded"
              value={dateRange.to.toISOString().slice(0, 10)}
              onChange={e => {
                const newTo = new Date(e.target.value)
                setDateRange(r => ({ ...r, to: newTo }))
              }}
              min={dateRange.from.toISOString().slice(0, 10)}
            />
          </div>

          <div className="  hidden md:flex flex-col gap-1">
            <Select
              value={projectFilter}
              onValueChange={async (id) => {
                setProjectFilter(id)
                setProjectLoading(true)
                setError(null)
                try {
                  let logs
                  const startDate = formatDateForAPI(dateRange.from)
                  const endDate = formatDateForAPI(dateRange.to)
                  if (id === "all") {
                    logs = await fetchEmployeeTimeLogsWithFilters({
                      startDate,
                      endDate,
                      status: "active" // Only show completed/active tasks, exclude drafts
                    })
                  } else {
                    logs = await fetchEmployeeTimeLogsWithFilters({
                      project: id,
                      startDate,
                      endDate,
                      status: "active" // Only show completed/active tasks, exclude drafts
                    })
                  }
                  // Apply client-side filtering as backup protection
                  const filteredLogs = filterOutDrafts(logs)
                  setFilteredTimeLogs(filteredLogs)
                } catch (err) {
                  setError("Failed to filter by project. Please try again.")
                } finally {
                  setProjectLoading(false)
                }
              }}
            >
              <SelectTrigger id="project-select" className="h-9 w-[160px] ">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {uniqueProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        </div>
      </div>

      <Card className="max-w-[90vw] sm:max-w-full  sm:m-0 m-auto">
        <CardHeader>
          <CardTitle className="text-xl text-gradient">Time Logs</CardTitle>
          <CardDescription>
            Showing {filteredTimeLogs.length} of {timeLogs.length} time logs
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          {(isTimeLogsLoading || isSearchLoading || projectLoading) ? (
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
            <Table className="">
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
                        {/* <div className="text-sm text-muted-foreground truncate max-w-[200px]">{log.description}</div> */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="min-w-max">{log.project}</Badge>
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

      <TaskDetailModal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        task={selectedTask}
        attachments={selectedTask ? getAttachmentsFromTimeLog(selectedTask) : []}
        urls={[]}
      />

    </div>
  )
}
