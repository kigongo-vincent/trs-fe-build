"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Receipt,
    Plus,
    Search,
    Eye,
    Download,
    Send,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FreelancerInvoiceStatusChart, FreelancerEarningsChart } from "@/components/freelancer-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    createFreelancerInvoice,
    getFreelancerInvoiceSummary,
    getFreelancerInvoiceStatusDistribution,
    getFreelancerInvoiceMonthlyTrend,
    getFreelancerProjects,
    getFreelancerInvoices,
    getFreelancerInvoiceById,
    updateFreelancerInvoice,
    deleteFreelancerInvoice,
    type FreelancerInvoiceStatus,
    type FreelancerInvoiceMonthlyTrendPoint,
    type FreelancerInvoiceStatusDistribution,
    type FreelancerInvoiceSummary,
    type FreelancerProjectListItem,
    type FreelancerInvoiceListItem,
    type PaginationMeta
} from "@/services/api"
import { generatePdf } from "@/utils/GeneratePDF"

interface Invoice {
    id: string
    projectId: string
    projectName: string
    description: string
    amount: number
    status: FreelancerInvoiceStatus
    dueDate: string
    createdAt: string
    updatedAt: string
}

interface Project {
    id: string
    name: string
    companyName: string
    hourlyRate: number
    totalHours: number
}

const creationStatusOptions: FreelancerInvoiceStatus[] = ["draft", "active"]
const detailStatusOptions: FreelancerInvoiceStatus[] = ["draft", "active", "sent", "paid", "overdue"]
const invoiceStatusLabels: Record<FreelancerInvoiceStatus, string> = {
    draft: "Draft",
    active: "Active",
    sent: "Sent",
    paid: "Paid",
    overdue: "Overdue"
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)
    const [tableLoading, setTableLoading] = useState(true)
    const [tableError, setTableError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [projectsLoading, setProjectsLoading] = useState(true)
    const [projectsError, setProjectsError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [statsLoading, setStatsLoading] = useState(true)
    const [statsError, setStatsError] = useState<string | null>(null)
    const [invoiceSummary, setInvoiceSummary] = useState<FreelancerInvoiceSummary | null>(null)
    const [statusDistribution, setStatusDistribution] = useState<FreelancerInvoiceStatusDistribution | null>(null)
    const [monthlyTrend, setMonthlyTrend] = useState<FreelancerInvoiceMonthlyTrendPoint[]>([])
    const [formError, setFormError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        projectId: "",
        description: "",
        taxRate: "0",
        dueDate: "",
        amount: "",
        status: "draft" as FreelancerInvoiceStatus
    })
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState<string | null>(null)
    const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null)
    const [detailsFormData, setDetailsFormData] = useState({
        description: "",
        amount: "",
        dueDate: "",
        status: "draft" as FreelancerInvoiceStatus
    })
    const [isUpdatingInvoice, setIsUpdatingInvoice] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pendingDeleteInvoiceId, setPendingDeleteInvoiceId] = useState<string | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [isDeletingInvoice, setIsDeletingInvoice] = useState(false)

    useEffect(() => {
        let isMounted = true

        const fetchProjects = async () => {
            try {
                setProjectsError(null)
                const response = await getFreelancerProjects({ page: 1, limit: 50 })
                if (!isMounted) return
                const items = response.data.items ?? []
                setProjects(items.map(mapProjectFromApi))
            } catch (error) {
                if (!isMounted) return
                setProjectsError(extractErrorMessage(error, "Unable to load freelancer projects. Please try again."))
                setProjects([])
            } finally {
                if (isMounted) {
                    setProjectsLoading(false)
                }
            }
        }

        fetchProjects()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const fetchStats = async () => {
            try {
                setStatsError(null)
                const [summaryRes, statusRes, trendRes] = await Promise.all([
                    getFreelancerInvoiceSummary(),
                    getFreelancerInvoiceStatusDistribution(),
                    getFreelancerInvoiceMonthlyTrend()
                ])

                if (!isMounted) return

                setInvoiceSummary(summaryRes.data)
                setStatusDistribution(statusRes.data)
                setMonthlyTrend(trendRes.data)
            } catch (error) {
                if (!isMounted) return
                console.error("Failed to fetch freelancer invoice stats:", error)
                const message = error instanceof Error ? error.message : "Failed to load invoice stats."
                setStatsError(message)
            } finally {
                if (isMounted) {
                    setStatsLoading(false)
                }
            }
        }

        fetchStats()

        return () => {
            isMounted = false
        }
    }, [])

    const loadInvoices = useCallback(async (pageParam: number, limitParam: number, searchValue: string) => {
        try {
            setTableError(null)
            setTableLoading(true)
            const response = await getFreelancerInvoices({
                page: pageParam,
                limit: limitParam,
                search: searchValue.trim() ? searchValue.trim() : undefined
            })
            const items = response.data.items ?? []
            setInvoices(items.map(mapInvoiceFromApi))
            setPaginationMeta(response.data.pagination)

            const nextPage = response.data.pagination.page
            const nextLimit = response.data.pagination.limit
            setCurrentPage(prev => (prev === nextPage ? prev : nextPage))
            setItemsPerPage(prev => (prev === nextLimit ? prev : nextLimit))
        } catch (error) {
            setTableError(extractErrorMessage(error, "Failed to load invoices. Please try again."))
            setInvoices([])
            setPaginationMeta(null)
        } finally {
            setTableLoading(false)
        }
    }, [])

    useEffect(() => {
        loadInvoices(currentPage, itemsPerPage, searchTerm)
    }, [currentPage, itemsPerPage, searchTerm, loadInvoices])

    const totalInvoices = paginationMeta?.total ?? invoices.length
    const totalPages = paginationMeta?.totalPages ?? 1
    const pageStart = paginationMeta ? (paginationMeta.page - 1) * paginationMeta.limit + 1 : (invoices.length ? 1 : 0)
    const pageEnd = paginationMeta ? Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total) : invoices.length

    const handleGenerateInvoice = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        const project = projects.find(p => p.id === formData.projectId)
        if (!project) {
            setFormError("Please select a project to invoice.")
            return
        }

        const amountValue = parseFloat(formData.amount)
        if (Number.isNaN(amountValue) || amountValue <= 0) {
            setFormError("Invoice amount must be a positive number.")
            return
        }

        if (!formData.dueDate) {
            setFormError("Please select a due date.")
            return
        }

        if (!creationStatusOptions.includes(formData.status)) {
            setFormError("Please select a valid invoice status.")
            return
        }

        const payload = {
            description: formData.description.trim(),
            amount: amountValue,
            dueDate: formData.dueDate,
            projectId: project.id,
            status: formData.status
        }

        setIsSubmitting(true)

        try {
            await createFreelancerInvoice(payload)
            const nextPage = 1
            const shouldReloadImmediately = currentPage === nextPage
            if (currentPage !== nextPage) {
                setCurrentPage(nextPage)
            }
            if (shouldReloadImmediately) {
                await loadInvoices(nextPage, itemsPerPage, searchTerm)
            }

            setFormData({
                projectId: "",
                description: "",
                taxRate: "0",
                dueDate: "",
                amount: "",
                status: "draft"
            })
            setSelectedProject(null)
            setIsGenerateDialogOpen(false)
        } catch (error) {
            setFormError(extractErrorMessage(error, "Unable to create invoice. Please try again."))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        setSearchTerm(searchInput)
    }

    const handleProjectSelect = (projectId: string) => {
        const project = projects.find(p => p.id === projectId)
        setSelectedProject(project || null)
        const total = project ? project.totalHours * project.hourlyRate : ""
        setFormData(prev => ({ ...prev, projectId, amount: total ? total.toString() : "" }))
        setFormError(null)
    }

    const handleDownload = async (invoiceId: string) => {
        try {
            const response = await getFreelancerInvoiceById(invoiceId)
            const invoiceData = response.data
            // Use project name directly from API, don't use fallback
            const projectName = invoiceData.project?.projectName || 'Project'

            const formatDate = (dateString: string) => {
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            }

            const formatCurrency = (amount: number) => {
                return `USD ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }

            const html = `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 210mm; margin: 0 auto; padding: 12mm 10mm; background: white; color: #1f2937;">
              <!-- Header -->
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
                <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">INVOICE</h1>
                <p style="font-size: 12px; color: #6b7280; margin: 0;">Invoice #${invoiceData.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <!-- Invoice Details and Project Info -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
                  <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Invoice Details</h3>
                  <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Issue Date:</span>
                      <span style="font-weight: 500; color: #111827;">${formatDate(invoiceData.createdAt)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Due Date:</span>
                      <span style="font-weight: 500; color: #111827;">${formatDate(invoiceData.dueDate || invoiceData.createdAt)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Status:</span>
                      <span style="font-weight: 500; color: #111827; text-transform: capitalize;">${invoiceStatusLabels[normalizeInvoiceStatus(invoiceData.status)]}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Last Updated:</span>
                      <span style="font-weight: 500; color: #111827;">${formatDate(invoiceData.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
                  <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Project Information</h3>
                  <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
                    <div>
                      <div style="font-weight: 600; color: #111827;">${projectName}</div>
                      <div style="color: #6b7280; margin-top: 2px; font-size: 10px;">Project Invoice</div>
                    </div>
                    ${invoiceData.description ? `
                    <div style="color: #6b7280; margin-top: 4px; font-size: 10px; line-height: 1.4;">
                      ${invoiceData.description}
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Invoice Items -->
              <div style="border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 16px; overflow: hidden;">
                <div style="padding: 10px; border-bottom: 1px solid #e5e7eb; background: #fafafa;">
                  <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0;">Invoice Items</h3>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead style="background: #f9fafb;">
                    <tr>
                      <th style="padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Description</th>
                      <th style="padding: 8px 10px; text-align: right; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">
                        <div style="font-weight: 500; color: #111827; font-size: 11px;">${invoiceData.description || 'Invoice for project services'}</div>
                        <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">Project: ${projectName}</div>
                      </td>
                      <td style="padding: 8px 10px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #111827; font-size: 11px;">${formatCurrency(invoiceData.amount || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Total -->
              <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
                <div style="width: 250px;">
                  <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(invoiceData.amount || 0)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
                    <span>Tax:</span>
                    <span>${formatCurrency(0)}</span>
                  </div>
                  <div style="border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #111827;">
                      <span>Total:</span>
                      <span style="color: #F6931B;">${formatCurrency(invoiceData.amount || 0)}</span>
                    </div>
                  </div>
                  <div style="margin-top: 6px; font-size: 10px; color: #9ca3af; text-align: right;">
                    Showing amounts in <span style="font-weight: 600;">USD</span>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 16px; text-align: center; font-size: 10px; color: #6b7280;">
                <p style="margin: 0 0 4px 0;">Thank you for your business!</p>
                <p style="margin: 0;">For any questions regarding this invoice, please contact support</p>
              </div>
            </div>
            `

            await generatePdf(html)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        }
    }

    const openInvoiceDetails = async (invoiceId: string) => {
        setDetailsDialogOpen(true)
        setDetailsLoading(true)
        setDetailsError(null)
        try {
            const response = await getFreelancerInvoiceById(invoiceId)
            const mappedInvoice = mapInvoiceFromApi(response.data)
            setActiveInvoice(mappedInvoice)
            setDetailsFormData({
                description: mappedInvoice.description ?? "",
                amount: mappedInvoice.amount ? mappedInvoice.amount.toString() : "",
                dueDate: mappedInvoice.dueDate ? mappedInvoice.dueDate.slice(0, 10) : "",
                status: mappedInvoice.status
            })
        } catch (error) {
            setDetailsError(extractErrorMessage(error, "Failed to load invoice details. Please try again."))
        } finally {
            setDetailsLoading(false)
        }
    }

    const closeDetailsDialog = () => {
        setDetailsDialogOpen(false)
        setActiveInvoice(null)
        setDetailsError(null)
        setDetailsFormData({
            description: "",
            amount: "",
            dueDate: "",
            status: "draft"
        })
    }

    const handleUpdateInvoice = async () => {
        if (!activeInvoice) return

        const trimmedDescription = detailsFormData.description.trim()
        if (!trimmedDescription) {
            setDetailsError("Description is required.")
            return
        }

        const amountValue = parseFloat(detailsFormData.amount)
        if (Number.isNaN(amountValue) || amountValue <= 0) {
            setDetailsError("Invoice amount must be a positive number.")
            return
        }

        if (!detailsFormData.dueDate) {
            setDetailsError("Please select a due date.")
            return
        }

        setDetailsError(null)
        setIsUpdatingInvoice(true)

        try {
            await updateFreelancerInvoice(activeInvoice.id, {
                description: trimmedDescription,
                amount: amountValue,
                dueDate: detailsFormData.dueDate,
                status: detailsFormData.status,
                projectId: activeInvoice.projectId
            })

            await loadInvoices(currentPage, itemsPerPage, searchTerm)

            setActiveInvoice(prev => prev ? {
                ...prev,
                description: trimmedDescription,
                amount: amountValue,
                dueDate: detailsFormData.dueDate,
                status: detailsFormData.status
            } : prev)
        } catch (error) {
            setDetailsError(extractErrorMessage(error, "Unable to update invoice. Please try again."))
        } finally {
            setIsUpdatingInvoice(false)
        }
    }

    const promptDeleteInvoice = (invoiceId: string) => {
        setPendingDeleteInvoiceId(invoiceId)
        setDeleteError(null)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDeleteInvoice = async () => {
        if (!pendingDeleteInvoiceId) return
        setIsDeletingInvoice(true)
        setDeleteError(null)

        try {
            await deleteFreelancerInvoice(pendingDeleteInvoiceId)
            setInvoices(prev => prev.filter(invoice => invoice.id !== pendingDeleteInvoiceId))
            if (activeInvoice?.id === pendingDeleteInvoiceId) {
                closeDetailsDialog()
            }
            await loadInvoices(currentPage, itemsPerPage, searchTerm)
            setDeleteDialogOpen(false)
            setPendingDeleteInvoiceId(null)
        } catch (error) {
            setDeleteError(extractErrorMessage(error, "Unable to delete invoice. Please try again."))
        } finally {
            setIsDeletingInvoice(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-50 text-orange-700 border border-orange-200'
            case 'active':
                return 'bg-primary/10 text-primary border border-primary/20'
            case 'sent':
                return 'bg-blue-50 text-blue-700 border border-blue-200'
            case 'paid':
                return 'bg-green-50 text-green-700 border border-green-200'
            case 'overdue':
                return 'bg-red-50 text-red-700 border border-red-200'
            default:
                return 'bg-orange-50 text-orange-700 border border-orange-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <Edit className="h-4 w-4" />
            case 'active':
            case 'sent':
                return <Send className="h-4 w-4" />
            case 'paid':
                return <CheckCircle2 className="h-4 w-4" />
            case 'overdue':
                return <AlertCircle className="h-4 w-4" />
            default:
                return <Receipt className="h-4 w-4" />
        }
    }

    const summaryFallback: FreelancerInvoiceSummary = {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0
    }

    const summaryData = invoiceSummary ?? summaryFallback
    const formatAmount = (value: number) => value.toLocaleString()

    return (
        <div className="flex flex-col gap-4 w-full max-w-full overflow-hidden">
            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Invoices</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <>
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-3 w-32 mt-2" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold text-primary">{summaryData.totalInvoices}</div>
                                <p className="text-xs text-muted-foreground">
                                    Latest count from finance API
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <>
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-3 w-28 mt-2" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold text-primary">
                                    ${formatAmount(summaryData.totalAmount)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All invoices combined
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Paid Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <>
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-3 w-32 mt-2" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold text-primary">
                                    ${formatAmount(summaryData.paidAmount)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Successfully collected
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Pending Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <>
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-3 w-28 mt-2" />
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold text-primary">
                                    ${formatAmount(summaryData.pendingAmount)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting payment
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {statsError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{statsError}</AlertDescription>
                </Alert>
            )}

            {/* Charts Row */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Status Distribution</CardTitle>
                        <CardDescription>Invoices by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FreelancerInvoiceStatusChart data={statusDistribution} loading={statsLoading} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Earnings Trend</CardTitle>
                        <CardDescription>Earnings over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FreelancerEarningsChart data={monthlyTrend} />
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Row */}
            <div className="flex bg-paper p-3 sm:p-4 rounded-lg flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                <form onSubmit={handleSearchSubmit} className="p-2 bg-pale gap-3 w-full sm:w-auto sm:min-w-[20vw] rounded flex items-center">
                    <div />
                    <input
                        value={searchInput}
                        placeholder="Search invoices..."
                        onChange={(e) => setSearchInput(e.target.value)}
                        type="text"
                        className="bg-none bg-transparent flex-1 text-xs sm:text-sm outline-none border-none"
                    />
                    <Button type="submit" className="bg-gray-900 hover:bg-gray-600 h-8 w-8 sm:h-10 sm:w-10 p-0">
                        <Search className="h-4 w-4" />
                    </Button>
                </form>

                <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                    <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Generate Invoice</span>
                                <span className="sm:hidden">Generate</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-base sm:text-lg">Generate New Invoice</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleGenerateInvoice} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectId" className="text-xs sm:text-sm">Select Project</Label>
                                    <Select
                                        value={formData.projectId}
                                        onValueChange={handleProjectSelect}
                                        disabled={projectsLoading || projects.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select project to invoice"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectsLoading && (
                                                <SelectItem value="__loading" disabled>
                                                    Loading projects...
                                                </SelectItem>
                                            )}
                                            {!projectsLoading && projects.length === 0 && (
                                                <SelectItem value="__empty" disabled>
                                                    No projects available
                                                </SelectItem>
                                            )}
                                            {projects.map((project) => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.name} - {project.companyName} ({project.totalHours}h @ ${project.hourlyRate}/hr)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {projectsError && (
                                        <p className="text-sm text-destructive mt-1">{projectsError}</p>
                                    )}
                                </div>

                                {/* {selectedProject && (
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                        <h4 className="font-medium">Project Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Project:</span>
                                                <span className="ml-2 font-medium">{selectedProject.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Company:</span>
                                                <span className="ml-2 font-medium">{selectedProject.companyName}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total Hours:</span>
                                                <span className="ml-2 font-medium">{selectedProject.totalHours}h</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Hourly Rate:</span>
                                                <span className="ml-2 font-medium">${selectedProject.hourlyRate}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Subtotal:</span>
                                                <span className="ml-2 font-medium text-lg">${(selectedProject.totalHours * selectedProject.hourlyRate).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )} */}

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter invoice description"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Invoice Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as FreelancerInvoiceStatus }))}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select invoice status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {creationStatusOptions.map((statusOption) => (
                                                <SelectItem key={statusOption} value={statusOption}>
                                                    {invoiceStatusLabels[statusOption]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Invoice Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="Enter invoice amount"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                        <Input
                                            id="taxRate"
                                            type="number"
                                            step="0.01"
                                            value={formData.taxRate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                {formError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{formError}</AlertDescription>
                                    </Alert>
                                )}

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!selectedProject || isSubmitting}>
                                        {isSubmitting ? "Creating..." : "Generate Invoice"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Table Row */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Invoice History</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">View and manage your invoices</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full px-4 sm:px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            Loading invoices...
                                        </TableCell>
                                    </TableRow>
                                ) : tableError ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-destructive">
                                            {tableError}
                                        </TableCell>
                                    </TableRow>
                                ) : invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No invoices found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>{invoice.projectName || "—"}</TableCell>
                                            <TableCell>{invoice.description || "—"}</TableCell>
                                            <TableCell>{formatAmount(invoice.amount)}</TableCell>
                                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(invoice.status)} inline-flex items-center gap-1`}>
                                                    {getStatusIcon(invoice.status)}
                                                    <span>{invoiceStatusLabels[invoice.status as FreelancerInvoiceStatus] ?? invoice.status}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openInvoiceDetails(invoice.id)}
                                                        className="h-8 w-8 hover:bg-gray-200/50"
                                                        title="View invoice"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openInvoiceDetails(invoice.id)}
                                                        className="h-8 w-8 hover:bg-gray-200/50"
                                                        title="Edit invoice"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDownload(invoice.id)}
                                                        className="h-8 w-8 hover:bg-gray-200/50"
                                                        title="Download PDF"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => promptDeleteInvoice(invoice.id)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Delete invoice"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalInvoices > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t mt-4">
                            <div className="flex items-center space-x-2">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Showing {pageStart} to {pageEnd} of {totalInvoices} invoices
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-2 w-full sm:w-auto">
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs sm:text-sm text-muted-foreground">Rows per page:</p>
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
                </CardContent>
            </Card>
            <Sheet open={detailsDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    closeDetailsDialog()
                }
            }}>
                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader className="border-b border-border pb-4 mb-4">
                        <SheetTitle className="text-base sm:text-lg font-semibold text-foreground mb-1">Invoice Details</SheetTitle>
                        <p className="text-xs text-muted-foreground">View and manage invoice information</p>
                    </SheetHeader>
                    {detailsLoading ? (
                        <div className="py-10 text-center text-muted-foreground text-sm">Fetching invoice details...</div>
                    ) : (
                        <>
                            {detailsError && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{detailsError}</AlertDescription>
                                </Alert>
                            )}
                            {activeInvoice ? (
                                <div className="space-y-4">
                                    {/* Header Section - 60% primary theme */}
                                    <div className="rounded-lg p-4 border border-primary/30">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">Project</p>
                                                <h3 className="text-base font-semibold text-foreground mb-1">{activeInvoice.projectName}</h3>
                                                <p className="text-xs text-muted-foreground">Company invoice benchmark</p>
                                            </div>
                                            <div className="flex flex-col items-start md:items-end">
                                                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">Status</p>
                                                <Badge className={`${getStatusColor(activeInvoice.status)} inline-flex items-center gap-1.5 mt-1 mb-2 px-2 py-0.5`}>
                                                    {getStatusIcon(activeInvoice.status)}
                                                    <span className="text-xs font-medium">{invoiceStatusLabels[activeInvoice.status]}</span>
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">Updated {formatDate(activeInvoice.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Cards - 60% primary, 20% secondary, 20% neutral */}
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                        <div className="rounded-lg p-4 border border-primary/30">
                                            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Invoice Amount</p>
                                            <p className="text-xl font-bold text-primary leading-tight">${formatAmount(activeInvoice.amount)}</p>
                                        </div>
                                        <div className="rounded-lg p-4 border border-border">
                                            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Due Date</p>
                                            <p className="text-sm font-medium text-foreground leading-tight">{formatDate(activeInvoice.dueDate)}</p>
                                        </div>
                                        <div className="rounded-lg p-4 border border-border">
                                            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Created</p>
                                            <p className="text-sm font-medium text-foreground leading-tight">{formatDate(activeInvoice.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Form Section - 20% secondary, 20% neutral */}
                                    <div className="space-y-4 rounded-lg p-4 border border-border">
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground mb-0.5">Invoice Details</h4>
                                            <p className="text-xs text-muted-foreground">Update invoice information</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="details-description" className="text-sm font-medium text-foreground">Description</Label>
                                                <Textarea
                                                    id="details-description"
                                                    value={detailsFormData.description}
                                                    onChange={(e) => setDetailsFormData(prev => ({ ...prev, description: e.target.value }))}
                                                    rows={4}
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="details-amount" className="text-sm font-medium text-foreground">
                                                        Amount <span className="text-primary">*</span>
                                                    </Label>
                                                    <Input
                                                        id="details-amount"
                                                        type="number"
                                                        step="0.01"
                                                        value={detailsFormData.amount}
                                                        onChange={(e) => setDetailsFormData(prev => ({ ...prev, amount: e.target.value }))}
                                                        className="text-sm font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="details-dueDate" className="text-sm font-medium text-foreground">
                                                        Due Date <span className="text-primary">*</span>
                                                    </Label>
                                                    <Input
                                                        id="details-dueDate"
                                                        type="date"
                                                        value={detailsFormData.dueDate}
                                                        onChange={(e) => setDetailsFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                                        className="text-sm font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="details-status" className="text-sm font-medium text-foreground">Status</Label>
                                                    <Select
                                                        value={detailsFormData.status}
                                                        onValueChange={(value) => setDetailsFormData(prev => ({ ...prev, status: value as FreelancerInvoiceStatus }))}
                                                    >
                                                        <SelectTrigger id="details-status" className="text-sm font-medium">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {detailStatusOptions.map(statusOption => (
                                                                <SelectItem key={statusOption} value={statusOption}>
                                                                    {invoiceStatusLabels[statusOption]}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Select an invoice to load its details.</p>
                            )}
                        </>
                    )}
                    {activeInvoice && !detailsLoading && (
                        <SheetFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mt-6 pt-6 border-t">
                            <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={closeDetailsDialog}>
                                Close
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 sm:flex-none"
                                onClick={handleUpdateInvoice}
                                disabled={isUpdatingInvoice}
                            >
                                {isUpdatingInvoice ? "Saving..." : "Save Changes"}
                            </Button>
                        </SheetFooter>
                    )}
                </SheetContent>
            </Sheet>

            <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                setDeleteDialogOpen(open)
                if (!open) {
                    setPendingDeleteInvoiceId(null)
                    setDeleteError(null)
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The invoice will be permanently removed from your records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {deleteError && (
                        <Alert variant="destructive" className="mb-2">
                            <AlertDescription>{deleteError}</AlertDescription>
                        </Alert>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingInvoice}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeleteInvoice}
                            disabled={isDeletingInvoice}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeletingInvoice ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function mapInvoiceFromApi(item: FreelancerInvoiceListItem): Invoice {
    return {
        id: item.id,
        projectId: item.project?.id ?? "",
        projectName: item.project?.projectName ?? "Unknown project",
        description: item.description ?? "",
        amount: item.amount ?? 0,
        status: normalizeInvoiceStatus(item.status),
        dueDate: item.dueDate ?? "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    }
}

function normalizeInvoiceStatus(status?: string): FreelancerInvoiceStatus {
    const normalized = (status || "draft").toLowerCase() as FreelancerInvoiceStatus
    const allowed: FreelancerInvoiceStatus[] = ["draft", "active", "sent", "paid", "overdue"]
    return allowed.includes(normalized) ? normalized : "draft"
}

function mapProjectFromApi(item: FreelancerProjectListItem): Project {
    return {
        id: item.id,
        name: item.projectName,
        companyName: item.company?.companyName ?? "Unknown company",
        hourlyRate: item.hourlyRate ?? 0,
        totalHours: item.totalHours ?? 0
    }
}

function formatDate(value?: string) {
    if (!value) return "—"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return value
    }
    return parsed.toLocaleDateString()
}

function extractErrorMessage(error: unknown, fallback = "An unexpected error occurred. Please try again."): string {
    if (error instanceof Error && error.message) {
        return error.message
    }
    return fallback
}
