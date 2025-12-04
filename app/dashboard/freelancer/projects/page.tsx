"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Clock,
    DollarSign,
    Loader2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MotionBlock } from "@/components/MotionBlock"
import { FreelancerProjectStatusChart } from "@/components/freelancer-charts"
import { ProjectTimelineChart } from "@/components/project-timeline-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
    createFreelancerProject,
    deleteFreelancerProject,
    getFreelancerProjectStatusDistribution,
    getFreelancerProjectTimelines,
    getFreelancerProjects,
    getFreelancerProjectsSummary,
    updateFreelancerProject,
    type FreelancerProjectListItem,
    type FreelancerProjectSummary,
    type FreelancerProjectStatusDistribution,
    type FreelancerProjectTimelineEntry,
    type PaginationMeta
} from "@/services/api"

type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled' | 'inactive'

interface Project {
    id: string
    name: string
    description: string
    companyId: string
    companyName: string
    hourlyRate: number
    status: ProjectStatus
    startDate: string
    endDate?: string
    totalHours: number
    totalEarnings: number
    createdAt: string
    fixedTotalAmount?: number
}

interface Company {
    id: string
    name: string
}

const PROJECT_FORM_DEFAULTS = {
    name: "",
    description: "",
    companyId: "",
    hourlyRate: "",
    fixedTotalAmount: "",
    status: "active",
    startDate: "",
    endDate: ""
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [companies, setCompanies] = useState<Company[]>([])
    const [summary, setSummary] = useState<FreelancerProjectSummary | null>(null)
    const [statusDistribution, setStatusDistribution] = useState<FreelancerProjectStatusDistribution | null>(null)
    const [timelineData, setTimelineData] = useState<FreelancerProjectTimelineEntry[]>([])
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)
    const [overviewLoading, setOverviewLoading] = useState(true)
    const [tableLoading, setTableLoading] = useState(true)
    const [globalError, setGlobalError] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const [formData, setFormData] = useState(() => ({ ...PROJECT_FORM_DEFAULTS }))

    const resetFormState = useCallback(() => {
        setFormData({ ...PROJECT_FORM_DEFAULTS })
        setFormError(null)
        setEditingProject(null)
    }, [])

    // Ensure formData is always initialized
    const safeFormData = formData || { ...PROJECT_FORM_DEFAULTS }

    const fetchOverview = useCallback(async () => {
        try {
            setGlobalError(null)
            setOverviewLoading(true)
            const [summaryResponse, statusResponse, timelineResponse] = await Promise.all([
                getFreelancerProjectsSummary(),
                getFreelancerProjectStatusDistribution(),
                getFreelancerProjectTimelines()
            ])
            setSummary(summaryResponse?.data ?? null)
            setStatusDistribution(statusResponse?.data ?? null)
            setTimelineData(Array.isArray(timelineResponse?.data) ? timelineResponse.data : [])
        } catch (error) {
            setGlobalError(extractErrorMessage(error))
            // Set defaults on error to prevent crashes
            setSummary(null)
            setStatusDistribution(null)
            setTimelineData([])
        } finally {
            setOverviewLoading(false)
        }
    }, [])

    const loadProjects = useCallback(async (pageParam: number, limitParam: number, searchValue: string) => {
        try {
            setGlobalError(null)
            setTableLoading(true)
            const response = await getFreelancerProjects({
                page: pageParam,
                limit: limitParam,
                search: searchValue.trim() ? searchValue.trim() : undefined
            })

            const items = response?.data?.items ?? []
            const mappedProjects = Array.isArray(items)
                ? items
                    .map(item => {
                        try {
                            return mapProjectFromApi(item)
                        } catch (error) {
                            console.warn("Failed to map project item:", error, item)
                            return null
                        }
                    })
                    .filter((project): project is Project => project !== null)
                : []
            setProjects(mappedProjects)
            setPaginationMeta(response?.data?.pagination ?? null)
            const newCompanies = extractCompaniesFromProjects(items)
            if (newCompanies.length > 0) {
                setCompanies(prev => mergeCompanyLists(prev, newCompanies))
            }

            const pagination = response?.data?.pagination
            if (pagination) {
                const nextPage = pagination.page ?? pageParam
                const nextLimit = pagination.limit ?? limitParam

                setCurrentPage(prev => (prev === nextPage ? prev : nextPage))
                setItemsPerPage(prev => (prev === nextLimit ? prev : nextLimit))
            }
        } catch (error) {
            setGlobalError(extractErrorMessage(error))
            setProjects([])
            setPaginationMeta(null)
        } finally {
            setTableLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOverview()
    }, [fetchOverview])

    useEffect(() => {
        loadProjects(currentPage, itemsPerPage, searchTerm)
    }, [currentPage, itemsPerPage, searchTerm, loadProjects])

    useEffect(() => {
        if (!isAddDialogOpen) {
            resetFormState()
        }
    }, [isAddDialogOpen, resetFormState])

    const totalProjects = paginationMeta?.total ?? summary?.totalProjects ?? projects.length ?? 0
    const totalPages = paginationMeta?.totalPages ?? 1
    const pageStart = paginationMeta && paginationMeta.page && paginationMeta.limit
        ? (paginationMeta.page - 1) * paginationMeta.limit + 1
        : (projects.length ? 1 : 0)
    const pageEnd = paginationMeta && paginationMeta.page && paginationMeta.limit && paginationMeta.total
        ? Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total)
        : projects.length
    const showInitialSkeleton = overviewLoading || (tableLoading && projects.length === 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        const currentFormData = formData || { ...PROJECT_FORM_DEFAULTS }

        if (!currentFormData.companyId) {
            setFormError("Please select a company for this project.")
            return
        }

        const hourlyRateValue = parseFloat(currentFormData.hourlyRate || "0")
        const fixedAmountValue = currentFormData.fixedTotalAmount ? parseFloat(currentFormData.fixedTotalAmount) : undefined

        if (Number.isNaN(hourlyRateValue) || hourlyRateValue <= 0) {
            setFormError("Hourly rate must be a valid positive number.")
            return
        }

        if (fixedAmountValue !== undefined && (Number.isNaN(fixedAmountValue) || fixedAmountValue < 0)) {
            setFormError("Fixed total amount must be a valid positive number.")
            return
        }

        if (!currentFormData.startDate) {
            setFormError("Start date is required.")
            return
        }

        const payload = {
            projectName: (currentFormData.name || "").trim(),
            freelancerCompanyId: currentFormData.companyId,
            description: (currentFormData.description || "").trim(),
            status: currentFormData.status || "active",
            startDate: currentFormData.startDate,
            endDate: currentFormData.endDate || null,
            hourlyRate: hourlyRateValue,
            fixedTotalAmount: fixedAmountValue
        }

        setIsSubmitting(true)

        try {
            let response
            if (editingProject) {
                response = await updateFreelancerProject(editingProject.id, payload)
            } else {
                response = await createFreelancerProject(payload)
            }

            // Validate response structure
            if (!response || !response.data) {
                throw new Error("Invalid response from server. Please try again.")
            }

            const nextPage = editingProject ? currentPage : 1

            const shouldManuallyReload = editingProject || currentPage === nextPage

            if (!editingProject && currentPage !== nextPage) {
                setCurrentPage(nextPage)
            }

            // Reload data with error handling
            const reloadPromise = shouldManuallyReload
                ? loadProjects(nextPage, itemsPerPage, searchTerm).catch(err => {
                    console.error("Error reloading projects:", err)
                    // Don't throw - we still want to close the dialog
                })
                : Promise.resolve()

            const overviewPromise = fetchOverview().catch(err => {
                console.error("Error fetching overview:", err)
                // Don't throw - we still want to close the dialog
            })

            await Promise.all([
                reloadPromise,
                overviewPromise
            ])

            resetFormState()
            setIsAddDialogOpen(false)
        } catch (error) {
            console.error("Error creating/updating project:", error)
            setFormError(extractErrorMessage(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (project: Project) => {
        // Editing is temporarily disabled for freelancer projects.
        // This handler is kept for future use but intentionally does nothing.
        return
    }

    const handleDelete = async (projectId: string) => {
        // Deleting is temporarily disabled for freelancer projects.
        // This handler is kept for future use but intentionally does nothing.
        return
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        setSearchTerm(searchInput)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'completed':
                return 'bg-blue-100 text-blue-800'
            case 'on-hold':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'inactive':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }


    if (showInitialSkeleton) {
        return (
            <div className="flex flex-col gap-4">
                {/* Header Skeleton */}
                <MotionBlock delay={0}>
                    <div className="bg-paper p-8 rounded-lg">
                        <div className="flex md:h-[5vh] h-max items-center justify-between">
                            <div className="">
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </MotionBlock>

                {/* Summary Cards Skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[300px] w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-10 w-48" />
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-auto max-w-[90vw]">
                        <div className="space-y-4">
                            {/* Table Header Skeleton */}
                            <div className="flex space-x-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            {/* Table Rows Skeleton */}
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex space-x-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <MotionBlock delay={0}>
                <div className="bg-paper p-4 sm:p-6 md:p-8 rounded-lg">
                    <div className="flex flex-col sm:flex-row md:h-[5vh] h-max items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="">
                            <h1 className="text-base sm:text-lg tracking-tight">
                                <span className="font-semibold">Projects</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">Manage your projects and hourly rates</p>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">New Project</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-base sm:text-lg">
                                        {editingProject ? "Edit Project" : "Create New Project"}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Project Name</Label>
                                            <Input
                                                id="name"
                                                value={safeFormData.name || ""}
                                                onChange={(e) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), name: e.target.value }))}
                                                placeholder="Enter project name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyId">Company</Label>
                                            <Select value={safeFormData.companyId || ""} onValueChange={(value) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), companyId: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select company" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {!Array.isArray(companies) || companies.length === 0 ? (
                                                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                            {tableLoading ? "Loading companies..." : "No companies available"}
                                                        </div>
                                                    ) : (
                                                        companies
                                                            .filter(company => company && company.id && company.name)
                                                            .map((company) => (
                                                                <SelectItem key={company.id} value={company.id}>
                                                                    {company.name}
                                                                </SelectItem>
                                                            ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={safeFormData.description || ""}
                                            onChange={(e) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), description: e.target.value }))}
                                            placeholder="Enter project description"
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hourlyRate">Hourly Rate</Label>
                                            <Input
                                                id="hourlyRate"
                                                type="number"
                                                step="0.01"
                                                value={safeFormData.hourlyRate || ""}
                                                onChange={(e) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), hourlyRate: e.target.value }))}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fixedTotalAmount">Fixed Project Amount (Optional)</Label>
                                            <Input
                                                id="fixedTotalAmount"
                                                type="number"
                                                step="0.01"
                                                value={safeFormData.fixedTotalAmount || ""}
                                                onChange={(e) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), fixedTotalAmount: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="endDate">End Date (Optional)</Label>
                                                <Input
                                                    id="endDate"
                                                    type="date"
                                                    value={safeFormData.endDate || ""}
                                                    onChange={(e) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), endDate: e.target.value }))}
                                                />
                                            </div>


                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={safeFormData.startDate || ""}
                                                onChange={(e) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), startDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={safeFormData.status || "active"} onValueChange={(value) => setFormData(prev => ({ ...(prev || PROJECT_FORM_DEFAULTS), status: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="on-hold">On Hold</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formError && (
                                        <p className="text-sm text-red-600">{formError}</p>
                                    )}

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {editingProject ? "Update Project" : "Create Project"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </MotionBlock>

            {globalError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {globalError}
                </div>
            )}


            {/* Summary Cards Row */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Projects</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">{summary?.totalProjects ?? projects.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {statusDistribution?.active ?? 0} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            {summary && Number.isFinite(summary.totalHours) ? `${summary.totalHours}h` : '0h'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all projects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            ${summary && Number.isFinite(summary.totalEarnings) ? summary.totalEarnings.toLocaleString() : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From all projects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Avg Hourly Rate</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            ${summary && Number.isFinite(summary.avgHourlyRate) ? Math.round(summary.avgHourlyRate) : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average rate per hour
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Status Distribution</CardTitle>
                        <CardDescription>Projects by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FreelancerProjectStatusChart data={statusDistribution} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Timeline</CardTitle>
                        <CardDescription>Projects by completion percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProjectTimelineChart timelines={timelineData} />
                    </CardContent>
                </Card>
            </div>

            {/* Table Row */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div>
                            <CardTitle className="flex items-center text-lg sm:text-xl text-primary">
                                <span className="text-gradient">Projects</span>
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Showing {totalProjects} projects
                            </CardDescription>
                        </div>
                        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search projects..."
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value)
                                }}
                                className="pl-10 w-full"
                            />
                        </form>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto max-w-full">
                    {tableLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No projects found. Get started by creating your first project.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Hours</TableHead>
                                    <TableHead>Earnings</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                        <TableCell>{project.companyName}</TableCell>
                                        <TableCell>{Number.isFinite(project.hourlyRate) ? `${project.hourlyRate}/hr` : '0/hr'}</TableCell>
                                        <TableCell>{Number.isFinite(project.totalHours) ? `${project.totalHours}h` : '0h'}</TableCell>
                                        <TableCell>{Number.isFinite(project.totalEarnings) ? project.totalEarnings.toLocaleString() : '0'}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(project.status)}>
                                                <span className="capitalize">{project.status.replace('-', ' ')}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">
                                            Actions temporarily disabled
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>

                {/* Pagination Controls */}
                {projects.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-4 border-t">
                        <div className="flex items-center space-x-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Showing {pageStart} to {pageEnd} of {totalProjects} projects
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-2 w-full sm:w-auto">
                            <div className="flex items-center space-x-2">
                                <p className="text-xs sm:text-sm text-muted-foreground">Rows per page:</p>
                                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                                    setItemsPerPage(Number(value))
                                    setCurrentPage(1)
                                }}>
                                    <SelectTrigger className="w-20 h-8 sm:h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center space-x-1 px-2">
                                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>


            {projects.length === 0 && !tableLoading && (
                <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first project"}
                    </p>
                    {!searchTerm && (
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Project
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message
    }
    return "An unexpected error occurred. Please try again."
}

function mapProjectFromApi(item: FreelancerProjectListItem): Project {
    if (!item || !item.id) {
        throw new Error("Invalid project item: missing required fields")
    }
    return {
        id: item.id,
        name: item.projectName ?? "Unnamed Project",
        description: item.description ?? "",
        companyId: item.company?.id ?? "",
        companyName: item.company?.companyName ?? "Unknown company",
        hourlyRate: item.hourlyRate ?? 0,
        status: normalizeStatus(item.status),
        startDate: item.startDate ?? "",
        endDate: item.endDate ?? "",
        totalHours: item.totalHours ?? 0,
        totalEarnings: item.earnings ?? item.fixedTotalAmount ?? 0,
        createdAt: item.createdAt ?? "",
        fixedTotalAmount: item.fixedTotalAmount
    }
}

function normalizeStatus(status?: string): ProjectStatus {
    const normalized = (status || "").toLowerCase() as ProjectStatus
    const allowed: ProjectStatus[] = ['active', 'completed', 'on-hold', 'cancelled', 'inactive']
    return allowed.includes(normalized) ? normalized : 'active'
}

function extractCompaniesFromProjects(items: FreelancerProjectListItem[]): Company[] {
    if (!Array.isArray(items)) {
        return []
    }
    const map = new Map<string, Company>()
    items.forEach(item => {
        if (item?.company?.id) {
            map.set(item.company.id, {
                id: item.company.id,
                name: item.company.companyName ?? "Unnamed Company"
            })
        }
    })
    return Array.from(map.values())
}

function mergeCompanyLists(current: Company[], incoming: Company[]): Company[] {
    if (incoming.length === 0) {
        return current
    }

    const map = new Map<string, Company>()
    current.forEach(company => map.set(company.id, company))
    incoming.forEach(company => map.set(company.id, company))
    return Array.from(map.values())
}
