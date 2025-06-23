"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Download, Calendar, User, Building2, FolderOpen } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import type { Task } from "@/services/tasks"

export default function TaskViewPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get task data from sessionStorage
    const taskData = sessionStorage.getItem("currentTask")
    if (taskData) {
      const parsedTask = JSON.parse(taskData) as Task
      // Verify this is the correct task
      if (parsedTask.id === params.id) {
        setTask(parsedTask)
      }
    }
    setIsLoading(false)
  }, [params.id])

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/company-admin/tasks">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Loading Task Details...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/company-admin/tasks">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Task Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>The requested task could not be found.</p>
              <Button variant="outline" asChild className="mt-4">
                <Link href="/dashboard/company-admin/tasks">Back to Tasks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/company-admin/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Task Details</h1>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
            <CardDescription>Details about the logged task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{task.project.name}</Badge>
                <Badge variant="outline">{task.project.department.name}</Badge>
                {getStatusBadge(task.status)}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created Date</span>
                </div>
                <p className="text-sm font-medium">{formatDate(task.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration</span>
                </div>
                <p className="text-sm font-medium">{formatDuration(task.duration)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-medium">Description</h4>
              <div className="rounded-md bg-muted p-3 text-sm">{task.description || "No description provided"}</div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Created: {formatDateTime(task.createdAt)}</span>
                </div>
                {task.updatedAt !== task.createdAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Last Updated: {formatDateTime(task.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project & Department Information</CardTitle>
            <CardDescription>Details about the associated project and department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">{task.project.name}</h3>
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
                  {task.project.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Progress</span>
                </div>
                <p className="text-sm font-medium">{task.project.progress}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Project Deadline</span>
              </div>
              <p className="text-sm font-medium">
                {new Date(task.project.deadline).toLocaleDateString("en-US", {
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
                  <h4 className="font-semibold">{task.project.department.name}</h4>
                  <p className="text-sm text-muted-foreground">Department</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Department Head</span>
              </div>
              <p className="text-sm font-medium">{task.project.department.head}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Department Status</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {task.project.department.status}
              </Badge>
            </div>

            {task.project.department.description && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-medium">Department Description</h4>
                  <div className="rounded-md bg-muted p-3 text-sm">{task.project.department.description}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Summary</CardTitle>
          <CardDescription>Quick overview of task details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{formatDuration(task.duration)}</p>
              <p className="text-sm text-muted-foreground">Time Logged</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-semibold">{task.project.name}</p>
              <p className="text-sm text-muted-foreground">Project</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-semibold">{task.project.department.name}</p>
              <p className="text-sm text-muted-foreground">Department</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
