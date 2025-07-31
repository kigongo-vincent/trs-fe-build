'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, Eye, Filter, Search, Calendar, Building2, Mail, Phone, MapPin, Info, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { MonthlySalaryChart } from "@/components/monthly-salary-chart"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useEffect, useState } from "react"
import { format, addDays, isAfter, isBefore, isEqual, startOfMonth, endOfMonth } from "date-fns"
import {
  ConsultantInvoiceSummaryItem,
  ConsultantInvoiceListItem,
  ConsultantMonthlySummaryItem,
  fetchConsultantInvoiceSummary,
  fetchConsultantInvoices,
  fetchConsultantMonthlySummary
} from "@/services/consultants"
import { getAuthData } from "@/services/auth"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/date-range-picker"
import { format as formatDateFns } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Printer, ArrowLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { generatePdf } from "@/utils/GeneratePDF"
import { toast } from "sonner"

export default function InvoicesPage() {
  const [summaryData, setSummaryData] = useState<ConsultantInvoiceSummaryItem[]>([])
  const [monthlySummaryData, setMonthlySummaryData] = useState<ConsultantMonthlySummaryItem[]>([])
  const [invoices, setInvoices] = useState<ConsultantInvoiceListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<ConsultantInvoiceListItem | null>(null)
  const [userSession, setUserSession] = useState<any>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Get user session data
  useEffect(() => {
    const authData = getAuthData()
    if (authData?.user) {
      setUserSession(authData.user)
    }
  }, [])

  const currency = userSession?.company?.currency || 'USD'
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  const formatCurrency = (amount: any, code = 'USD') => {
    return `${code} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResult, monthlySummaryResult, invoicesResult] = await Promise.all([
          fetchConsultantInvoiceSummary(),
          fetchConsultantMonthlySummary(),
          fetchConsultantInvoices()
        ])
        setSummaryData(Array.isArray(summaryResult) ? summaryResult : [])
        setMonthlySummaryData(Array.isArray(monthlySummaryResult) ? monthlySummaryResult : [])
        setInvoices(Array.isArray(invoicesResult) ? invoicesResult : [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const SummaryCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28 mb-2 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </CardContent>
    </Card>
  )

  const TableRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </TableCell>
    </TableRow>
  )

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800'
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800'
      default:
        return ''
    }
  }

  // Filter invoices by status and search query
  const filteredInvoices = invoices.filter((inv) => {
    // Filter by status
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false

    // Filter by search query (invoice number or period)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const invoiceNumber = inv.invoiceNumber?.toLowerCase() || ''
      const period = format(new Date(inv.startDate), 'MMM yyyy').toLowerCase()

      if (!invoiceNumber.includes(query) && !period.includes(query)) {
        return false
      }
    }

    return true
  })

  // Helper to get currency code (default to USD)
  function getCurrencyCode(currency?: string) {
    return currency ? currency.toUpperCase() : 'USD';
  }

  // Generate PDF for a single invoice
  const generateInvoicePdf = async (invoice: ConsultantInvoiceListItem) => {
    if (!userSession) return

    setIsGeneratingPdf(true)
    try {
      const invoiceHtml = generateInvoiceHtml(invoice)
      await generatePdf(invoiceHtml)
      toast.success(`Invoice ${invoice.invoiceNumber} generated successfully!`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Generate PDF for all filtered invoices
  const generateFilteredInvoicesPdf = async () => {
    if (!userSession || filteredInvoices.length === 0) {
      toast.error('No invoices to generate PDF for.')
      return
    }

    setIsGeneratingPdf(true)
    try {
      const invoicesHtml = generateInvoicesSummaryHtml()
      await generatePdf(invoicesHtml)
      toast.success(`Generated PDF for ${filteredInvoices.length} invoices!`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Generate HTML for a single invoice
  const generateInvoiceHtml = (invoice: ConsultantInvoiceListItem) => {
    const statusColor = getStatusColor(invoice.status)
    const statusText = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)

    return `
      <div class="bg-white p-8 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="border-b-2 border-gray-300 pb-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p class="text-lg text-gray-600">${invoice.invoiceNumber}</p>
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
          <h2 class="text-xl font-bold mb-1">${userSession?.company?.name || 'Company Name'}</h2>
          <p class="text-blue-100 text-sm">${userSession?.company?.sector || 'Sector'}</p>
        </div>

        <!-- Invoice Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Invoice Details
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Issue Date:</span>
                <span class="font-medium">${formatDate(invoice.createdAt)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Period:</span>
                <span class="font-medium">${formatDate(invoice.startDate)} - ${formatDate(invoice.endDate)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Last Updated:</span>
                <span class="font-medium">${formatDate(invoice.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Consultant Information
            </h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="font-semibold text-gray-900">${userSession?.fullName || 'Consultant Name'}</span>
                <p class="text-gray-600 capitalize">${userSession?.jobTitle || 'Consultant'} Consultant</p>
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>${userSession?.email || 'email@example.com'}</span>
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>${userSession?.phoneNumber || 'Phone Number'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Description -->
        <div class="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Service Description</h3>
          <p class="text-gray-700">${invoice.description || 'Consulting services for the specified period.'}</p>
        </div>

        <!-- Invoice Items -->
        <div class="bg-white border border-gray-200 rounded-lg mb-6">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">Invoice Items</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Description</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hours</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Rate</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr>
                  <td class="px-4 py-3">
                    <span class="font-medium text-gray-900">Consulting Services</span>
                    <p class="text-xs text-gray-500">Period: ${formatDate(invoice.startDate)} to ${formatDate(invoice.endDate)}</p>
                  </td>
                  <td class="px-4 py-3 text-center text-gray-900">${invoice.totalHours}</td>
                  <td class="px-4 py-3 text-center text-gray-900">${formatCurrency(invoice.amount && invoice.totalHours ? Number(invoice.amount) / Number(invoice.totalHours) : 0, currency)}</td>
                  <td class="px-4 py-3 text-right font-medium text-gray-900">${formatCurrency(invoice.amount, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Total -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.amount, currency)}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Tax:</span>
              <span>${formatCurrency(0, currency)}</span>
            </div>
            <div class="border-t pt-2">
              <div class="flex justify-between text-base font-bold text-gray-900">
                <span>Total:</span>
                <span>${formatCurrency(invoice.amount, currency)}</span>
              </div>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-right">
            Showing amounts in <span class="font-semibold">${currency}</span> (Company currency)
          </div>
        </div>

        <!-- Payment Information -->
        <div class="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Payment Information
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-300 text-xs">Bank Name</span>
              <p class="font-medium">${userSession?.bankDetails?.bankName || 'N/A'}</p>
            </div>
            <div>
              <span class="text-gray-300 text-xs">Branch</span>
              <p class="font-medium">${userSession?.bankDetails?.branch || 'N/A'}</p>
            </div>
            <div>
              <span class="text-gray-300 text-xs">Account Name</span>
              <p class="font-medium">${userSession?.bankDetails?.accountName || 'N/A'}</p>
            </div>
            <div>
              <span class="text-gray-300 text-xs">Account Number</span>
              <p class="font-medium">${userSession?.bankDetails?.accountNumber || 'N/A'}</p>
            </div>
            <div class="md:col-span-2">
              <span class="text-gray-300 text-xs">SWIFT Code</span>
              <p class="font-medium">${userSession?.bankDetails?.swiftCode || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-gray-500 text-xs border-t pt-4">
          <p>Thank you for your business!</p>
          <p class="mt-1">For any questions regarding this invoice, please contact ${userSession?.email || 'support@company.com'}</p>
        </div>
      </div>
    `
  }

  // Generate HTML for invoices summary
  const generateInvoicesSummaryHtml = () => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const totalHours = filteredInvoices.reduce((sum, inv) => sum + Number(inv.totalHours), 0)

    return `
      <div class="bg-white p-8 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="border-b-2 border-gray-300 pb-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">INVOICES SUMMARY</h1>
              <p class="text-lg text-gray-600">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">
                <p>Total Invoices: ${filteredInvoices.length}</p>
                <p>Total Amount: ${formatCurrency(totalAmount, currency)}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Info -->
        <div class="bg-primary text-white p-6 rounded-lg mb-6">
          <h2 class="text-xl font-bold mb-1">${userSession?.company?.name || 'Company Name'}</h2>
          <p class="text-blue-100 text-sm">${userSession?.company?.sector || 'Sector'}</p>
        </div>

        <!-- Consultant Info -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Consultant Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Name:</span>
              <p class="font-medium">${userSession?.fullName || 'Consultant Name'}</p>
            </div>
            <div>
              <span class="text-gray-600">Email:</span>
              <p class="font-medium">${userSession?.email || 'email@example.com'}</p>
            </div>
            <div>
              <span class="text-gray-600">Phone:</span>
              <p class="font-medium">${userSession?.phoneNumber || 'Phone Number'}</p>
            </div>
            <div>
              <span class="text-gray-600">Position:</span>
              <p class="font-medium capitalize">${userSession?.jobTitle || 'Consultant'}</p>
            </div>
          </div>
        </div>

        <!-- Invoices Table -->
        <div class="bg-white border border-gray-200 rounded-lg mb-6">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">Invoice Details</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Invoice #</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Period</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hours</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-900">Amount</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${filteredInvoices.map(invoice => `
                  <tr>
                    <td class="px-4 py-3">
                      <span class="font-medium text-gray-900">${invoice.invoiceNumber}</span>
                    </td>
                    <td class="px-4 py-3 text-gray-900">
                      ${format(new Date(invoice.startDate), 'MMM yyyy')}
                    </td>
                    <td class="px-4 py-3 text-center text-gray-900">${invoice.totalHours}</td>
                    <td class="px-4 py-3 text-right font-medium text-gray-900">
                      ${formatCurrency(invoice.amount, currency)}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="">
                        ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">My Invoices</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateFilteredInvoicesPdf}
            disabled={isGeneratingPdf || filteredInvoices.length === 0}
          >
            {isGeneratingPdf ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Export Filtered ({filteredInvoices.length})
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          summaryData.map((item, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {item.amount !== null
                    ? `${Number(item.amount).toFixed(2)} ${getCurrencyCode(item.currency)}`
                    : '--'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
          <CardDescription>Your earnings over the past 8 months</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <MonthlySalaryChart data={monthlySummaryData} />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search invoices..."
            className="h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button> */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Processed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isLoading || isInvoicesLoading) ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      {`${format(new Date(invoice.startDate), 'MMM yyyy')}`}
                    </TableCell>
                    <TableCell>{invoice.totalHours}</TableCell>
                    <TableCell>
                      {Number(invoice.amount).toFixed(2)} {getCurrencyCode(invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeStyles(invoice.status)}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.updatedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(invoice); setModalOpen(true); }}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateInvoicePdf(invoice)}
                          disabled={isGeneratingPdf}
                        >
                          {isGeneratingPdf ? (
                            <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Download className="h-4 w-4 mr-1" />
                          )}
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && userSession && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl p-0 min-w-[60vw] max-h-[95vh] bg-gray-50 overflow-y-auto">
            <Card className="shadow-none border-none bg-transparent">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-300">{selectedInvoice?.invoiceNumber}</CardDescription>
                <div className="bg-primary text-white px-4 py-6 rounded mt-2">
                  <span className="text-lg font-bold">{userSession?.company?.name}</span>
                  <span className="block text-blue-100 text-xs">{userSession?.company?.sector}</span>
                </div>
                <div className={`inline-block px-3 py-1 rounded-full w-[max-content] text-xs font-medium border mt-2 ${getStatusColor(selectedInvoice?.status || '')}`}>{selectedInvoice?.status?.toUpperCase()}</div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white dark:bg-neutral-800 border-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center text-primary"><Calendar className="w-4 h-4 mr-2 text-primary" />Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Issue Date:</span><span className="font-medium">{formatDate(selectedInvoice?.createdAt || '')}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Period:</span><span className="font-medium">{formatDate(selectedInvoice?.startDate || '')} - {formatDate(selectedInvoice?.endDate || '')}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Last Updated:</span><span className="font-medium">{formatDate(selectedInvoice?.updatedAt || '')}</span></div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-neutral-800 border-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center text-primary"><Building2 className="w-4 h-4 mr-2 text-primary" />Consultant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><span className="font-semibold text-gray-900 dark:text-white">{userSession?.fullName}</span><span className="block text-gray-600 dark:text-gray-300 capitalize">{userSession?.jobTitle} Consultant</span></div>
                      <div className="flex items-center text-muted-foreground"><Mail className="w-4 h-4 mr-2" /><span>{userSession?.email}</span></div>
                      <div className="flex items-center text-muted-foreground"><Phone className="w-4 h-4 mr-2" /><span>{userSession?.phoneNumber}</span></div>
                      <div className="flex items-start text-muted-foreground"><MapPin className="w-4 h-4 mr-2 mt-1" /><span>{userSession?.company?.address?.street}, {userSession?.company?.address?.city}, {userSession?.company?.address?.state}, {userSession?.company?.address?.country}</span></div>
                    </CardContent>
                  </Card>
                </div>
                <Card className=" dark:bg-blue-900/30 border-none">
                  <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-primary">Service Description</CardTitle></CardHeader>
                  <CardContent className="text-gray-700 dark:text-gray-200 text-sm">{selectedInvoice?.description}</CardContent>
                </Card>
                <Card className=" dark:border-neutral-700">
                  <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-primary">Invoice Items</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-neutral-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Description</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">Hours</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">Rate</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">Amount</th>
                        </tr>
                      </thead>
                      <tbody className=" dark:bg-neutral-900  divide-gray-200 dark:divide-neutral-800">
                        <tr>
                          <td className="px-4 py-3"><span className="font-medium text-gray-900 dark:text-white">Consulting Services</span><span className="block text-xs text-gray-500 dark:text-gray-400">Period: {formatDate(selectedInvoice?.startDate || '')} to {formatDate(selectedInvoice?.endDate || '')}</span></td>
                          <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{selectedInvoice?.totalHours}</td>
                          <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{formatCurrency(selectedInvoice?.amount && selectedInvoice?.totalHours ? Number(selectedInvoice.amount) / Number(selectedInvoice.totalHours) : 0, currency)}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(selectedInvoice?.amount, currency)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-neutral-800 border-none">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal:</span><span>{formatCurrency(selectedInvoice?.amount, currency)}</span></div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Tax:</span><span>{formatCurrency(0, currency)}</span></div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white items-center"><span className="flex items-center gap-1">Total:<TooltipProvider><Tooltip><TooltipTrigger asChild><span tabIndex={0}><Info className="w-4 h-4 text-primary ml-1" /></span></TooltipTrigger><TooltipContent><span>Currency: {currency} <br />Source: Company</span></TooltipContent></Tooltip></TooltipProvider></span><span>{formatCurrency(selectedInvoice?.amount, currency)}</span></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground text-right">Showing amounts in <span className="font-semibold">{currency}</span> (Company currency)</div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:from-neutral-900 dark:to-blue-950 border-none">
                  <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center text-primary"><Info className="w-4 h-4 mr-2 text-primary" />Payment Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><span className="text-xs text-gray-600 dark:text-gray-300">Bank Name</span><span className="block font-medium">{userSession?.bankDetails?.bankName}</span></div>
                    <div><span className="text-xs text-gray-600 dark:text-gray-300">Branch</span><span className="block font-medium">{userSession?.bankDetails?.branch}</span></div>
                    <div><span className="text-xs text-gray-600 dark:text-gray-300">Account Name</span><span className="block font-medium">{userSession?.bankDetails?.accountName}</span></div>
                    <div><span className="text-xs text-gray-600 dark:text-gray-300">Account Number</span><span className="block font-medium">{userSession?.bankDetails?.accountNumber}</span></div>
                    <div className="md:col-span-2"><span className="text-xs text-gray-600 dark:text-gray-300">SWIFT Code</span><span className="block font-medium">{userSession?.bankDetails?.swiftCode}</span></div>
                  </CardContent>
                </Card>
              </CardContent>
              <CardFooter className="flex-col border-t pt-4">
                <div className="flex justify-center gap-2 mb-4">
                  <Button
                    onClick={() => generateInvoicePdf(selectedInvoice)}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingPdf ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download PDF
                  </Button>
                </div>
                <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
                  <p>Thank you for your business!</p>
                  <p className="mt-1">For any questions regarding this invoice, please contact {userSession?.email}</p>
                </div>
              </CardFooter>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
