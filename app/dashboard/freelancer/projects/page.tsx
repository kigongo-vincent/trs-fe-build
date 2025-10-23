"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
    Eye,
    Calendar,
    Clock,
    DollarSign,
    Building2,
    Users
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MotionBlock } from "@/components/MotionBlock"
import { FreelancerProjectStatusChart } from "@/components/freelancer-charts"
import { ProjectTimelineChart } from "@/components/project-timeline-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface Project {
    id: string
    name: string
    description: string
    companyId: string
    companyName: string
    hourlyRate: number
    status: 'active' | 'completed' | 'on-hold' | 'cancelled'
    startDate: string
    endDate?: string
    totalHours: number
    totalEarnings: number
    createdAt: string
    progress: number
}

interface Company {
    id: string
    name: string
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        companyId: "",
        hourlyRate: "",
        status: "active",
        startDate: "",
        endDate: ""
    })

    useEffect(() => {
        // Set hardcoded data
        setCompanies([
            { id: "1", name: "TechCorp Inc" },
            { id: "2", name: "DesignStudio" },
            { id: "3", name: "StartupXYZ" },
            { id: "4", name: "FinanceCo" },
            { id: "5", name: "MediaCorp" },
            { id: "6", name: "HealthTech Solutions" },
            { id: "7", name: "EduTech Innovations" },
            { id: "8", name: "RetailMax" }
        ])

        setProjects([
            {
                id: "1",
                name: "Website Development",
                description: "Complete website redesign and development with modern UI/UX",
                companyId: "1",
                companyName: "TechCorp Inc",
                hourlyRate: 75,
                status: "active",
                startDate: "2024-01-01",
                totalHours: 120,
                totalEarnings: 9000,
                createdAt: "2024-01-01",
                progress: 75
            },
            {
                id: "2",
                name: "E-commerce Platform",
                description: "Full-stack e-commerce solution with payment integration",
                companyId: "8",
                companyName: "RetailMax",
                hourlyRate: 88,
                status: "active",
                startDate: "2024-04-15",
                totalHours: 180,
                totalEarnings: 15840,
                createdAt: "2024-04-15",
                progress: 70
            },
            {
                id: "3",
                name: "Mobile App Design",
                description: "UI/UX design for mobile application with responsive layouts",
                companyId: "2",
                companyName: "DesignStudio",
                hourlyRate: 85,
                status: "completed",
                startDate: "2024-01-15",
                endDate: "2024-02-15",
                totalHours: 80,
                totalEarnings: 6800,
                createdAt: "2024-01-15",
                progress: 100
            }
        ])
        setLoading(false)
    }, [])

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const company = companies.find(c => c.id === formData.companyId)

        if (editingProject) {
            // Update existing project
            setProjects(prev => prev.map(project =>
                project.id === editingProject.id
                    ? {
                        ...project,
                        ...formData,
                        status: formData.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
                        hourlyRate: parseFloat(formData.hourlyRate),
                        companyName: company?.name || project.companyName
                    }
                    : project
            ))
        } else {
            // Add new project
            const newProject: Project = {
                id: Date.now().toString(),
                ...formData,
                status: formData.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
                hourlyRate: parseFloat(formData.hourlyRate),
                companyName: company?.name || "",
                totalHours: 0,
                totalEarnings: 0,
                createdAt: new Date().toISOString().split('T')[0],
                progress: 0
            }
            setProjects(prev => [...prev, newProject])
        }

        // Reset form
        setFormData({
            name: "",
            description: "",
            companyId: "",
            hourlyRate: "",
            status: "active",
            startDate: "",
            endDate: ""
        })
        setEditingProject(null)
        setIsAddDialogOpen(false)
    }

    const handleEdit = (project: Project) => {
        setFormData({
            name: project.name,
            description: project.description,
            companyId: project.companyId,
            hourlyRate: project.hourlyRate.toString(),
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate || ""
        })
        setEditingProject(project)
        setIsAddDialogOpen(true)
    }

    const handleDelete = (projectId: string) => {
        setProjects(prev => prev.filter(project => project.id !== projectId))
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
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }


    if (loading) {
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
                <div className="bg-paper p-8 rounded-lg">
                    <div className="flex md:h-[5vh] h-max items-center justify-between">
                        <div className="">
                            <h1 className="text tracking-tight">
                                <span className="font-semibold">Projects</span>
                            </h1>
                            <p className="text-sm text-muted-foreground">Manage your projects and hourly rates</p>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingProject ? "Edit Project" : "Create New Project"}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Project Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter project name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyId">Company</Label>
                                            <Select value={formData.companyId} onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select company" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {companies.map((company) => (
                                                        <SelectItem key={company.id} value={company.id}>
                                                            {company.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Enter project description"
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hourlyRate">Hourly Rate</Label>
                                            <Input
                                                id="hourlyRate"
                                                type="number"
                                                step="0.01"
                                                value={formData.hourlyRate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date (Optional)</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingProject ? "Update Project" : "Create Project"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </MotionBlock>


            {/* Summary Cards Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Projects</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">{projects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {projects.filter(p => p.status === 'active').length} active
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
                            {projects.reduce((sum, p) => sum + p.totalHours, 0)}h
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
                            {projects.reduce((sum, p) => sum + p.totalEarnings, 0).toLocaleString()}
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
                            ${Math.round(projects.reduce((sum, p) => sum + p.hourlyRate, 0) / projects.length) || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average rate per hour
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Status Distribution</CardTitle>
                        <CardDescription>Projects by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FreelancerProjectStatusChart />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Timeline</CardTitle>
                        <CardDescription>Projects by completion percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProjectTimelineChart projects={projects} />
                    </CardContent>
                </Card>
            </div>

            {/* Table Row */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center text-xl text-primary">
                                <span className="text-gradient">Projects</span>
                            </CardTitle>
                            <CardDescription>
                                Showing {filteredProjects.length} projects
                            </CardDescription>
                        </div>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-auto max-w-[90vw]">
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No projects found. Get started by creating your first project.
                            </p>
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
                                {paginatedProjects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                        <TableCell>{project.companyName}</TableCell>
                                        <TableCell>{project.hourlyRate}/hr</TableCell>
                                        <TableCell>{project.totalHours}h</TableCell>
                                        <TableCell>{project.totalEarnings.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(project.status)}>
                                                <span className="capitalize">{project.status.replace('-', ' ')}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(project)}
                                                    aria-label="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700"
                                                            aria-label="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the project
                                                                <strong> "{project.name}"</strong> and remove all associated data.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(project.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete Project
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>

                {/* Pagination Controls */}
                {filteredProjects.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">Rows per page:</p>
                                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                                    setItemsPerPage(Number(value))
                                    setCurrentPage(1)
                                }}>
                                    <SelectTrigger className="w-20">
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
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>


            {filteredProjects.length === 0 && (
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
