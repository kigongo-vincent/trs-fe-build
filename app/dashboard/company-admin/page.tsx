"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Clock, FileText, Layers, Plus, Users } from "lucide-react"
import Link from "next/link"
import { HoursByProjectChart } from "@/components/hours-by-project-chart"
import { TaskDistributionChart } from "@/components/task-distribution-chart"
import { useEffect, useState } from "react"
import { getCompanySummary } from "@/services/api"
import { getAuthData, getUserRole, isAuthenticated, isTokenExpired } from "@/services/auth"
import { fetchTasksSummary, fetchTasksByDepartment, type TasksSummaryData, type TasksByDepartmentData, fetchAllTasks, type Task } from "@/services/tasks"
import { useRouter } from "next/navigation"

interface CompanySummaryData {
  departments: number
  projects: number
  consultants: number
  totalMinutes: number
}

interface CompanySummaryResponse {
  status: number
  message: string
  data: CompanySummaryData
}

export default function CompanyAdminDashboard() {
  const [summaryData, setSummaryData] = useState<CompanySummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasksSummary, setTasksSummary] = useState<TasksSummaryData | null>(null)
  const [tasksByDepartment, setTasksByDepartment] = useState<TasksByDepartmentData[] | null>(null)
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const router = useRouter()

  useEffect(() => {
    // No authentication or role check, always allow access
  }, [router])

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const authData = getAuthData()
        if (!authData?.user?.company?.id) {
          throw new Error("Company ID not found")
        }

        const response: CompanySummaryResponse = await getCompanySummary(authData.user.company.id)
        setSummaryData(response.data)
      } catch (err) {
        console.error("Failed to fetch company summary:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch company summary")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchTasksOverview = async () => {
      try {
        setIsTasksLoading(true)
        setTasksError(null)
        const summaryRes = await fetchTasksSummary()
        setTasksSummary(summaryRes.data)
        const deptRes = await fetchTasksByDepartment()
        setTasksByDepartment(deptRes.data)
      } catch (err) {
        setTasksError(err instanceof Error ? err.message : "Failed to fetch tasks overview")
      } finally {
        setIsTasksLoading(false)
      }
    }

    const fetchAll = async () => {
      try {
        const res = await fetchAllTasks()
        setAllTasks(res.data)
      } catch { }
    }

    fetchSummaryData()
    fetchTasksOverview()
    fetchAll()
  }, [])

  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours === 0) {
      return `${remainingMinutes}m`
    } else if (remainingMinutes === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${remainingMinutes}m`
    }
  }

  const statusCounts = {
    inProgress: allTasks.filter(t => t.status === "in_progress").length,
    pending: allTasks.filter(t => t.status === "pending").length,
    completed: allTasks.filter(t => t.status === "completed").length,
    overdue: allTasks.filter(t => t.status === "overdue").length,
  }
  const total = allTasks.length

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Company Admin Dashboard</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">Failed to load dashboard data</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Company Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* <Button asChild>
            <Link href="/dashboard/company-admin/projects/new">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button> */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">{summaryData?.departments || 0}</div>
                <p className="text-xs text-muted-foreground">Active departments</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">{summaryData?.projects || 0}</div>
                <p className="text-xs text-muted-foreground">Total projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">{summaryData?.consultants || 0}</div>
                <p className="text-xs text-muted-foreground">Active consultants</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">
                  {summaryData ? formatHours(summaryData.totalMinutes) : "0h"}
                </div>
                <p className="text-xs text-muted-foreground">Total logged time</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Hours by Project</CardTitle>
                <CardDescription>Distribution of logged hours across projects</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <HoursByProjectChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Hours by Project</CardTitle>
                <CardDescription>Hours tracked per project</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskDistributionChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          {isTasksLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : tasksError ? (
            <Card>
              <CardContent className="py-8 flex flex-col items-center">
                <p className="mb-4 text-muted-foreground">Failed to load tasks overview</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Task Status</CardTitle>
                <CardDescription>Overview of all tasks by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {statusCounts.inProgress} ({total ? Math.round((statusCounts.inProgress / total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {statusCounts.pending} ({total ? Math.round((statusCounts.pending / total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {statusCounts.completed} ({total ? Math.round((statusCounts.completed / total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">Overdue</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {statusCounts.overdue} ({total ? Math.round((statusCounts.overdue / total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/company-admin/tasks">
                      View All Tasks
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Recently generated invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">April 2025</p>
                      <p className="text-xs text-muted-foreground">Total: $12,450</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">March 2025</p>
                      <p className="text-xs text-muted-foreground">Total: $11,280</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">February 2025</p>
                      <p className="text-xs text-muted-foreground">Total: $10,850</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/company-admin/invoices">
                    View All Invoices
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
