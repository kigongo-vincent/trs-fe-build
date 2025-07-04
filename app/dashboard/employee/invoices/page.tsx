'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, Eye, Filter, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MonthlySalaryChart } from "@/components/monthly-salary-chart"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useEffect, useState } from "react"
import { format, addDays, isAfter, isBefore, isEqual, startOfMonth, endOfMonth } from "date-fns"
import {
  InvoiceSummaryData,
  MonthlySalaryData,
  Invoice,
  fetchInvoiceSummary,
  fetchMonthlySalary,
  fetchInvoices
} from "@/services/employee"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/date-range-picker"
import { format as formatDateFns } from "date-fns"

export default function InvoicesPage() {
  const [summaryData, setSummaryData] = useState<InvoiceSummaryData>({
    currentMonth: { amount: 0, hours: 0 },
    lastMonth: { amount: 0, hours: 0 },
    yearToDate: { amount: 0, invoiceCount: 0 },
    hourlyRate: 0
  })
  const [monthlySalaryData, setMonthlySalaryData] = useState<MonthlySalaryData[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResult, salaryResult, invoicesResult] = await Promise.all([
          fetchInvoiceSummary(),
          fetchMonthlySalary(),
          fetchInvoices()
        ])
        setSummaryData(summaryResult)
        setMonthlySalaryData(salaryResult)
        setInvoices(Array.isArray(invoicesResult) ? invoicesResult : [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Set default date range to current month on mount if not set
  useEffect(() => {
    if (!dateRange) {
      const now = new Date()
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper to format date as DD-MM-YYYY for API
  const formatDateForAPI = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Fetch invoices when dateRange changes
  useEffect(() => {
    const fetchFilteredInvoices = async () => {
      setIsInvoicesLoading(true)
      try {
        let invoicesResult: Invoice[]
        if (dateRange?.from && dateRange?.to) {
          invoicesResult = await fetchInvoices(
            formatDateForAPI(dateRange.from),
            formatDateForAPI(dateRange.to)
          )
        } else {
          invoicesResult = await fetchInvoices()
        }
        setInvoices(Array.isArray(invoicesResult) ? invoicesResult : [])
      } catch (error) {
        console.error("Error fetching filtered invoices:", error)
      } finally {
        setIsInvoicesLoading(false)
      }
    }
    fetchFilteredInvoices()
  }, [dateRange])

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

  const getStatusBadgeStyles = (status: Invoice['status']) => {
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

  // Helper for date range label
  const getDateRangeLabel = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'LLL dd, yyyy')} - ${format(dateRange.to, 'LLL dd, yyyy')}`
    }
    if (dateRange?.from) {
      return format(dateRange.from, 'LLL dd, yyyy')
    }
    return 'Filter by date range'
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
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Month</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summaryData.currentMonth.amount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Based on {summaryData.currentMonth.hours} hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summaryData.lastMonth.amount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Based on {summaryData.lastMonth.hours} hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summaryData.yearToDate.amount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{summaryData.yearToDate.invoiceCount} invoices processed</p>
              </CardContent>
            </Card>
            {/* i  */}
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Salary</CardTitle>
          <CardDescription>Your salary over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <MonthlySalaryChart data={monthlySalaryData} />
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
          <div className="w-[300px]">
            <DateRangePicker
              className="w-full"
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
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
                      {format(new Date(invoice.periodStart), 'MMM yyyy')}
                    </TableCell>
                    <TableCell>{invoice.hours}</TableCell>
                    <TableCell>${(invoice.amount / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeStyles(invoice.status)}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.processedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/employee/invoices/${invoice.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
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
    </div>
  )
}
