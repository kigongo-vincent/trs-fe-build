"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Edit, FileText, Plus, Search, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectStatusChart } from "@/components/project-status-chart"
import { ProjectTimelineChart } from "@/components/project-timeline-chart"
import { NewProjectDialog } from "@/components/new-project-dialog"
import { DeleteProjectDialog } from "@/components/delete-project-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import Link from "next/link"
import { type Project, type ProjectSummary, getProjects, getProjectsSummary } from "@/services/projects"
import { getAuthData } from "@/services/auth"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)

  // Get unique departments from projects
  const departments = [...new Set(projects.map((project) => project.department.name))]

  const fetchProjectsSummary = async () => {
    try {
      setSummaryLoading(true)

      const authData = getAuthData()
      if (!authData || !authData.user || !authData.user.company || !authData.user.company.id) {
        setError("Authentication data is missing. Please log in again.")
        setSummaryLoading(false)
        return
      }

      const companyId = authData.user.company.id
      const response = await getProjectsSummary(companyId)

      setProjectSummary(response.data)
      setSummaryLoading(false)
    } catch (err) {
      console.error("Error fetching projects summary:", err)
      setError("Failed to load projects summary. Please try again later.")
      setSummaryLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const authData = getAuthData()
      if (!authData || !authData.user || !authData.user.company || !authData.user.company.id) {
        setError("Authentication data is missing. Please log in again.")
        setLoading(false)
        return
      }

      const companyId = authData.user.company.id
      const response = await getProjects(companyId)

      setProjects(response.data)
      setFilteredProjects(response.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError("Failed to load projects. Please try again later.")
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch both summary and projects data in parallel
    Promise.all([fetchProjectsSummary(), fetchProjects()])
  }, [])

  useEffect(() => {
    // Apply filters
    let result = [...projects]

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== "all") {
      result = result.filter((project) => project.department.name === departmentFilter)
    }

    setFilteredProjects(result)
  }, [searchQuery, statusFilter, departmentFilter, projects])

  const handleNewProject = () => {
    setShowNewProjectDialog(true)
  }

  const handleProjectCreated = () => {
    // Refresh both the projects list and summary, and trigger chart refresh
    Promise.all([fetchProjectsSummary(), fetchProjects()])
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteModalOpen(true)
  }

  const handleDeleteSuccess = () => {
    // Refresh both the projects list and summary, and trigger chart refresh
    Promise.all([fetchProjectsSummary(), fetchProjects()])
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEditClick = (project: Project) => {
    setProjectToEdit(project)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    // Refresh both the projects list and summary, and trigger chart refresh
    Promise.all([fetchProjectsSummary(), fetchProjects()])
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
      case "on-hold":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
      case "planning":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleNewProject}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{projectSummary?.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">All company projects</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{projectSummary?.activeProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {projectSummary && projectSummary.totalProjects > 0
                    ? `${Math.round((projectSummary.activeProjects / projectSummary.totalProjects) * 100)}% of total projects`
                    : "No projects"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{projectSummary?.completedProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {projectSummary && projectSummary.totalProjects > 0
                    ? `${Math.round((projectSummary.completedProjects / projectSummary.totalProjects) * 100)}% of total projects`
                    : "No projects"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{projectSummary?.onHoldProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {projectSummary && projectSummary.totalProjects > 0
                    ? `${Math.round((projectSummary.onHoldProjects / projectSummary.totalProjects) * 100)}% of total projects`
                    : "No projects"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of projects by status</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ProjectStatusChart
                totalProjects={projectSummary?.totalProjects || 0}
                activeProjects={projectSummary?.activeProjects || 0}
                completedProjects={projectSummary?.completedProjects || 0}
                onHoldProjects={projectSummary?.onHoldProjects || 0}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Projects by completion percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectTimelineChart refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search projects..."
            className="h-9"
            value={searchQuery}
            onChange={handleSearch}
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Manage your company projects</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No projects found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.department.name}</TableCell>
                    <TableCell>{project.lead.fullName}</TableCell>
                    <TableCell>{formatDate(project.deadline)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(project.status)}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(project)}
                        >
                          <Trash className="h-4 w-4" />
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

      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
        onSuccess={handleProjectCreated}
      />

      <DeleteProjectDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleteSuccess={handleDeleteSuccess}
        project={projectToDelete}
      />

      <EditProjectDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handleEditSuccess}
        project={projectToEdit}
      />
    </div>
  )
}
