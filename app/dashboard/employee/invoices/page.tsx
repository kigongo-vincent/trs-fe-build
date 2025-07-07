'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, Eye, Filter, Search, Calendar, Building2, Mail, Phone, MapPin, Info } from "lucide-react"
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

export default function InvoicesPage() {
  const [summaryData, setSummaryData] = useState<ConsultantInvoiceSummaryItem[]>([])
  const [monthlySummaryData, setMonthlySummaryData] = useState<ConsultantMonthlySummaryItem[]>([])
  const [invoices, setInvoices] = useState<ConsultantInvoiceListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  // Hardcoded invoice data
  const hardcodedInvoice = {
    invoiceNumber: 'INV-2024-001',
    status: 'paid',
    createdAt: '2024-05-01T00:00:00Z',
    startDate: '2024-05-01T00:00:00Z',
    endDate: '2024-05-31T23:59:59Z',
    updatedAt: '2024-05-31T12:00:00Z',
    totalHours: 160,
    amount: 8000,
    user: {
      fullName: 'Jane Doe',
      jobTitle: 'Software Engineer',
      email: 'jane.doe@example.com',
      phoneNumber: '+1 555-1234',
      company: {
        name: 'Acme Corp',
        sector: 'Technology',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          country: 'USA',
        },
      },
      bankDetails: {
        bankName: 'Bank of America',
        branch: 'Springfield',
        accountName: 'Jane Doe',
        accountNumber: '123456789',
        swiftCode: 'BOFAUS3N',
      },
      grossPay: 50, // hourly rate
    },
    description: 'Consulting services for May 2024.',
    projectDetails: [
      { name: 'Project Alpha', hours: 80, entries: 20 },
      { name: 'Project Beta', hours: 80, entries: 18 },
    ],
  }
  const currency = 'USD'
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

  // Remove frontend date filtering, only filter by status
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    return true
  })

  // Helper to get currency code (default to USD)
  function getCurrencyCode(currency?: string) {
    return currency ? currency.toUpperCase() : 'USD';
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Invoices</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export All
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
          <CardDescription>Your earnings over the past 12 months</CardDescription>
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
          <Input type="text" placeholder="Search invoices..." className="h-9" />
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
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
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
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoiceId(invoice.id); setModalOpen(true); }}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        {invoice.status === 'paid' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" /> PDF
                          </Button>
                        )}
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl p-0 min-w-[60vw] max-h-[95vh] bg-gray-50 overflow-y-auto">
          <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">{hardcodedInvoice.invoiceNumber}</CardDescription>
              <div className="bg-primary text-white px-4 py-6 rounded mt-2">
                <span className="text-lg font-bold">{hardcodedInvoice.user.company.name}</span>
                <span className="block text-blue-100 text-xs">{hardcodedInvoice.user.company.sector}</span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full w-[max-content] text-xs font-medium border mt-2 ${getStatusColor(hardcodedInvoice.status)}`}>{hardcodedInvoice.status?.toUpperCase()}</div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-neutral-800 border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center text-primary"><Calendar className="w-4 h-4 mr-2 text-primary" />Invoice Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Issue Date:</span><span className="font-medium">{formatDate(hardcodedInvoice.createdAt)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Period:</span><span className="font-medium">{formatDate(hardcodedInvoice.startDate)} - {formatDate(hardcodedInvoice.endDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Last Updated:</span><span className="font-medium">{formatDate(hardcodedInvoice.updatedAt)}</span></div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-neutral-800 border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center text-primary"><Building2 className="w-4 h-4 mr-2 text-primary" />Consultant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="font-semibold text-gray-900 dark:text-white">{hardcodedInvoice.user.fullName}</span><span className="block text-gray-600 dark:text-gray-300 capitalize">{hardcodedInvoice.user.jobTitle} Consultant</span></div>
                    <div className="flex items-center text-muted-foreground"><Mail className="w-4 h-4 mr-2" /><span>{hardcodedInvoice.user.email}</span></div>
                    <div className="flex items-center text-muted-foreground"><Phone className="w-4 h-4 mr-2" /><span>{hardcodedInvoice.user.phoneNumber}</span></div>
                    <div className="flex items-start text-muted-foreground"><MapPin className="w-4 h-4 mr-2 mt-1" /><span>{hardcodedInvoice.user.company.address.street}, {hardcodedInvoice.user.company.address.city}, {hardcodedInvoice.user.company.address.state}, {hardcodedInvoice.user.company.address.country}</span></div>
                  </CardContent>
                </Card>
              </div>
              <Card className=" dark:bg-blue-900/30 border-none">
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-primary">Service Description</CardTitle></CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-200 text-sm">{hardcodedInvoice.description}</CardContent>
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
                        <td className="px-4 py-3"><span className="font-medium text-gray-900 dark:text-white">Consulting Services</span><span className="block text-xs text-gray-500 dark:text-gray-400">Period: {formatDate(hardcodedInvoice.startDate)} to {formatDate(hardcodedInvoice.endDate)}</span></td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{hardcodedInvoice.totalHours}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{formatCurrency(hardcodedInvoice.user.grossPay, currency)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(hardcodedInvoice.amount, currency)}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-neutral-800 border-none">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal:</span><span>{formatCurrency(hardcodedInvoice.amount, currency)}</span></div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Tax:</span><span>{formatCurrency(0, currency)}</span></div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white items-center"><span className="flex items-center gap-1">Total:<TooltipProvider><Tooltip><TooltipTrigger asChild><span tabIndex={0}><Info className="w-4 h-4 text-primary ml-1" /></span></TooltipTrigger><TooltipContent><span>Currency: {currency} <br />Source: Company</span></TooltipContent></Tooltip></TooltipProvider></span><span>{formatCurrency(hardcodedInvoice.amount, currency)}</span></div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-right">Showing amounts in <span className="font-semibold">{currency}</span> (Company currency)</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:from-neutral-900 dark:to-blue-950 border-none">
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center text-primary"><Info className="w-4 h-4 mr-2 text-primary" />Payment Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Bank Name</span><span className="block font-medium">{hardcodedInvoice.user.bankDetails.bankName}</span></div>
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Branch</span><span className="block font-medium">{hardcodedInvoice.user.bankDetails.branch}</span></div>
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Account Name</span><span className="block font-medium">{hardcodedInvoice.user.bankDetails.accountName}</span></div>
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Account Number</span><span className="block font-medium">{hardcodedInvoice.user.bankDetails.accountNumber}</span></div>
                  <div className="md:col-span-2"><span className="text-xs text-gray-600 dark:text-gray-300">SWIFT Code</span><span className="block font-medium">{hardcodedInvoice.user.bankDetails.swiftCode}</span></div>
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter className="flex-col border-t pt-4">
              <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
                <p>Thank you for your business!</p>
                <p className="mt-1">For any questions regarding this invoice, please contact {hardcodedInvoice.user.email}</p>
              </div>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}
