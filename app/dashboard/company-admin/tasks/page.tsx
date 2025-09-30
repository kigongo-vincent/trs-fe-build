"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Search, Calendar, User, Building2, FolderOpen, X, Trash, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskStatusChart } from "@/components/task-status-chart"
import { TasksByDepartmentChart } from "@/components/tasks-by-department-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { fetchTasksSummary, fetchAllTasks, fetchTasksByDepartment, type TasksSummaryData, type Task, deleteTask } from "@/services/tasks"
import { EditTaskForm } from "@/components/edit-task-form"
import { getProjects } from "@/services/projects"
import { getDepartments } from "@/services/departments";
import { getAuthData, getUserRole } from "@/services/auth"
import { toast } from "sonner"
import DOMPurify from 'dompurify'

export default function TasksPage() {
  // All useState hooks
  const [summaryData, setSummaryData] = useState<TasksSummaryData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [tasksByDepartment, setTasksByDepartment] = useState<Array<{ department: string; tasks: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // --- State for search and filters ---
  const [searchTerm, setSearchTerm] = useState("");
  // Remove duration_min and duration_max from filters state
  const [filters, setFilters] = useState({
    department: "all",
    project: "all",
    duration: "all",
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [projectsList, setProjectsList] = useState<{ id: string; name: string; departmentId: string }[]>([]);
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string }[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null);

  // Add state to store file sizes
  const [fileSizes, setFileSizes] = useState<{ [url: string]: number }>({});

  // Helper to fetch file size from URL using HEAD request
  const fetchFileSize = useCallback(async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const size = response.headers.get('Content-Length');
      return size ? parseInt(size, 10) : null;
    } catch {
      return null;
    }
  }, []);

  // Helper to format file size
  function formatFileSize(bytes: number) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Constants and derived variables
  const FILTERS_KEY = "trs-tasks-filters";
  const defaultFilters = {
    searchTerm: "",
    statusFilter: "all",
    departmentFilter: "all",
    projectFilter: "all",
    durationFilter: "all",
  };
  const departments = Array.from(new Set(tasks.map((task) => task.project.department.name)));
  const projects = Array.from(new Set(tasks.map((task) => task.project.name)));
  const isFilterActive =
    filters.department !== "all" ||
    filters.project !== "all" ||
    filters.duration !== "all";

  // Define duration options as objects
  const durationOptions = [
    { label: "All Durations", value: "all", min: undefined, max: undefined },
    { label: "Less than 1 hour", value: "lt1", min: 0, max: 1 },
    { label: "1–2 hours", value: "1to2", min: 1, max: 2 },
    { label: "2–5 hours", value: "2to5", min: 2, max: 5 },
    { label: "5–8 hours", value: "5to8", min: 5, max: 8 },
    { label: "More than 8 hours", value: "gt8", min: 8, max: 20 },
  ];

  // --- Move handlers and helpers to top level ---
  const handleSaveFilters = () => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(defaultFilters));
    toast.success("Filters saved!");
  };

  const handleClearFilters = () => {
    setFilters({ department: "all", project: "all", duration: "all" });
    toast("Filters cleared");
  };

  // --- Handlers for search and filters ---
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTasksLoading(true);
    try {
      const response = await fetchAllTasks({ search: searchTerm });
      setTasks(response.data);
      setFilteredTasks(response.data);
      setFilters({ department: "all", project: "all", duration: "all" }); // Reset filters
    } catch (err) {
      toast.error("Failed to search tasks. Please try again.");
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleApplyFilters = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTasksLoading(true);
    let duration_min, duration_max;
    const selectedDuration = durationOptions.find(opt => opt.value === filters.duration);
    if (selectedDuration && selectedDuration.value !== "all") {
      duration_min = selectedDuration.min !== undefined ? selectedDuration.min * 60 : undefined;
      duration_max = selectedDuration.max !== undefined ? selectedDuration.max * 60 : undefined;
    }
    try {
      const response = await fetchAllTasks({
        departmentId: filters.department !== "all" ? filters.department : undefined,
        projectId: filters.project !== "all" ? filters.project : undefined,
        duration_min,
        duration_max,
      });
      setTasks(response.data);
      setFilteredTasks(response.data);
      setSearchTerm(""); // Reset search
    } catch (err) {
      toast.error("Failed to filter tasks. Please try again.");
    } finally {
      setIsTasksLoading(false);
    }
  };

  const isAnyFilterSet = Object.entries(filters).some(
    ([key, value]) => value !== "all"
  );

  const loadTasksSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTasksSummary();
      setSummaryData(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks summary:", err);
      if (err instanceof Error && err.message.includes("overloaded")) {
        setError("Server is temporarily busy. Please try again in a few moments.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load tasks summary");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllTasks = async () => {
    try {
      setIsTasksLoading(true);
      const response = await fetchAllTasks();
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      if (err instanceof Error && err.message.includes("overloaded")) {
        toast.error("Server is temporarily busy. Please try again in a few moments.");
      } else {
        toast.error("Failed to load tasks. Please try again.");
      }
    } finally {
      setIsTasksLoading(false);
    }
  };

  const loadTasksByDepartment = async () => {
    try {
      const response = await fetchTasksByDepartment();
      setTasksByDepartment(response.data.map((item: any) => ({
        department: item.departmentName,
        tasks: item.totalTasks
      })));
    } catch (err) {
      console.error("Failed to fetch tasks by department:", err);
    }
  };

  const fetchProjectsAndDepartments = async () => {
    try {
      const authData = getAuthData();
      if (!authData?.user?.company?.id) return;
      const companyId = authData.user.company.id;
      const [projectsRes, departmentsRes] = await Promise.all([
        getProjects(companyId),
        getDepartments(companyId),
      ]);
      setProjectsList(projectsRes.data.map((p: any) => ({ id: p.id, name: p.name, departmentId: p.department?.id || "" })));
      setDepartmentsList(departmentsRes.data.map((d: any) => ({ id: d.id, name: d.name })));
    } catch (err) {
      // handle error if needed
    }
  };

  // --- useEffect for initial data loading ---
  useEffect(() => {
    loadTasksSummary();
    loadAllTasks();
    loadTasksByDepartment();
    fetchProjectsAndDepartments(); // replaces fetchProjects
  }, []);

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  // In the useEffect for client-side filtering, remove the duration filter logic
  useEffect(() => {
    let filtered = tasks;
    const { department, project } = filters;
    // Department filter
    if (department !== "all") {
      filtered = filtered.filter((task) => task.project.department.id === department);
    }
    // Project filter
    if (project !== "all") {
      filtered = filtered.filter((task) => task.project.id === project);
    }
    // Only show tasks that are not drafts
    filtered = filtered.filter((task) => task.status.toLowerCase() !== "draft");
    setFilteredTasks(filtered);
  }, [tasks, filters.department, filters.project]);

  // Fetch file sizes for attachments when selectedTask changes
  useEffect(() => {
    if (selectedTask && Array.isArray((selectedTask as any).attachments)) {
      (selectedTask as any).attachments.forEach((attachment: any) => {
        if (attachment.url && fileSizes[attachment.url] === undefined) {
          fetchFileSize(attachment.url).then(size => {
            if (size !== null) {
              setFileSizes(sizes => ({ ...sizes, [attachment.url]: size }));
            }
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTask]);

  // Only now, after all hooks, do the early return
  if (userRole === null) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

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

  // Helper to check if a file is an image
  function isImageAttachment(attachment: any) {
    if (attachment.file && attachment.file.type) {
      return attachment.file.type.startsWith('image/')
    }
    if (attachment.type === 'file' && attachment.url && typeof attachment.url === 'string') {
      // Try to guess from url extension
      return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(attachment.url)
    }
    return false
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Consultant Tasks</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading tasks summary: {error}</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setError(null)
                    setIsLoading(true)
                    loadTasksSummary()
                    loadAllTasks()
                    loadTasksByDepartment()
                    fetchProjectsAndDepartments()
                  }}
                >
                  Retry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
   

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
                <div className="text-xl font-medium text-gradient">{summaryData?.totalTasks || 0}</div>
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
                <div className="text-xl font-medium text-gradient">{summaryData?.activeTasks || 0}</div>
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
                <div className="text-xl font-medium text-gradient">{summaryData?.draftTasks || 0}</div>
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
                <div className="text-xl font-medium text-gradient">{summaryData?.totalHours ? (summaryData.totalHours / 60)?.toFixed(2) : 0}</div>
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
            <CardTitle className="text-xl font-medium">Task Status</CardTitle>
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
            <CardTitle className="text-xl font-medium">Tasks by Department</CardTitle>
            <CardDescription>Distribution of tasks across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <TasksByDepartmentChart data={tasksByDepartment} />
          </CardContent>
        </Card>
      </div>

      <div className="flex bg-paper rounded p-4 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Form */}
        <form
          className="flex w-full  max-w-[20rem] items-center space-x-2"
          onSubmit={handleSearch}
        >
          <Input
            type="text"
            placeholder="Search tasks..."
            className="h-9 "
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3" type="submit">
            <Search className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Search</span>
          </Button>
        </form>
        {/* Filters Form */}
        <form
          className="flex flex-row items-center gap-2 flex-wrap"
          onSubmit={handleApplyFilters}
        >
          <Select value={filters.department} onValueChange={val => setFilters(f => ({ ...f, department: val }))}>
            <SelectTrigger className="h-9 w-[80px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentsList.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.project} onValueChange={val => setFilters(f => ({ ...f, project: val }))}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projectsList.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.duration} onValueChange={val => setFilters(f => ({ ...f, duration: val }))}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="default" size="sm" className="h-9 px-3" type="submit">
            Apply Filters
          </Button>
          <Button variant="outline" size="sm" className="h-9 px-3" type="button" onClick={() => setFilters({ department: "all", project: "all", duration: "all" })}>
            Clear Filters
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium">All Tasks</CardTitle>
          <CardDescription>
            {isTasksLoading ? "Loading tasks..." : `${filteredTasks.length} of ${tasks.filter((task) => task.status.toLowerCase() !== "draft").length} tasks`}
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
                        {userRole !== "Board Member" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => { setEditTask(task); setIsEditModalOpen(true); }}>
                              ✎
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteTaskId(task.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive hover:bg-destructive/10"
                              aria-label="Delete Task"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
                    {/* <Eye className="h-6 w-6" /> */}
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
                    <CardDescription className="flex flex-wrap gap-4 mt-2 text-sm items-center">
                      <span className="flex items-center gap-1"><User className="h-4 w-4" />{(selectedTask as any).user?.fullName || 'No owner'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span>Created: {new Date(selectedTask.createdAt).toLocaleDateString()} <Clock className="inline h-4 w-4 text-muted-foreground ml-1" /> {new Date(selectedTask.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="mx-2">|</span>
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Last Updated: {new Date(selectedTask.updatedAt).toLocaleDateString()} <Clock className="inline h-4 w-4 text-muted-foreground ml-1" /> {new Date(selectedTask.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{Number(selectedTask.duration) >= 60 ? `${Math.floor(Number(selectedTask.duration) / 60)}h ${Number(selectedTask.duration) % 60}m` : `${selectedTask.duration}m`}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="font-semibold mb-1">Description</div>
                      <div className="rounded bg-muted p-3 text-sm min-h-[60px] prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTask.description || 'No description provided') }} />
                    </div>
                    {/* Attachments & URLs */}
                    {(Array.isArray((selectedTask as any).attachments) && (selectedTask as any).attachments.length > 0) && (
                      <div className="mb-4">
                        <div className="font-semibold mb-1 flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" /> Attachments
                        </div>
                        <div className="space-y-2">
                          {(selectedTask as any).attachments.map((attachment: any) => {
                            // Improved image detection: check URL extension regardless of type
                            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(attachment.url || '');
                            const isPDF = /\.pdf$/i.test(attachment.url || '');
                            if (attachment.type === 'url') {
                              return (
                                <Card key={attachment.id || attachment.url || attachment.name} className="p-3">
                                  <CardContent className="p-0">
                                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 underline">
                                      <Eye className="h-4 w-4" />
                                      <span className="truncate max-w-xs">{attachment.name || attachment.url}</span>
                                      {fileSizes[attachment.url] !== undefined && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          {formatFileSize(fileSizes[attachment.url])}
                                        </span>
                                      )}
                                    </a>
                                  </CardContent>
                                </Card>
                              );
                            } else if (isPDF) {
                              // PDF: show details and download button only
                              return (
                                <Card key={attachment.id || attachment.url || attachment.name} className="p-3">
                                  <CardContent className="p-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium truncate max-w-xs">{attachment.name}</span>
                                      {fileSizes[attachment.url] !== undefined && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          {formatFileSize(fileSizes[attachment.url])}
                                        </span>
                                      )}
                                      <a href={attachment.url} download target="_blank" rel="noopener noreferrer" className="ml-2">
                                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 p-0" title="Download PDF">
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </a>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            } else if (isImage) {
                              return (
                                <Card key={attachment.id || attachment.url || attachment.name} className="p-3">
                                  <CardContent className="p-0">
                                    <div className="flex flex-col items-start gap-2">
                                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
                                        <img
                                          src={attachment.url}
                                          alt={attachment.name}
                                          className="rounded-lg max-h-48 object-contain border mb-2"
                                          style={{ background: '#f8fafc' }}
                                        />
                                      </a>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium truncate max-w-xs">{attachment.name}</span>
                                        {fileSizes[attachment.url] !== undefined && (
                                          <span className="text-xs text-muted-foreground ml-2">
                                            {formatFileSize(fileSizes[attachment.url])}
                                          </span>
                                        )}
                                        <a href={attachment.url} download target="_blank" rel="noopener noreferrer" className="ml-2">
                                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 p-0" title="Download image">
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </a>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            } else {
                              // Default: file (not image or pdf)
                              return (
                                <Card key={attachment.id || attachment.url || attachment.name} className="p-3">
                                  <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate max-w-xs">{attachment.name}</span>
                                        {fileSizes[attachment.url] !== undefined && (
                                          <span className="text-xs text-muted-foreground ml-2">
                                            {formatFileSize(fileSizes[attachment.url])}
                                          </span>
                                        )}
                                      </a>
                                      <a href={attachment.url} download target="_blank" rel="noopener noreferrer" className="ml-2">
                                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 p-0" title="Download file">
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </a>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }
                          })}
                        </div>
                      </div>
                    )}
                    {/* URLs (if present and not in attachments) */}
                    {(Array.isArray((selectedTask as any).urls) && (selectedTask as any).urls.length > 0) && (
                      <div className="mb-4">
                        <div className="font-semibold mb-1 flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-500" /> Links
                        </div>
                        <ul className="space-y-1">
                          {(selectedTask as any).urls.map((u: any, idx: number) => (
                            <li key={u.url || idx} className="flex items-center gap-2">
                              <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{u.name || u.url}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
      {isEditModalOpen && editTask && (
        <EditTaskForm
          task={editTask}
          onClose={() => { setIsEditModalOpen(false); setEditTask(null); }}
          onUpdated={async () => {
            setIsEditModalOpen(false)
            setEditTask(null)
            // Refresh tasks
            setIsTasksLoading(true)
            const response = await fetchAllTasks()
            setTasks(response.data)
            setFilteredTasks(response.data)
            setIsTasksLoading(false)
          }}
          projects={projectsList}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
                if (!deleteTaskId) return
                setIsDeleting(true)
                try {
                  await deleteTask(deleteTaskId)
                  toast.success("Task deleted successfully")
                  // Refresh tasks
                  const response = await fetchAllTasks()
                  setTasks(response.data)
                  setFilteredTasks(response.data)
                  // Refresh summary
                  setIsLoading(true)
                  setError(null)
                  try {
                    const summaryRes = await fetchTasksSummary()
                    setSummaryData(summaryRes.data)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to load tasks summary")
                  } finally {
                    setIsLoading(false)
                  }
                  setDeleteDialogOpen(false)
                  setDeleteTaskId(null)
                } catch (err: any) {
                  toast.error(err?.message || "Failed to delete task")
                } finally {
                  setIsDeleting(false)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
