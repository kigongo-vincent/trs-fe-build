"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { CalendarIcon, Clock, Download, Plus, Search, Paperclip, Eye, Type, Trash, Pencil, Loader2, X, Upload, FileText, MoveRight, RefreshCcw, FileEdit, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import Link from "next/link"
import { TimeLogsChart } from "@/components/time-logs-chart"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useEffect, useState, useMemo, useRef } from "react"
import { formatDurationString, formatDate, type FreelancerTimeLog, type FreelancerDashboardData } from "@/services/freelancer"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RichTextEditor } from "@/components/rich-text-editor"
import { FileAttachment, type Attachment } from "@/components/file-attachment"
import { useRouter } from "next/navigation"
import { getAuthUser } from "@/services/auth"
import { putRequest } from "@/services/api"
import { Label } from "@/components/ui/label"
import TaskDetailModal from "@/components/TaskDetailModal"
import { toast } from "sonner"
import { generatePdf } from "@/utils/GeneratePDF"
import { MotionBlock } from "@/components/MotionBlock"

export default function TimeLogsPage() {
    const [timeLogs, setTimeLogs] = useState<FreelancerTimeLog[]>([])
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    })
    const [dashboardData, setDashboardData] = useState<FreelancerDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [projectFilter, setProjectFilter] = useState("all")
    const [selectedTimeLog, setSelectedTimeLog] = useState<FreelancerTimeLog | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const router = useRouter()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editTimeLog, setEditTimeLog] = useState<FreelancerTimeLog | null>(null)
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
            draftCount: 0,
            draftHours: 0,
        }
    })
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [publishLogId, setPublishLogId] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)
    const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false)
    const [isPublishingAll, setIsPublishingAll] = useState(false)
    const [startDate, setStartDate] = useState<string>(() => {
        const today = new Date()
        return today.toISOString().split("T")[0]
    })
    const [endDate, setEndDate] = useState<string>(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split("T")[0]
    })
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
    const [isFiltering, setIsFiltering] = useState(false)
    const [isChangingLimit, setIsChangingLimit] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    // Reset filters function (no API calls)
    const handleResetFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setProjectFilter("all")
        const today = new Date()
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        setStartDate(today.toISOString().split("T")[0])
        setEndDate(tomorrow.toISOString().split("T")[0])
    }

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            page: newPage
        }))
    }

    // Handle limit change
    const handleLimitChange = (newLimit: number) => {
        setPagination(prev => ({
            ...prev,
            limit: newLimit,
            page: 1 // Reset to first page when changing limit
        }))
    }

    // Generate pagination items
    const generatePaginationItems = () => {
        const items = []
        const { page, totalPages } = pagination

        // Previous button
        items.push(
            <PaginationItem key="prev">
                <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={!pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
            </PaginationItem>
        )

        // Page numbers
        const startPage = Math.max(1, page - 2)
        const endPage = Math.min(totalPages, page + 2)

        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
            )
            if (startPage > 2) {
                items.push(
                    <PaginationItem key="ellipsis1">
                        <span className="px-3 py-2">...</span>
                    </PaginationItem>
                )
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => handlePageChange(i)}
                        isActive={i === page}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            )
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(
                    <PaginationItem key="ellipsis2">
                        <span className="px-3 py-2">...</span>
                    </PaginationItem>
                )
            }
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
            )
        }

        // Next button
        items.push(
            <PaginationItem key="next">
                <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
            </PaginationItem>
        )

        return items
    }




    useEffect(() => {
        // Set hardcoded time logs data
        setTimeLogs([
            {
                id: "1",
                title: "Website Development - Homepage Design",
                description: "Created responsive homepage layout with modern design elements and user-friendly navigation",
                projectId: "1",
                userId: "1",
                project: {
                    id: "1",
                    name: "Website Development",
                    description: "Complete website redesign and development",
                    status: "active",
                    startDate: "2024-01-01",
                    endDate: null,
                    budget: 10000,
                    companyId: "1",
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                },
                duration: 480, // 8 hours in minutes
                status: "active",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                user: {
                    id: "1",
                    fullName: "John Doe",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com",
                    password: "hashedpassword",
                    freelancerId: "1",
                    status: "active",
                    hourlyRate: 75,
                    bio: "Experienced freelancer",
                    profileImage: null,
                    resetToken: null,
                    resetTokenExpiry: null,
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                }
            },
            {
                id: "2",
                title: "API Integration - Payment Gateway",
                description: "Integrated Stripe payment gateway with proper error handling and security measures",
                projectId: "2",
                userId: "1",
                project: {
                    id: "2",
                    name: "E-commerce Platform",
                    description: "Full-stack e-commerce solution",
                    status: "active",
                    startDate: "2024-04-15",
                    endDate: null,
                    budget: 25000,
                    companyId: "2",
                    createdAt: "2024-04-15",
                    updatedAt: "2024-04-15"
                },
                duration: 360, // 6 hours in minutes
                status: "active",
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: "1",
                    fullName: "John Doe",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com",
                    password: "hashedpassword",
                    freelancerId: "1",
                    status: "active",
                    hourlyRate: 75,
                    bio: "Experienced freelancer",
                    profileImage: null,
                    resetToken: null,
                    resetTokenExpiry: null,
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                }
            },
            {
                id: "3",
                title: "Mobile App Design - User Interface",
                description: "Designed intuitive mobile app interface with focus on user experience and accessibility",
                projectId: "3",
                userId: "1",
                project: {
                    id: "3",
                    name: "Mobile App Design",
                    description: "UI/UX design for mobile application",
                    status: "completed",
                    startDate: "2024-01-15",
                    endDate: "2024-02-15",
                    budget: 15000,
                    companyId: "3",
                    createdAt: "2024-01-15",
                    updatedAt: "2024-02-15"
                },
                duration: 300, // 5 hours in minutes
                status: "draft",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: "1",
                    fullName: "John Doe",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com",
                    password: "hashedpassword",
                    freelancerId: "1",
                    status: "active",
                    hourlyRate: 75,
                    bio: "Experienced freelancer",
                    profileImage: null,
                    resetToken: null,
                    resetTokenExpiry: null,
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                }
            },
            {
                id: "4",
                title: "Database Optimization",
                description: "Optimized database queries and added proper indexing for improved performance",
                projectId: "1",
                userId: "1",
                project: {
                    id: "1",
                    name: "Website Development",
                    description: "Complete website redesign and development",
                    status: "active",
                    startDate: "2024-01-01",
                    endDate: null,
                    budget: 10000,
                    companyId: "1",
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                },
                duration: 240, // 4 hours in minutes
                status: "active",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: "1",
                    fullName: "John Doe",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com",
                    password: "hashedpassword",
                    freelancerId: "1",
                    status: "active",
                    hourlyRate: 75,
                    bio: "Experienced freelancer",
                    profileImage: null,
                    resetToken: null,
                    resetTokenExpiry: null,
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                }
            },
            {
                id: "5",
                title: "Content Management System",
                description: "Built custom CMS with multi-user support and role-based permissions",
                projectId: "4",
                userId: "1",
                project: {
                    id: "4",
                    name: "Content Management System",
                    description: "Custom CMS with multi-user support",
                    status: "active",
                    startDate: "2024-03-01",
                    endDate: null,
                    budget: 20000,
                    companyId: "4",
                    createdAt: "2024-03-01",
                    updatedAt: "2024-03-01"
                },
                duration: 600, // 10 hours in minutes
                status: "draft",
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: "1",
                    fullName: "John Doe",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com",
                    password: "hashedpassword",
                    freelancerId: "1",
                    status: "active",
                    hourlyRate: 75,
                    bio: "Experienced freelancer",
                    profileImage: null,
                    resetToken: null,
                    resetTokenExpiry: null,
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01"
                }
            }
        ])

        setDashboardData({
            hoursToday: { count: 390, percentage: 85 }, // 6.5 hours
            hoursWeek: { count: 1920, percentage: 78 }, // 32 hours
            hoursMonth: { count: 7200, percentage: 92 }, // 120 hours
            weekDistribution: [
                { day: 1, hours: 6 },
                { day: 2, hours: 8 },
                { day: 3, hours: 4 },
                { day: 4, hours: 7 },
                { day: 5, hours: 5 },
                { day: 6, hours: 3 },
                { day: 7, hours: 2 }
            ],
            recentLogs: [
                {
                    date: new Date().toISOString(),
                    title: "Website Development - Homepage Design",
                    project: "Website Development",
                    minutes: 480,
                    status: "active",
                    id: "1"
                },
                {
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    title: "API Integration - Payment Gateway",
                    project: "E-commerce Platform",
                    minutes: 360,
                    status: "active",
                    id: "2"
                }
            ]
        })

        setProjects([
            { id: "1", name: "Website Development" },
            { id: "2", name: "E-commerce Platform" },
            { id: "3", name: "Mobile App Design" },
            { id: "4", name: "Content Management System" }
        ])

        setLoading(false)
    }, [])


    // Calculate summary statistics using dashboard API data and draft stats from time logs
    useEffect(() => {
        if (dashboardData) {
            // Use API data for main hours statistics
            const hoursToday = dashboardData.hoursToday.count / 60 // Convert minutes to hours
            const hoursWeek = dashboardData.hoursWeek.count / 60
            const hoursMonth = dashboardData.hoursMonth.count / 60

            // Calculate billable hours from dashboard data
            const billableHours = dashboardData.hoursMonth.count / 60 // Using month data as billable

            // Calculate draft statistics from time logs (only for drafts)
            let draftCount = 0
            let draftHours = 0

            timeLogs.forEach((log) => {
                if (log.status === "draft") {
                    draftCount += 1
                    draftHours += Number.parseFloat(log.duration.toString())
                }
            })

            setSummaryStats({
                hoursToday: hoursToday,
                hoursWeek: hoursWeek,
                hoursMonth: hoursMonth,
                billableHours: billableHours,
                billableRate: hoursMonth > 0 ? (billableHours / hoursMonth) * 100 : 0,
                draftCount: draftCount,
                draftHours: draftHours / 60,
            })
        }
    }, [dashboardData, timeLogs])

    // Get unique projects for filter - this will be populated from API
    const uniqueProjects = useMemo(() => {
        return projects && Array.isArray(projects)
            ? projects.filter((p) => p && p.id)
            : []
    }, [projects])

    // Client-side filtering and pagination
    const filteredTimeLogs = timeLogs.filter(log =>
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredTimeLogs.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedTimeLogs = filteredTimeLogs.slice(startIndex, endIndex)

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Generate PDF for all filtered time logs
    const generateFilteredTimeLogsPdf = async () => {
        if (filteredTimeLogs.length === 0) {
            toast.error('No time logs to generate PDF for.')
            return
        }

        setIsGeneratingPdf(true)
        try {
            const timeLogsHtml = generateTimeLogsSummaryHtml()
            await generatePdf(timeLogsHtml)
            toast.success(`Generated PDF for ${filteredTimeLogs.length} time logs!`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF. Please try again.')
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    // Generate PDF for a single time log
    const generateTimeLogPdf = async (timeLog: FreelancerTimeLog) => {
        setIsGeneratingPdf(true)
        try {
            const timeLogHtml = generateTimeLogHtml(timeLog)
            await generatePdf(timeLogHtml)
            toast.success(`Time log "${timeLog.title}" generated successfully!`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF. Please try again.')
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    // Generate HTML for a single time log
    const generateTimeLogHtml = (timeLog: FreelancerTimeLog) => {
        const user = getAuthUser()
        const statusColor = timeLog.status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-yellow-50 text-yellow-700 border-yellow-200"
        const statusText = timeLog.status.charAt(0).toUpperCase() + timeLog.status.slice(1)

        return `
      <div class="bg-white p-8 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="border-b-2 border-gray-300 pb-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">TIME LOG</h1>
              <p class="text-lg text-gray-600">${timeLog.title}</p>
            </div>
            <div class="text-right">
              <div class="inline-block px-4 py-2 rounded-full text-sm font-medium border ${statusColor}">
                ${statusText}
              </div>
            </div>
          </div>
        </div>

        <!-- Company Info -->
        <div class="bg-primary text-white p-6 rounded-lg mb-6">
          <h2 class="text-xl font-bold mb-1">${user?.company?.name || 'Company Name'}</h2>
          <p class="text-blue-100 text-sm">${user?.company?.sector || 'Sector'}</p>
        </div>

        <!-- Time Log Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Time Log Details
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Date:</span>
                <span class="font-medium">${formatDate(timeLog.createdAt)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-medium">${formatDurationString(timeLog.duration)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Project:</span>
                <span class="font-medium">${timeLog.project?.name || 'No Project'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium">${statusText}</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Freelancer Information
            </h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="font-semibold text-gray-900">${user?.fullName || 'Freelancer Name'}</span>
                <p class="text-gray-600 capitalize">${user?.jobTitle || 'Freelancer'}</p>
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>${user?.email || 'email@example.com'}</span>
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>${user?.phoneNumber || 'Phone Number'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Description -->
        <div class="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Task Description</h3>
          <div class="text-gray-700 prose prose-sm max-w-none">
            ${timeLog.description?.replace(/<[^>]*>/g, '') || 'No description provided'}
          </div>
        </div>

        <!-- Time Summary -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Time Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-3 rounded border">
              <div class="text-sm text-gray-600">Duration</div>
              <div class="text-lg font-bold text-gray-900">${formatDurationString(timeLog.duration)}</div>
            </div>
            <div class="bg-white p-3 rounded border">
              <div class="text-sm text-gray-600">Project</div>
              <div class="text-lg font-bold text-gray-900">${timeLog.project?.name || 'No Project'}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-gray-500 text-xs border-t pt-4">
          <p>This time log was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p class="mt-1">For any questions, please contact ${user?.email || 'support@company.com'}</p>
        </div>
      </div>
    `
    }

    // Generate HTML for time logs summary
    const generateTimeLogsSummaryHtml = () => {
        const user = getAuthUser()
        const totalDuration = filteredTimeLogs.reduce((sum, log) => sum + Number(log.duration), 0)
        const activeLogs = filteredTimeLogs.filter(log => log.status === 'active')
        const draftLogs = filteredTimeLogs.filter(log => log.status === 'draft')
        const uniqueProjects = [...new Set(filteredTimeLogs.map(log => log.project?.name).filter(Boolean))]

        return `
      <div class="bg-white p-8 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="border-b-2 border-gray-300 pb-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">TIME LOGS SUMMARY</h1>
              <p class="text-lg text-gray-600">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">
                <p>Total Time Logs: ${filteredTimeLogs.length}</p>
                <p>Total Duration: ${formatDurationString(totalDuration)}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Info -->
        <div class="bg-primary text-white p-6 rounded-lg mb-6">
          <h2 class="text-xl font-bold mb-1">${user?.company?.name || 'Company Name'}</h2>
          <p class="text-blue-100 text-sm">${user?.company?.sector || 'Sector'}</p>
        </div>

        <!-- Freelancer Info -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Freelancer Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Name:</span>
              <p class="font-medium">${user?.fullName || 'Freelancer Name'}</p>
            </div>
            <div>
              <span class="text-gray-600">Email:</span>
              <p class="font-medium">${user?.email || 'email@example.com'}</p>
            </div>
            <div>
              <span class="text-gray-600">Phone:</span>
              <p class="font-medium">${user?.phoneNumber || 'Phone Number'}</p>
            </div>
            <div>
              <span class="text-gray-600">Position:</span>
              <p class="font-medium capitalize">${user?.jobTitle || 'Freelancer'}</p>
            </div>
          </div>
        </div>

       

        <!-- Time Logs Table -->
        <div class="bg-white border border-gray-200 rounded-lg mb-6">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">Time Log Details</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Task Title</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Project</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Duration</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${filteredTimeLogs.map(log => `
                  <tr>
                    <td class="px-4 py-3 text-gray-900">
                      ${formatDate(log.createdAt)}
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-medium text-gray-900">${log.title}</span>
                      <p class="text-xs text-gray-500 mt-1">
                        ${log.description?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No description'}
                        ${log.description && log.description.length > 100 ? '...' : ''}
                      </p>
                    </td>
                    <td class="px-4 py-3 text-gray-900">
                      ${log.project?.name || 'No Project'}
                    </td>
                    <td class="px-4 py-3 text-center text-gray-900">
                      ${formatDurationString(log.duration)}
                    </td>
                    <td class="">
                        ${log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

       

        <!-- Footer -->
        <div class="text-center text-gray-500 text-xs border-t pt-4">
          <p>This summary was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    `
    }

    const handleViewDetails = (timeLog: FreelancerTimeLog) => {
        setSelectedTimeLog(timeLog)
        setIsDetailDialogOpen(true)
    }

    // Convert API attachments to component format
    const getAttachmentsFromTimeLog = (timeLog: FreelancerTimeLog): Attachment[] => {
        // Since FreelancerTimeLog doesn't have attachments property, return empty array
        return []
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
                description: editTimeLog.description || "",
                duration: editTimeLog.duration.toString(),
                status: editTimeLog.status,
                project: editTimeLog.projectId || ""
            })
            // Since FreelancerTimeLog doesn't have attachments, set empty array
            setEditAttachments([])
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
            // Separate new file attachments and existing attachments
            const newFileAttachments = editAttachments.filter(a => a.type === "file" && a.file) as (Attachment & { file: File })[]
            const existingAttachments = editAttachments.filter(a => a.type === "file" && a.url && !a.file)
            const urlAttachments = editAttachments.filter(a => a.type === "url" && a.url).map(a => ({ url: a.url!, name: a.name }))

            // Convert new files to base64
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

            const newAttachmentsBase64 = await Promise.all(newFileAttachments.map(a => toBase64(a.file)));

            // Combine existing and new attachments
            const allAttachments = [
                ...existingAttachments.map(a => ({ url: a.url!, name: a.name })),
                ...newAttachmentsBase64.map(base64 => ({ url: base64, name: 'new-file' }))
            ];

            await putRequest(`/freelancer/time-logs/${editTimeLog.id}`, {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                duration: Number(editForm.duration),
                status: editForm.status,
                project: editForm.project,
                attachments: allAttachments.length > 0 ? allAttachments : undefined,
                urls: urlAttachments.length > 0 ? urlAttachments : undefined,
            })
            toast.success("Time log updated successfully!")
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
            await putRequest(`/freelancer/time-logs/${logId}`, { status: 'active' })
            toast.success('Draft published successfully!')
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
            await Promise.all(draftLogs.map(log => putRequest(`/freelancer/time-logs/${log.id}`, { status: 'active' })))
            toast.success('All drafts published successfully!')
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
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Time Logs</h1>
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
            {/* Header */}
            <MotionBlock delay={0}>
                <div className="bg-paper p-8 rounded-lg flex md:h-[5vh] h-max items-center justify-between">
                    <div className="">
                        <h1 className="text tracking-tight">
                            <span className="font-semibold">Time Logs</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Track and manage your time entries</p>
                    </div>
                    <Button asChild className="gradient">
                        <Link href="/dashboard/freelancer/time-logs/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Log Time
                        </Link>
                    </Button>
                </div>
            </MotionBlock>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Hours Today</CardTitle>
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
                                <div className="text-2xl font-semibold text-primary">
                                    {Math.floor(summaryStats.hoursToday)}h {Math.round((summaryStats.hoursToday % 1) * 60)}m
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardData?.hoursToday?.percentage || 0}% of target
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Hours This Week</CardTitle>
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
                                <div className="text-2xl font-semibold text-primary">
                                    {Math.floor(summaryStats.hoursWeek)}h {Math.round((summaryStats.hoursWeek % 1) * 60)}m
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardData?.hoursWeek?.percentage || 0}% of target
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal ">Hours This Month</CardTitle>
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
                                <div className="text-2xl font-semibold text-primary">
                                    {Math.floor(summaryStats.hoursMonth)}h {Math.round((summaryStats.hoursMonth % 1) * 60)}m
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardData?.hoursMonth?.percentage || 0}% of target
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Billable Hours</CardTitle>
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
                                <div className="text-2xl font-semibold text-primary">
                                    {Math.floor(summaryStats.billableHours)}h {Math.round((summaryStats.billableHours % 1) * 60)}m
                                </div>
                                <p className="text-xs text-muted-foreground">{Math.round(summaryStats.billableRate)}% billable rate</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Draft Logs</CardTitle>
                        <FileEdit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold text-primary">{summaryStats.draftCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    {Math.floor(summaryStats.draftHours)}h {Math.round((summaryStats.draftHours % 1) * 60)}m pending
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Search Row */}

            {/* <div className="flex items-center gap-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search logs..."
              className="h-9 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters()
                }
              }}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-6 p-0"
                onClick={() => setSearchTerm("")}
                disabled={isFiltering}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 lg:px-3"
            onClick={handleApplyFilters}
            disabled={isFiltering}
          >
            {isFiltering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="sr-only md:not-sr-only md:ml-2">Filtering...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Search</span>
              </>
            )}
          </Button>
        </div>
      </div> */}

            {/* Filters Row */}
            <div className=" max-w-[92vw]  bg-paper p-4 rounded flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-row items-center rounded bg-pale overflow-auto p-4 gap-2">
                    <div className="flex items-center gap-2">

                        <Input
                            id="start-date"
                            type="date"
                            className="h-9 min-w-max bg-transparent"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />

                        <div className="flex items-center">
                            <MoveRight size={15} className="opacity-40" />
                        </div>

                        <Input
                            id="end-date"
                            type="date"
                            className="h-9 w-min-max bg-transparent"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />

                    </div>

                </div>
                <div className="flex items-center bg-pale p-4 rounded gap-2">

                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                        <SelectTrigger className="h-9 w-[160px]">
                            <SelectValue placeholder="Project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            {uniqueProjects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    <div>
                                        <div className="font-semibold">{project.name}</div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Pagination Info Display */}

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 bg-transparent"
                        onClick={handleResetFilters}
                    >
                        <RefreshCcw />
                        Reset
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center text-xl text-primary">
                                <span className="text-gradient">Time Logs</span>
                            </CardTitle>
                            <CardDescription>
                                Showing {filteredTimeLogs.length} time logs
                            </CardDescription>
                        </div>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search time logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className=" overflow-auto max-w-[90vw]">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-center justify-stretch space-x-4">

                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px] flex-1" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[100px]" />

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
                        <Table className="">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Task Title</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isNavigating || isChangingLimit ? (
                                    // Show skeleton loading when navigating or changing limit
                                    Array.from({ length: pagination.limit }).map((_, index) => (
                                        <TableRow key={`skeleton-${index}`}>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    paginatedTimeLogs.map((log) => {
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell>{formatDate(log.createdAt)}</TableCell>
                                                <TableCell className="">
                                                    <div>
                                                        <div className="">{log.title}</div>
                                                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                            {log.description?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No description'}
                                                            {log.description && log.description.length > 100 && '...'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="min-w-max">{log.project?.name || 'No Project'}</Badge>
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
                                                <TableCell className="text-right flex items-center justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        className="hover:bg-gray-200/50"

                                                        size="icon"
                                                        onClick={() => handleViewDetails(log)}
                                                        aria-label="View"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {log.status === "draft" && (
                                                        <>
                                                            <Button
                                                                className="hover:bg-gray-200/50"
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
                                                                className="hover:bg-gray-200/50"

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
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination Controls */}
                    {timeLogs.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <p className="text-sm font-medium text-foreground">Items per page:</p>
                                    <div className="flex items-center space-x-2">
                                        <Select
                                            value={pagination.limit.toString()}
                                            onValueChange={(value) => handleLimitChange(parseInt(value))}
                                            disabled={isChangingLimit || isNavigating}
                                        >
                                            <SelectTrigger className="w-20 h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {isChangingLimit && (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={!pagination.hasPrev || isChangingLimit || isNavigating}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="flex items-center space-x-1">
                                    {(() => {
                                        const totalPages = pagination.totalPages;
                                        const currentPage = pagination.page;
                                        const pages = [];

                                        if (totalPages <= 7) {
                                            // Show all pages if 7 or fewer
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            // Show smart pagination
                                            if (currentPage <= 4) {
                                                // Show first 5 pages + ... + last page
                                                for (let i = 1; i <= 5; i++) {
                                                    pages.push(i);
                                                }
                                                pages.push('...');
                                                pages.push(totalPages);
                                            } else if (currentPage >= totalPages - 3) {
                                                // Show first page + ... + last 5 pages
                                                pages.push(1);
                                                pages.push('...');
                                                for (let i = totalPages - 4; i <= totalPages; i++) {
                                                    pages.push(i);
                                                }
                                            } else {
                                                // Show first + ... + current-1, current, current+1 + ... + last
                                                pages.push(1);
                                                pages.push('...');
                                                pages.push(currentPage - 1);
                                                pages.push(currentPage);
                                                pages.push(currentPage + 1);
                                                pages.push('...');
                                                pages.push(totalPages);
                                            }
                                        }

                                        return pages.map((page, index) => {
                                            if (page === '...') {
                                                return (
                                                    <span key={`ellipsis-${index}`} className="text-muted-foreground px-2">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Button
                                                    key={page}
                                                    variant={pagination.page === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page as number)}
                                                    disabled={isChangingLimit || isNavigating}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        });
                                    })()}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={!pagination.hasNext || isChangingLimit || isNavigating}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {filteredTimeLogs.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTimeLogs.length)} of {filteredTimeLogs.length} time logs
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
                </CardContent>
            </Card>

            {/* Time Log Details Dialog */}
            <TaskDetailModal
                open={isDetailDialogOpen}
                onClose={() => setIsDetailDialogOpen(false)}
                task={selectedTimeLog}
                attachments={selectedTimeLog ? getAttachmentsFromTimeLog(selectedTimeLog) : []}
                urls={[]}
            />



            {/* Edit Time Log Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className=" backdrop-blur-sm">
                        <div className="flex items-center  justify-between">
                            <DialogTitle className="text-xl text-gradient">Edit Time Log</DialogTitle>
                            <Button type="button" variant="ghost" className="hover:bg-gray-100" onClick={() => setIsEditDialogOpen(false)} aria-label="Close">
                                <X className="h-10 w-10" />
                            </Button>
                        </div>
                        <DialogDescription>Update your time log entry</DialogDescription>

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
                                            <SelectItem key={project.id} value={project.id}>
                                                <div>
                                                    <div className="font-semibold">{project.name}</div>

                                                </div>
                                            </SelectItem>
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
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex items-center gap-2">
                                <X className="h-4 w-4 md:hidden" />
                                <span className="hidden md:inline">Cancel</span>
                                <span className="md:hidden">Cancel</span>
                            </Button>
                            <Button type="submit" disabled={isEditSubmitting || isLoadingProjects} className="flex items-center gap-2">
                                {isEditSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="hidden md:inline">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Pencil className="h-4 w-4 md:hidden" />
                                        <span className="hidden md:inline">Save Changes</span>
                                        <span className="md:hidden">Save</span>
                                    </>
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
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4 md:hidden" />
                            <span className="hidden md:inline">Cancel</span>
                            <span className="md:hidden">Cancel</span>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!deleteTimeLogId) return
                                setIsDeleting(true)
                                try {
                                    const { deleteRequest } = await import("@/services/api")
                                    await deleteRequest(`/freelancer/time-logs/${deleteTimeLogId}`)
                                    toast.success("Time log deleted successfully")
                                    setDeleteDialogOpen(false)
                                    setDeleteTimeLogId(null)
                                } catch (err: any) {
                                    toast.error(err?.message || "Failed to delete time log")
                                } finally {
                                    setIsDeleting(false)
                                }
                            }}
                            disabled={isDeleting}
                            className="flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden md:inline">Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash className="h-4 w-4 md:hidden" />
                                    <span className="hidden md:inline">Delete</span>
                                    <span className="md:hidden">Delete</span>
                                </>
                            )}
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
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4 md:hidden" />
                            <span className="hidden md:inline">Cancel</span>
                            <span className="md:hidden">Cancel</span>
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => publishLogId && handlePublishDraft(publishLogId)}
                            disabled={isPublishing}
                            className="flex items-center gap-2"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden md:inline">Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 md:hidden" />
                                    <span className="hidden md:inline">Publish</span>
                                    <span className="md:hidden">Publish</span>
                                </>
                            )}
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
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4 md:hidden" />
                            <span className="hidden md:inline">Cancel</span>
                            <span className="md:hidden">Cancel</span>
                        </Button>
                        <Button
                            variant="default"
                            onClick={handlePublishAllDrafts}
                            disabled={isPublishingAll}
                            className="flex items-center gap-2"
                        >
                            {isPublishingAll ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden md:inline">Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 md:hidden" />
                                    <span className="hidden md:inline">Publish All</span>
                                    <span className="md:hidden">Publish All</span>
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}