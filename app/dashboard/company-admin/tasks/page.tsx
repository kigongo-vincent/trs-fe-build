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

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, departmentFilter, projectFilter])

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
                  {summaryData?.totalTasks > 0
                    ? `${Math.round(((summaryData?.activeTasks || 0) / summaryData.totalTasks) * 100)}% of total tasks`
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
                  {summaryData?.totalTasks > 0
                    ? `${Math.round(((summaryData?.draftTasks || 0) / summaryData.totalTasks) * 100)}% of total tasks`
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
                    <TableCell>{task.user?.fullName || "No name"}</TableCell>
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
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Task Details</DialogTitle>
              <Button variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {selectedTask ? `Viewing details for task: ${selectedTask.title}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{selectedTask.project.name}</Badge>
                      <Badge variant="outline">{selectedTask.project.department.name}</Badge>
                      {getStatusBadge(selectedTask.status)}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Created Date</span>
                      </div>
                      <p className="text-sm font-medium">{formatFullDate(selectedTask.createdAt)}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Duration</span>
                      </div>
                      <p className="text-sm font-medium">{formatDuration(selectedTask.duration)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Task Owner</span>
                    </div>
                    <p className="text-sm font-medium">{selectedTask.user?.fullName || "No name"}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 text-sm font-medium">Description</h4>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      {selectedTask.description || "No description provided"}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Created: {formatDateTime(selectedTask.createdAt)}</span>
                      </div>
                      {selectedTask.updatedAt !== selectedTask.createdAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>Last Updated: {formatDateTime(selectedTask.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">{selectedTask.project.name}</h3>
                        <p className="text-sm text-muted-foreground">Project</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Project Status</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {selectedTask.project.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Progress</span>
                      </div>
                      <p className="text-sm font-medium">{selectedTask.project.progress}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Project Deadline</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(selectedTask.project.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{selectedTask.project.department.name}</h4>
                        <p className="text-sm text-muted-foreground">Department</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Department Head</span>
                    </div>
                    <p className="text-sm font-medium">{selectedTask.project.department.head}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Department Status</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {selectedTask.project.department.status}
                    </Badge>
                  </div>

                  {selectedTask.project.department.description && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Department Description</h4>
                        <div className="rounded-md bg-muted p-3 text-sm">
                          {selectedTask.project.department.description}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{formatDuration(selectedTask.duration)}</p>
                  <p className="text-sm text-muted-foreground">Time Logged</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-lg font-semibold">{selectedTask.project.name}</p>
                  <p className="text-sm text-muted-foreground">Project</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-lg font-semibold">{selectedTask.project.department.name}</p>
                  <p className="text-sm text-muted-foreground">Department</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
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
