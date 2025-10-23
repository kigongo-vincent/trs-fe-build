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
    Building2,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Users,
    FileText,
    DollarSign,
    Clock
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MotionBlock } from "@/components/MotionBlock"
import { FreelancerCompaniesChart } from "@/components/freelancer-charts"
import { ProjectStatusChart } from "@/components/project-status-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface Company {
    id: string
    name: string
    sector: string
    contactPerson: string
    email: string
    phone: string
    address: string
    createdAt: string
    totalProjects: number
    activeProjects: number
    totalEarnings: number
    status: 'active' | 'inactive'
}

const sectors = [
    { value: "technology", label: "Technology & IT" },
    { value: "finance", label: "Finance & Banking" },
    { value: "healthcare", label: "Healthcare & Pharmaceuticals" },
    { value: "education", label: "Education & Training" },
    { value: "retail", label: "Retail & E-commerce" },
    { value: "manufacturing", label: "Manufacturing & Production" },
    { value: "consulting", label: "Consulting & Professional Services" },
    { value: "legal", label: "Legal Services" },
    { value: "media", label: "Media & Entertainment" },
    { value: "nonprofit", label: "Non-profit & NGO" },
]

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState<Company | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const [formData, setFormData] = useState({
        name: "",
        sector: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: ""
    })

    useEffect(() => {
        // Set hardcoded companies data
        setCompanies([
            {
                id: "1",
                name: "TechCorp Inc",
                sector: "Technology & IT",
                contactPerson: "John Smith",
                email: "john@techcorp.com",
                phone: "+1-555-0123",
                address: "123 Tech Street, San Francisco, CA",
                createdAt: "2024-01-01",
                totalProjects: 1,
                activeProjects: 1,
                totalEarnings: 9000,
                status: "active"
            },
            {
                id: "2",
                name: "DesignStudio",
                sector: "Media & Entertainment",
                contactPerson: "Sarah Johnson",
                email: "sarah@designstudio.com",
                phone: "+1-555-0456",
                address: "456 Design Ave, New York, NY",
                createdAt: "2024-01-15",
                totalProjects: 1,
                activeProjects: 0,
                totalEarnings: 6800,
                status: "active"
            },
            {
                id: "8",
                name: "RetailMax",
                sector: "Retail & E-commerce",
                contactPerson: "Jennifer Lee",
                email: "jennifer@retailmax.com",
                phone: "+1-555-0258",
                address: "258 Commerce St, Seattle, WA",
                createdAt: "2024-04-15",
                totalProjects: 1,
                activeProjects: 1,
                totalEarnings: 15840,
                status: "active"
            }
        ])
        setLoading(false)
    }, [])

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (editingCompany) {
            // Update existing company
            setCompanies(prev => prev.map(company =>
                company.id === editingCompany.id
                    ? { ...company, ...formData }
                    : company
            ))
        } else {
            // Add new company
            const newCompany: Company = {
                id: Date.now().toString(),
                ...formData,
                createdAt: new Date().toISOString().split('T')[0],
                totalProjects: 0,
                activeProjects: 0,
                totalEarnings: 0,
                status: "active"
            }
            setCompanies(prev => [...prev, newCompany])
        }

        // Reset form
        setFormData({
            name: "",
            sector: "",
            contactPerson: "",
            email: "",
            phone: "",
            address: ""
        })
        setEditingCompany(null)
        setIsAddDialogOpen(false)
    }

    const handleEdit = (company: Company) => {
        setFormData({
            name: company.name,
            sector: company.sector,
            contactPerson: company.contactPerson,
            email: company.email,
            phone: company.phone,
            address: company.address
        })
        setEditingCompany(company)
        setIsAddDialogOpen(true)
    }

    const handleDelete = (companyId: string) => {
        setCompanies(prev => prev.filter(company => company.id !== companyId))
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
                                <span className="font-semibold">Companies</span>
                            </h1>
                            <p className="text-sm text-muted-foreground">Manage your client companies</p>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Company
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingCompany ? "Edit Company" : "Add New Company"}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Company Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter company name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sector">Sector</Label>
                                            <Select value={formData.sector} onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select sector" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectors.map((sector) => (
                                                        <SelectItem key={sector.value} value={sector.label}>
                                                            {sector.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contactPerson">Contact Person</Label>
                                            <Input
                                                id="contactPerson"
                                                value={formData.contactPerson}
                                                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                                                placeholder="Enter contact person name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Textarea
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                                placeholder="Enter company address"
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingCompany ? "Update Company" : "Add Company"}
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
                        <CardTitle className="text-sm font-normal">Total Companies</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">{companies.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {companies.filter(c => c.status === 'active').length} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Total Projects</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            {companies.reduce((sum, c) => sum + c.totalProjects, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all companies
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
                            {companies.reduce((sum, c) => sum + c.totalEarnings, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From all companies
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-normal">Active Projects</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-primary">
                            {companies.reduce((sum, c) => sum + c.activeProjects, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently in progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Companies Performance</CardTitle>
                        <CardDescription>Projects and earnings by company</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FreelancerCompaniesChart />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Company Status Distribution</CardTitle>
                        <CardDescription>Active vs inactive companies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProjectStatusChart
                            totalProjects={companies.length}
                            activeProjects={companies.filter(c => c.status === 'active').length}
                            completedProjects={0}
                            onHoldProjects={companies.filter(c => c.status === 'inactive').length}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Table Row */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center text-xl text-primary">
                                <span className="text-gradient">Companies</span>
                            </CardTitle>
                            <CardDescription>
                                Showing {filteredCompanies.length} companies
                            </CardDescription>
                        </div>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-auto max-w-[90vw]">
                    {filteredCompanies.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No companies found. Get started by adding your first company.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Sector</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Projects</TableHead>
                                    <TableHead>Earnings</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCompanies.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell className="font-medium">{company.name}</TableCell>
                                        <TableCell>{company.sector}</TableCell>
                                        <TableCell>{company.contactPerson}</TableCell>
                                        <TableCell>{company.totalProjects}</TableCell>
                                        <TableCell>{company.totalEarnings.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                                                {company.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(company)}
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
                                                                This action cannot be undone. This will permanently delete the company
                                                                <strong> "{company.name}"</strong> and remove all associated data.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(company.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete Company
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
                {filteredCompanies.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length} companies
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

            {filteredCompanies.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first company"}
                    </p>
                    {!searchTerm && (
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Company
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
