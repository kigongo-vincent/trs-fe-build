"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Clock, Download, Filter, Plus, Search, Paperclip, Eye, Type } from "lucide-react"
import Link from "next/link"
import { TimeLogsChart } from "@/components/time-logs-chart"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState, useMemo } from "react"
import { fetchEmployeeTimeLogs, formatDurationString, formatDate, type TimeLog } from "@/services/employee"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RichTextEditor } from "@/components/rich-text-editor"
import { FileAttachment, type Attachment } from "@/components/file-attachment"

export default function TimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Fetch time logs data
  useEffect(() => {
    const loadTimeLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchEmployeeTimeLogs()
        setTimeLogs(data)
      } catch (err) {
        console.error("Error loading time logs:", err)
        setError("Failed to load time logs. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadTimeLogs()
  }, [])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    let hoursToday = 0
    let hoursWeek = 0
    let hoursMonth = 0
    let billableHours = 0

    timeLogs.forEach((log) => {
      const logDate = new Date(log.createdAt)
      const duration = Number.parseFloat(log.duration)

      // Today's hours
      if (logDate.toDateString() === today.toDateString()) {
        hoursToday += duration
      }

      // This week's hours
      if (logDate >= startOfWeek) {
        hoursWeek += duration
      }

      // This month's hours
      if (logDate >= startOfMonth) {
        hoursMonth += duration
      }

      // Billable hours (assuming active status means billable)
      if (log.status === "active") {
        billableHours += duration
      }
    })

    return {
      hoursToday: hoursToday / 60, // Convert to hours
      hoursWeek: hoursWeek / 60,
      hoursMonth: hoursMonth / 60,
      billableHours: billableHours / 60,
      billableRate: hoursMonth > 0 ? (billableHours / (hoursMonth * 60)) * 100 : 0,
    }
  }, [timeLogs])

  // Get unique projects for filter
  const uniqueProjects = useMemo(() => {
    const projects = [...new Set(timeLogs.map((log) => log.project))]
    return projects.filter(Boolean)
  }, [timeLogs])

  // Filter time logs based on search and filters
  const filteredTimeLogs = useMemo(() => {
    return timeLogs.filter((log) => {
      const matchesSearch =
        searchTerm === "" ||
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.project.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || log.status === statusFilter
      const matchesProject = projectFilter === "all" || log.project === projectFilter

      return matchesSearch && matchesStatus && matchesProject
    })
  }, [timeLogs, searchTerm, statusFilter, projectFilter])

  const handleViewDetails = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog)
    setIsDetailDialogOpen(true)
  }

  // Mock attachments data - in real app, this would come from the API
  const getMockAttachments = (timeLog: TimeLog): Attachment[] => {
    // Generate some mock attachments based on the time log content
    const attachments: Attachment[] = []

    if (timeLog.description.toLowerCase().includes('screenshot') || timeLog.description.toLowerCase().includes('image')) {
      attachments.push({
        id: '1',
        name: 'Screenshot.png',
        type: 'file',
        size: 1024000,
        preview: '/placeholder.jpg'
      })
    }

    if (timeLog.description.toLowerCase().includes('document') || timeLog.description.toLowerCase().includes('pdf')) {
      attachments.push({
        id: '2',
        name: 'Document.pdf',
        type: 'file',
        size: 2048000
      })
    }

    if (timeLog.description.toLowerCase().includes('link') || timeLog.description.toLowerCase().includes('url')) {
      attachments.push({
        id: '3',
        name: 'Project Link',
        type: 'url',
        url: 'https://example.com/project'
      })
    }

    return attachments
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Time Logs</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Time Logs</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/employee/time-logs/demo">
              <Type className="mr-2 h-4 w-4" />
              Demo Features
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/employee/time-logs/new">
              <Plus className="mr-2 h-4 w-4" /> Log Time
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryStats.hoursToday.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  of 8 hours ({Math.round((summaryStats.hoursToday / 8) * 100)}%)
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryStats.hoursWeek.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  of 40 hours ({Math.round((summaryStats.hoursWeek / 40) * 100)}%)
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryStats.hoursMonth.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  of 160 hours ({Math.round((summaryStats.hoursMonth / 160) * 100)}%)
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryStats.billableHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">{Math.round(summaryStats.billableRate)}% billable rate</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
          <CardDescription>Hours logged by project over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeLogsChart />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search logs..."
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
                <span>May 5, 2025 - May 11, 2025</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={new Date(2025, 4)}
                selected={{
                  from: new Date(2025, 4, 5),
                  to: new Date(2025, 4, 11),
                }}
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
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
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
          ) : filteredTimeLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {timeLogs.length === 0
                  ? "No time logs found. Start logging your time!"
                  : "No time logs match your current filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeLogs.map((log) => {
                  const attachments = getMockAttachments(log)
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{log.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {log.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                            {log.description.length > 100 && '...'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.project}</Badge>
                      </TableCell>
                      <TableCell>{formatDurationString(log.duration)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                          }
                        >
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attachments.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{attachments.length}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Time Log Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Time Log Details</DialogTitle>
            <DialogDescription>Detailed view of the time log entry</DialogDescription>
          </DialogHeader>

          {selectedTimeLog && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">{selectedTimeLog.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedTimeLog.project}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      selectedTimeLog.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                    }
                  >
                    {selectedTimeLog.status.charAt(0).toUpperCase() + selectedTimeLog.status.slice(1)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDurationString(selectedTimeLog.duration)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Created on {formatDate(selectedTimeLog.createdAt)}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <RichTextEditor
                  value={selectedTimeLog.description}
                  onChange={() => { }} // Read-only
                  readOnly={true}
                  className="border rounded-md"
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Attachments</h4>
                <FileAttachment
                  attachments={getMockAttachments(selectedTimeLog)}
                  onAttachmentsChange={() => { }} // Read-only
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
