"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Search, Calendar, User, Building2, FolderOpen, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskStatusChart } from "@/components/task-status-chart"
import { TasksByDepartmentChart } from "@/components/tasks-by-department-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { fetchTasksSummary, fetchAllTasks, type TasksSummaryData, type Task } from "@/services/tasks"

export default function TasksPage() {
  const [summaryData, setSummaryData] = useState<TasksSummaryData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [durationFilter, setDurationFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Get unique departments and projects for filters
  const departments = Array.from(new Set(tasks.map((task) => task.project.department.name)))
  const projects = Array.from(new Set(tasks.map((task) => task.project.name)))

  useEffect(() => {
    async function loadTasksSummary() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetchTasksSummary()
        setSummaryData(response.data)
      } catch (err) {
        console.error("Failed to fetch tasks summary:", err)
        setError(err instanceof Error ? err.message : "Failed to load tasks summary")
      } finally {
        setIsLoading(false)
      }
    }

    async function loadAllTasks() {
      try {
        setIsTasksLoading(true)
        const response = await fetchAllTasks()
        setTasks(response.data)
        setFilteredTasks(response.data)
      } catch (err) {
        console.error("Failed to fetch tasks:", err)
      } finally {
        setIsTasksLoading(false)
      }
    }

    loadTasksSummary()
    loadAllTasks()
  }, [])

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.project.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((task) => task.project.department.name === departmentFilter)
    }

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter((task) => task.project.name === projectFilter)
    }

    // Duration filter
    if (durationFilter !== "all") {
      filtered = filtered.filter((task) => {
        const minutes = Number.parseFloat(task.duration)
        switch (durationFilter) {
          case "lt1":
            return minutes < 60
          case "1to2":
            return minutes >= 60 && minutes <= 120
          case "2to5":
            return minutes >= 120 && minutes <= 300
          case "5to8":
            return minutes >= 300 && minutes <= 480
          case "gt8":
            return minutes > 480
          default:
            return true
        }
      })
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, departmentFilter, projectFilter, durationFilter])

  const formatDuration = (duration: string) => {
    const minutes = Number.parseFloat(duration)
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
          >
            Active
          </Badge>
        )
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
          >
            Draft
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Consultant Tasks</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading tasks summary: {error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Consultant Tasks</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryData?.totalTasks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData?.totalTasks === 1 ? "task" : "tasks"} in total
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryData?.activeTasks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData && summaryData.totalTasks > 0
                    ? `${Math.round(((summaryData.activeTasks || 0) / summaryData.totalTasks) * 100)}% of total tasks`
                    : "No tasks yet"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryData?.draftTasks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData && summaryData.totalTasks > 0
                    ? `${Math.round(((summaryData.draftTasks || 0) / summaryData.totalTasks) * 100)}% of total tasks`
                    : "No draft tasks"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summaryData?.totalHours || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData?.totalHours === 1 ? "hour" : "hours"} logged
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Distribution of tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="space-y-2 text-center">
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              </div>
            ) : (
              <TaskStatusChart activeTasks={summaryData?.activeTasks || 0} draftTasks={summaryData?.draftTasks || 0} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Department</CardTitle>
            <CardDescription>Distribution of tasks across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <TasksByDepartmentChart />
          </CardContent>
        </Card>
      </div>

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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="lt1">Less than 1 hour</SelectItem>
              <SelectItem value="1to2">1–2 hours</SelectItem>
              <SelectItem value="2to5">2–5 hours</SelectItem>
              <SelectItem value="5to8">5–8 hours</SelectItem>
              <SelectItem value="gt8">More than 8 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            {isTasksLoading ? "Loading tasks..." : `${filteredTasks.length} of ${tasks.length} tasks`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTasksLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {tasks.length === 0 ? "No tasks found." : "No tasks match your current filters."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{task.project.name}</TableCell>
                    <TableCell>{task.project.department.name}</TableCell>
                    <TableCell>{(task as any).user?.fullName || "No name"}</TableCell>
                    <TableCell>{formatDuration(task.duration)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewTask(task)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      {selectedTask && isTaskModalOpen && (
        <Dialog open={true} onOpenChange={open => { if (!open) setIsTaskModalOpen(false) }}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"></div>
            {/* Fullscreen Modal Content */}
            <div
              className="relative w-screen h-screen bg-background flex flex-col overflow-y-auto !rounded-none border-0 shadow-2xl"
              style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-background border-b px-8 py-4">
                <DialogHeader className="flex flex-row items-center gap-4 w-full">
                  <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Eye className="h-6 w-6" />
                    {selectedTask?.title || "Task Details"}
                  </DialogTitle>
                </DialogHeader>
                <button
                  onClick={() => setIsTaskModalOpen(false)}
                  className="ml-auto rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              {/* Main Content - all info in one section */}
              <div className="flex-1 py-8 md:py-12 px-8 overflow-y-auto h-full flex flex-col gap-6">
                {/* Header and Meta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {selectedTask.title}
                      {(() => {
                        switch (selectedTask.status.toLowerCase()) {
                          case 'active':
                            return <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'>Active</Badge>;
                          case 'draft':
                            return <Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800'>Draft</Badge>;
                          default:
                            return <Badge variant='outline'>{selectedTask.status}</Badge>;
                        }
                      })()}
                      <Badge variant="secondary">{selectedTask.project.name}</Badge>
                    </CardTitle>
                    <CardDescription className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1"><User className="h-4 w-4" />{(selectedTask as any).user?.fullName || 'No owner'}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Created {new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{Number(selectedTask.duration) >= 60 ? `${Math.floor(Number(selectedTask.duration) / 60)}h ${Number(selectedTask.duration) % 60}m` : `${selectedTask.duration}m`}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="font-semibold mb-1">Description</div>
                      <div className="rounded bg-muted p-3 text-sm min-h-[60px]">
                        {selectedTask.description || 'No description provided'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Project Info, Department Info, Timeline in one row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Project Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-muted-foreground" />{selectedTask.project.name}<Badge variant="outline" className="capitalize ml-2">{selectedTask.project.status}</Badge></CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-medium">Progress:</span>
                        <div className="flex-1 max-w-xs">
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${selectedTask.project.progress}%` }} />
                          </div>
                        </div>
                        <span className="ml-2 text-sm font-semibold">{selectedTask.project.progress}%</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Deadline:</span> {new Date(selectedTask.project.deadline).toLocaleDateString()}</div>
                    </CardContent>
                  </Card>
                  {/* Department Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-muted-foreground" />{selectedTask.project.department.name}<Badge variant="outline" className="capitalize ml-2">{selectedTask.project.department.status}</Badge></CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Head:</span> {selectedTask.project.department.head}</div>
                      <div className="rounded bg-muted p-3 text-sm"><span className="font-semibold">Description:</span> {selectedTask.project.department.description || 'No description'}</div>
                    </CardContent>
                  </Card>
                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-muted-foreground" />Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2"><div className="h-3 w-3 rounded-full bg-green-500" /><span className="font-medium">Created:</span> {new Date(selectedTask.createdAt).toLocaleString()}</div>
                      <div className="flex items-center gap-2 mb-2"><div className="h-3 w-3 rounded-full bg-blue-500" /><span className="font-medium">Last Updated:</span> {new Date(selectedTask.updatedAt).toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
