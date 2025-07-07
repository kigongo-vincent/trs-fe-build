"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Clock, Download, Filter, Plus, Search, Paperclip, Eye, Type, Trash, Pencil, Loader2, X, Upload } from "lucide-react"
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
import { useRouter } from "next/navigation"
import { getProjects } from "@/services/projects"
import { getAuthUser } from "@/services/auth"
import { putRequest } from "@/services/api"
import { Label } from "@/components/ui/label"
import TaskDetailModal from "@/components/TaskDetailModal"
import { toast } from "sonner"

export default function TimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTimeLog, setEditTimeLog] = useState<TimeLog | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTimeLogId, setDeleteTimeLogId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [summaryStats, setSummaryStats] = useState(() => {
    // initial value for summaryStats
    return {
      hoursToday: 0,
      hoursWeek: 0,
      hoursMonth: 0,
      billableHours: 0,
      billableRate: 0,
    }
  })
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishLogId, setPublishLogId] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false)
  const [isPublishingAll, setIsPublishingAll] = useState(false)

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

  useEffect(() => {
    const fetchProjectsList = async () => {
      setIsLoadingProjects(true)
      try {
        const user = getAuthUser()
        if (!user?.company?.id) return
        const response = await getProjects(user.company.id)
        setProjects(response.data)
      } catch (e) {
        // handle error
      } finally {
        setIsLoadingProjects(false)
      }
    }
    fetchProjectsList()
  }, [])

  // Calculate summary statistics
  useEffect(() => {
    // recalculate summaryStats when timeLogs change
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

      if (logDate.toDateString() === today.toDateString()) {
        hoursToday += duration
      }
      if (logDate >= startOfWeek) {
        hoursWeek += duration
      }
      if (logDate >= startOfMonth) {
        hoursMonth += duration
      }
      if (log.status === "active") {
        billableHours += duration
      }
    })

    setSummaryStats({
      hoursToday: hoursToday / 60,
      hoursWeek: hoursWeek / 60,
      hoursMonth: hoursMonth / 60,
      billableHours: billableHours / 60,
      billableRate: hoursMonth > 0 ? (billableHours / (hoursMonth * 60)) * 100 : 0,
    })
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

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    duration: "",
    status: "active",
    project: ""
  })
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([])
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  useEffect(() => {
    if (editTimeLog) {
      setEditForm({
        title: editTimeLog.title,
        description: editTimeLog.description,
        duration: editTimeLog.duration,
        status: editTimeLog.status,
        project: editTimeLog.projectId || ""
      })
      setEditAttachments([]) // TODO: Load real attachments if available
    }
  }, [editTimeLog])

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTimeLog) return
    // Validation (same as add form)
    if (!editForm.title.trim()) {
      toast.error("Please enter a task title")
      return
    }
    if (!editForm.description.trim()) {
      toast.error("Please enter a task description")
      return
    }
    if (!editForm.duration || Number(editForm.duration) <= 0) {
      toast.error("Please enter valid time in minutes")
      return
    }
    setIsEditSubmitting(true)
    try {
      // Separate file and url attachments
      const fileAttachments = editAttachments.filter(a => a.type === "file" && a.file) as (Attachment & { file: File })[]
      const urlAttachments = editAttachments.filter(a => a.type === "url" && a.url).map(a => ({ url: a.url!, name: a.name }))
      // Convert files to base64
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const match = result.match(/^data:([^;]+);base64,(.*)$/);
            if (match) {
              const mimetype = match[1];
              const data = match[2];
              resolve(`data:${mimetype};name=${file.name};base64,${data}`);
            } else {
              reject(new Error("Invalid base64 format"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      const attachmentsBase64 = await Promise.all(fileAttachments.map(a => toBase64(a.file)));
      await putRequest(`/consultants/time-logs/${editTimeLog.id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        duration: Number(editForm.duration),
        status: editForm.status,
        project: editForm.project,
        attachments: attachmentsBase64.length > 0 ? attachmentsBase64 : undefined,
        urls: urlAttachments.length > 0 ? urlAttachments : undefined,
      })
      toast.success("Time log updated successfully!")
      setLoading(true)
      const data = await fetchEmployeeTimeLogs()
      setTimeLogs(data)
      setIsEditDialogOpen(false)
      setEditTimeLog(null)
    } catch (err) {
      toast.error((err as Error)?.message || "Failed to update time log")
    } finally {
      setIsEditSubmitting(false)
      setLoading(false)
    }
  }

  // Add publish single draft handler
  const handlePublishDraft = async (logId: string) => {
    setIsPublishing(true)
    try {
      await putRequest(`/consultants/time-logs/${logId}`, { status: 'active' })
      toast.success('Draft published successfully!')
      setLoading(true)
      const data = await fetchEmployeeTimeLogs()
      setTimeLogs(data)
      setPublishDialogOpen(false)
      setPublishLogId(null)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to publish draft')
    } finally {
      setIsPublishing(false)
      setLoading(false)
    }
  }

  // Add publish all drafts handler
  const handlePublishAllDrafts = async () => {
    setIsPublishingAll(true)
    try {
      const draftLogs = timeLogs.filter(log => log.status === 'draft')
      await Promise.all(draftLogs.map(log => putRequest(`/consultants/time-logs/${log.id}`, { status: 'active' })))
      toast.success('All drafts published successfully!')
      setLoading(true)
      const data = await fetchEmployeeTimeLogs()
      setTimeLogs(data)
      setPublishAllDialogOpen(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to publish all drafts')
    } finally {
      setIsPublishingAll(false)
      setLoading(false)
    }
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
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
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
          <CardTitle className="flex items-center justify-between">
            <span>
            Time Logs
            </span>

          {timeLogs.some(log => log.status === 'draft') && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setPublishAllDialogOpen(true)}
              disabled={isPublishingAll || loading}
              className="flex items-center gap-2"
            >
              {isPublishingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Publish All Drafts
            </Button>
          )}
          </CardTitle>
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
                      <TableCell className="text-right flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(log)}
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {log.status === "draft" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditTimeLog(log); setIsEditDialogOpen(true); }}
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => { setDeleteDialogOpen(true); setDeleteTimeLogId(log.id); }}
                              aria-label="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setPublishDialogOpen(true); setPublishLogId(log.id); }}
                              aria-label="Publish"
                              disabled={isPublishing || loading}
                            >
                              {isPublishing && publishLogId === log.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
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
      <TaskDetailModal
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        task={selectedTimeLog}
        attachments={selectedTimeLog ? getMockAttachments(selectedTimeLog) : []}
        urls={[]}
      />

      {/* Edit Time Log Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Time Log</DialogTitle>
            <DialogDescription>Update your time log entry</DialogDescription>
            <Button type="button" variant="ghost" className="absolute top-4 right-4" onClick={() => setIsEditDialogOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Task Title *</Label>
              <Input
                id="editTitle"
                value={editForm.title}
                onChange={e => handleEditInputChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editProject">Project (optional)</Label>
              <Select
                value={editForm.project}
                onValueChange={value => handleEditInputChange("project", value)}
                disabled={isLoadingProjects}
              >
                <SelectTrigger id="editProject">
                  <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading" disabled>
                      Loading projects...
                    </SelectItem>
                  ) : projects.length === 0 ? (
                    <SelectItem value="no-projects" disabled>
                      No projects available
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDuration">Time (minutes) *</Label>
              <div className="flex items-center">
                <Input
                  id="editDuration"
                  type="number"
                  min={1}
                  value={editForm.duration}
                  onChange={e => handleEditInputChange("duration", e.target.value)}
                  required
                />
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {editForm.duration && Number(editForm.duration) > 0 && `${Math.floor(Number(editForm.duration) / 60)}h ${Number(editForm.duration) % 60}m`}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={value => handleEditInputChange("status", value)}
              >
                <SelectTrigger id="editStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Task Description *</Label>
              <RichTextEditor
                value={editForm.description}
                onChange={val => handleEditInputChange("description", val)}
                placeholder="Describe the task you worked on with rich formatting..."
                className="min-h-[200px]"
              />
            </div>
            <FileAttachment
              attachments={editAttachments}
              onAttachmentsChange={setEditAttachments}
              maxFiles={10}
              maxSize={10 * 1024 * 1024}
              acceptedFileTypes={["image/*", "application/pdf"]}
              showUrlInput={true}
            />
            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isEditSubmitting || isLoadingProjects}>
                {isEditSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Time Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time log? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTimeLogId) return
                setIsDeleting(true)
                try {
                  const { deleteRequest } = await import("@/services/api")
                  await deleteRequest(`/consultants/time-logs/${deleteTimeLogId}`)
                  toast.success("Time log deleted successfully")
                  // Refresh time logs
                  const data = await fetchEmployeeTimeLogs()
                  setTimeLogs(data)
                  setDeleteDialogOpen(false)
                  setDeleteTimeLogId(null)
                } catch (err: any) {
                  toast.error(err?.message || "Failed to delete time log")
                } finally {
                  setIsDeleting(false)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Draft Confirmation Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish this draft? This will make the time log active.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => publishLogId && handlePublishDraft(publishLogId)}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish All Drafts Confirmation Dialog */}
      <Dialog open={publishAllDialogOpen} onOpenChange={setPublishAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish All Drafts</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish all draft time logs? This will make all drafts active.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPublishAllDialogOpen(false)}
              disabled={isPublishingAll}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handlePublishAllDrafts}
              disabled={isPublishingAll}
            >
              {isPublishingAll ? 'Publishing...' : 'Publish All'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
