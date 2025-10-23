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
    Receipt,
    Plus,
    Search,
    Eye,
    Download,
    Send,
    Calendar,
    FileText,
    DollarSign,
    Building2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MotionBlock } from "@/components/MotionBlock"
import { FreelancerInvoiceStatusChart, FreelancerEarningsChart } from "@/components/freelancer-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface Invoice {
    id: string
    invoiceNumber: string
    projectId: string
    projectName: string
    companyName: string
    status: 'draft' | 'sent' | 'paid' | 'overdue'
    totalHours: number
    hourlyRate: number
    subtotal: number
    taxRate: number
    taxAmount: number
    totalAmount: number
    issueDate: string
    dueDate: string
    description: string
    createdAt: string
}

interface Project {
    id: string
    name: string
    companyName: string
    hourlyRate: number
    totalHours: number
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const [formData, setFormData] = useState({
        projectId: "",
        description: "",
        taxRate: "0",
        dueDate: ""
    })

    useEffect(() => {
        // Set hardcoded invoices data
        setProjects([
            { id: "1", name: "Website Development", companyName: "TechCorp Inc", hourlyRate: 75, totalHours: 120 },
            { id: "2", name: "E-commerce Platform", companyName: "RetailMax", hourlyRate: 88, totalHours: 180 },
            { id: "3", name: "Mobile App Design", companyName: "DesignStudio", hourlyRate: 85, totalHours: 80 },
            { id: "4", name: "Content Management System", companyName: "MediaCorp", hourlyRate: 80, totalHours: 150 }
        ])

        setInvoices([
            {
                id: "1",
                invoiceNumber: "INV-2024-001",
                projectId: "1",
                projectName: "Website Development",
                companyName: "TechCorp Inc",
                status: "paid",
                totalHours: 120,
                hourlyRate: 75,
                subtotal: 9000,
                taxRate: 10,
                taxAmount: 900,
                totalAmount: 9900,
                issueDate: "2024-01-01",
                dueDate: "2024-01-31",
                description: "Website development and design services",
                createdAt: "2024-01-01"
            },
            {
                id: "2",
                invoiceNumber: "INV-2024-002",
                projectId: "2",
                projectName: "E-commerce Platform",
                companyName: "RetailMax",
                status: "sent",
                totalHours: 180,
                hourlyRate: 88,
                subtotal: 15840,
                taxRate: 10,
                taxAmount: 1584,
                totalAmount: 17424,
                issueDate: "2024-04-15",
                dueDate: "2024-05-15",
                description: "Full-stack e-commerce solution with payment integration",
                createdAt: "2024-04-15"
            },
            {
                id: "3",
                invoiceNumber: "INV-2024-003",
                projectId: "3",
                projectName: "Mobile App Design",
                companyName: "DesignStudio",
                status: "draft",
                totalHours: 80,
                hourlyRate: 85,
                subtotal: 6800,
                taxRate: 0,
                taxAmount: 0,
                totalAmount: 6800,
                issueDate: "2024-01-15",
                dueDate: "2024-02-15",
                description: "Mobile app UI/UX design services",
                createdAt: "2024-01-15"
            },
            {
                id: "4",
                invoiceNumber: "INV-2024-004",
                projectId: "4",
                projectName: "Content Management System",
                companyName: "MediaCorp",
                status: "overdue",
                totalHours: 150,
                hourlyRate: 80,
                subtotal: 12000,
                taxRate: 10,
                taxAmount: 1200,
                totalAmount: 13200,
                issueDate: "2024-03-01",
                dueDate: "2024-04-01",
                description: "Custom CMS for media company with multi-user support",
                createdAt: "2024-03-01"
            }
        ])
        setLoading(false)
    }, [])

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const handleGenerateInvoice = (e: React.FormEvent) => {
        e.preventDefault()

        const project = projects.find(p => p.id === formData.projectId)
        if (!project) return

        const subtotal = project.totalHours * project.hourlyRate
        const taxAmount = subtotal * (parseFloat(formData.taxRate) / 100)
        const totalAmount = subtotal + taxAmount

        const newInvoice: Invoice = {
            id: Date.now().toString(),
            invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
            projectId: project.id,
            projectName: project.name,
            companyName: project.companyName,
            status: "draft",
            totalHours: project.totalHours,
            hourlyRate: project.hourlyRate,
            subtotal,
            taxRate: parseFloat(formData.taxRate),
            taxAmount,
            totalAmount,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: formData.dueDate,
            description: formData.description,
            createdAt: new Date().toISOString().split('T')[0]
        }

        setInvoices(prev => [...prev, newInvoice])

        // Reset form
        setFormData({
            projectId: "",
            description: "",
            taxRate: "0",
            dueDate: ""
        })
        setSelectedProject(null)
        setIsGenerateDialogOpen(false)
    }

    const handleProjectSelect = (projectId: string) => {
        const project = projects.find(p => p.id === projectId)
        setSelectedProject(project || null)
        setFormData(prev => ({ ...prev, projectId }))
    }

    const handleDownload = (invoiceId: string) => {
        // TODO: Implement PDF download
        console.log('Download invoice:', invoiceId)
    }

    const handleEdit = (invoice: Invoice) => {
        // TODO: Implement edit functionality
        console.log('Edit invoice:', invoice)
    }

    const handleDelete = (invoiceId: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId))
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800'
            case 'sent':
                return 'bg-blue-100 text-blue-800'
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'overdue':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <Edit className="h-4 w-4" />
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Invoices</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">{invoices.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {invoices.filter(i => i.status === 'paid').length} paid
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            {invoices.reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All invoices combined
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Paid Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            {invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Successfully collected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Pending Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            {invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting payment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Status Distribution</CardTitle>
                        <CardDescription>Invoices by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FreelancerInvoiceStatusChart />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Earnings Trend</CardTitle>
                        <CardDescription>Earnings over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FreelancerEarningsChart />
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Row */}
            <div className="flex bg-paper p-4 rounded-lg flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="p-2 bg-pale gap-3 md:min-w-[20vw] rounded flex items-center">
                    <div />
                    <input
                        value={searchTerm}
                        placeholder="Search invoices..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        type="text"
                        className="bg-none bg-transparent flex-1 text-sm outline-none border-none"
                    />
                    <Button className="bg-gray-900 hover:bg-gray-600">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-row items-center gap-2">
                    <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Generate Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Generate New Invoice</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleGenerateInvoice} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectId">Select Project</Label>
                                    <Select value={formData.projectId} onValueChange={handleProjectSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select project to invoice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map((project) => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.name} - {project.companyName} ({project.totalHours}h @ ${project.hourlyRate}/hr)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedProject && (
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
                                )}

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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!selectedProject}>
                                        Generate Invoice
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
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>View and manage your invoices</CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto max-w-[90vw]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                        <TableCell>{invoice.projectName}</TableCell>
                                        <TableCell>{invoice.companyName}</TableCell>
                                        <TableCell>{invoice.totalHours}h</TableCell>
                                        <TableCell>{invoice.hourlyRate}/hr</TableCell>
                                        <TableCell>{invoice.totalAmount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(invoice.status)}>
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(invoice.id)}
                                                    className="hover:bg-gray-200/50"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(invoice)}
                                                    className="hover:bg-gray-200/50"
                                                >
                                                    <Download className="h-4 w-4 mr-1" /> PDF
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {filteredInvoices.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} invoices
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


        </div>
    )
}
