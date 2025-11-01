"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Download, Eye, FileText, Plus, Search, FileDown, Triangle, X as XIcon, Calendar, Building2, Mail, Phone, MapPin, CreditCard, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { MonthlyInvoiceChart } from "@/components/monthly-invoice-chart"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { useMemo } from "react"
import { createInvoiceApproval, getCompanyInvoicesSummary, getCompanyPaidInvoicesByMonth, getRequest, fetchApproverActions, ApproverAction, postRequest } from "@/services/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { getAuthData } from "@/services/auth"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { generatePdf, generatePdfAsBlob } from "@/utils/GeneratePDF"
import JSZip from "jszip"
import { Invoice } from "@/services/employee"
import { User } from "@/services/departments"
import * as Tabz from "@radix-ui/react-tabs";

// Helper function for date formatting (top-level, shared)
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}


function getInvoiceDateRange(invoices: Invoice[]): string {

  let startDate = new Date(invoices[0].createdAt);
  let endDate = new Date(invoices[0].createdAt);
  invoices.forEach((invoice) => {
    const createdAt = new Date(invoice.createdAt);
    if (createdAt < startDate) {
      startDate = createdAt;
    }
    if (createdAt > endDate) {
      endDate = createdAt;
    }
  });

  return `${formatDate(startDate.toISOString())} - ${formatDate(endDate.toISOString())}`;
}

// Utility for PDF table rendering with page breaks
function renderTableWithPageBreaks(doc: any, headers: string[], rows: string[][], startY: number, options: { columnWidths: number[], marginLeft: number, marginRight: number }) {
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()
  const { columnWidths, marginLeft, marginRight } = options
  let y = startY
  const rowHeight = 22
  doc.setFontSize(11)
  // Render header
  doc.setFont(undefined, 'bold')
  let x = marginLeft
  headers.forEach((header, i) => {
    doc.rect(x, y, columnWidths[i], rowHeight, 'S')
    doc.text(header, x + 6, y + 15, { maxWidth: columnWidths[i] - 12 })
    x += columnWidths[i]
  })
  doc.setFont(undefined, 'normal')
  y += rowHeight
  // Render rows
  for (let r = 0; r < rows.length; r++) {
    if (y + rowHeight > pageHeight - 32) {
      doc.addPage()
      y = 32
      // Clear background for new page (optional, for white background)
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      // Repeat header
      x = marginLeft
      doc.setFont(undefined, 'bold')
      headers.forEach((header, i) => {
        doc.rect(x, y, columnWidths[i], rowHeight, 'S')
        doc.text(header, x + 6, y + 15, { maxWidth: columnWidths[i] - 12 })
        x += columnWidths[i]
      })
      doc.setFont(undefined, 'normal')
      y += rowHeight
    }
    x = marginLeft
    rows[r].forEach((cell, i) => {
      doc.rect(x, y, columnWidths[i], rowHeight, 'S')
      doc.text(String(cell), x + 6, y + 15, { maxWidth: columnWidths[i] - 12 })
      x += columnWidths[i]
    })
    y += rowHeight
  }
  return y
}

export default function InvoicesPage() {
  const [summary, setSummary] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Filter states
  const [status, setStatus] = useState("processing")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [filterLoading, setFilterLoading] = useState(false)
  const [filterParams, setFilterParams] = useState<{ status: string, startDate: string, endDate: string }>({ status: "processing", startDate: "", endDate: "" })

  // Track selected invoice count for button text
  const [selectedInvoiceCount, setSelectedInvoiceCount] = useState(0)

  // Add a ref to InvoiceTable for PDF download and selected count
  const invoiceTableRef = useRef<{ handleAllInvoicesPDF: () => void; handleExportAllInvoicesPDF: () => void; selectedCount: number } | null>(null)

  // Get boardMemberRole from session
  const authData = getAuthData();
  const companyCurrency = authData?.user?.company?.currency
  const boardMemberRole = authData?.user?.boardMemberRole || null;
  const roleName = authData?.user?.role?.name || null;

  // Selected currency for the Total Amount card
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD")

  // Compute totals per currency from paid-by-month multi-series
  const fetchSummaryWithRetry = async (retryAttempt = 0) => {
    setLoading(true)
    setError(null)
    try {
      const authData = getAuthData()
      const companyId = authData?.user?.company?.id
      if (!companyId) throw new Error("Company ID not found")

      // Add timeout to prevent long waits
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 8000)
      )

      const fetchPromise = getCompanyInvoicesSummary(companyId)
      const res: any = await Promise.race([fetchPromise, timeoutPromise])

      setSummary(res.data)
      setRetryCount(0) // Reset retry count on success
    } catch (err: any) {
      const isServerOverload = err.message?.includes("Server is temporarily overloaded")
      const isTimeout = err.message?.includes("Request timeout")

      if ((isServerOverload || isTimeout) && retryAttempt < 2) {
        // Reduced delay for faster retries (500ms, 1000ms)
        const delay = Math.pow(2, retryAttempt) * 500
        setTimeout(() => {
          fetchSummaryWithRetry(retryAttempt + 1)
        }, delay)
        return
      }
      setError(err.message || "Failed to fetch summary")
      setRetryCount(retryAttempt)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    fetchSummaryWithRetry(0)
    setTimeout(() => setIsRetrying(false), 1000)
  }

  useEffect(() => {
    fetchSummaryWithRetry()
  }, [])

  // Find the currency from the summary data (if present)
  const totalAmountItem = summary?.find((item) => item.label === "Total Amount")
  const currency = totalAmountItem?.currency || "USD"
  const showDisclaimer = !totalAmountItem?.currency || totalAmountItem.currency !== "USD"

  // State for monthly invoice chart data
  const [monthlyInvoiceData, setMonthlyInvoiceData] = useState<Array<{ month: string, totalAmount: number, currency: string }>>([])
  const [monthlyChartLoading, setMonthlyChartLoading] = useState(true)
  const [monthlyChartError, setMonthlyChartError] = useState<string | null>(null)
  const [monthlyMultiSeries, setMonthlyMultiSeries] = useState<{
    currencies: string[]
    data: Array<{ month: string;[currency: string]: number | string }>
  } | null>(null)
  // Derive display currency to ensure UI reflects active selection
  const displayCurrency = useMemo(() => {
    const available = monthlyMultiSeries?.currencies || []
    if (available.length === 0) return selectedCurrency || companyCurrency || "USD"
    return available.includes(selectedCurrency) ? selectedCurrency : available[0]
  }, [selectedCurrency, monthlyMultiSeries, companyCurrency])

  // Compute totals per currency from paid-by-month multi-series
  const computedCurrencyTotals: Record<string, number> = useMemo(() => {
    if (!monthlyMultiSeries || !Array.isArray(monthlyMultiSeries.data)) return {}
    const totals: Record<string, number> = {}
    const codes = monthlyMultiSeries.currencies || []
    // Initialize totals
    codes.forEach(code => { totals[code] = 0 })
    // Sum values per currency across months
    monthlyMultiSeries.data.forEach((row) => {
      codes.forEach((code) => {
        const value = Number(row[code] as number)
        totals[code] = (totals[code] || 0) + (isNaN(value) ? 0 : value)
      })
    })
    return totals
  }, [monthlyMultiSeries])

  // Align selected currency to available currencies from API
  useEffect(() => {
    if (monthlyMultiSeries && monthlyMultiSeries.currencies?.length) {
      setSelectedCurrency((prev) => {
        const available = monthlyMultiSeries.currencies
        // If current selection is missing, fallback to first available currency
        if (!prev || !available.includes(prev)) {
          return available[0]
        }
        return prev
      })
    }
  }, [monthlyMultiSeries])

  useEffect(() => {
    const fetchMonthlyChart = async () => {
      setMonthlyChartLoading(true)
      setMonthlyChartError(null)
      try {
        const authData = getAuthData()
        const companyId = authData?.user?.company?.id
        if (!companyId) throw new Error("Company ID not found")
        const res: any = await getCompanyPaidInvoicesByMonth(companyId)
        // Normalize data to match multi-series chart props
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ]

        const api = res?.data || {}
        const currencies: string[] = Array.isArray(api?.currencies) ? api.currencies : []
        const apiData: any[] = Array.isArray(api?.data) ? api.data : []

        // Build filled multi-series data for all 12 months with zeros for missing entries
        const filledMulti = months.map((month) => {
          const match = apiData.find((item: any) => item?.month === month)
          const row: { month: string;[key: string]: number | string } = { month }
          currencies.forEach((code) => {
            const value = match && typeof match[code] !== 'undefined' ? Number(match[code]) : 0
            row[code] = isNaN(value) ? 0 : value
          })
          return row
        })

        setMonthlyMultiSeries({ currencies, data: filledMulti })

        // Also keep single-series fallback aligned to the first currency if needed
        const primaryCurrency = currencies[0] || currency || "USD"
        const singleSeries = months.map((month) => {
          const match = apiData.find((item: any) => item?.month === month)
          const amount = match && primaryCurrency in (match || {}) ? Number(match[primaryCurrency]) : 0
          return { month, totalAmount: isNaN(amount) ? 0 : amount, currency: primaryCurrency }
        })
        setMonthlyInvoiceData(singleSeries)
      } catch (err: any) {
        setMonthlyChartError(err.message || "Failed to fetch chart data")
      } finally {
        setMonthlyChartLoading(false)
      }
    }
    fetchMonthlyChart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency])

  const handleSearch = async () => {
    setSearchLoading(true)
    setTimeout(() => {
      setSearchTerm(searchValue)
      setFilterParams({ status: "all", startDate: "", endDate: "" })
      setSearchLoading(false)
    }, 1000)
  }

  const handleClearSearch = () => {
    setSearchValue("")
    setSearchTerm("")
    setFilterParams({ status: "all", startDate: "", endDate: "" })
  }

  const handleFilterSubmit = async () => {
    setFilterLoading(true)
    setTimeout(() => {
      setFilterParams({ status, startDate, endDate })
      setSearchTerm("")
      setFilterLoading(false)
    }, 1000)
  }

  const handleClearFilters = () => {
    setStatus("processing")
    setStartDate("")
    setEndDate("")
    setFilterParams({ status: "processing", startDate: "", endDate: "" })
  }

  // Auto-apply filter when status changes from tabs
  useEffect(() => {
    setFilterParams({ status, startDate, endDate })
    setSearchTerm("") // Clear search when filtering by status
  }, [status, startDate, endDate])

  const isFilterActive = status !== "processing" || !!startDate || !!endDate

  // Handler to trigger PDF from top button
  const handleTopDownloadPDF = () => {
    invoiceTableRef.current?.handleAllInvoicesPDF()
  }

  // Handler to export all invoices matching current filters
  const handleExportAllInvoices = () => {
    invoiceTableRef.current?.handleExportAllInvoicesPDF()
  }

  // Get export button text based on active filters or selected invoices
  const getExportButtonText = () => {
    if (selectedInvoiceCount > 0) {
      return `Export ${selectedInvoiceCount} Selected`
    }

    if (searchTerm) {
      return `Export Matching (${searchTerm})`
    }
    if (filterParams?.status) {
      const statusLabel = filterParams.status.charAt(0).toUpperCase() + filterParams.status.slice(1)
      return `Export All ${statusLabel}`
    }
    if (filterParams?.startDate || filterParams?.endDate) {
      return 'Export Filtered'
    }
    return 'Export All Invoices'
  }

  return (
    <div className="flex flex-col gap-4">



      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-4">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="text-red-500 mb-4">
                {error.includes("Server is temporarily overloaded") ? (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Server is temporarily overloaded</p>
                    <p className="text-sm text-muted-foreground">
                      We're experiencing high traffic. Please try again in a moment.
                    </p>
                    {retryCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Retry attempt {retryCount} of 3
                      </p>
                    )}
                  </div>
                ) : (
                  error
                )}
              </div>
              {error.includes("Server is temporarily overloaded") && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  variant="outline"
                  className="mt-2"
                >
                  {isRetrying ? "Retrying..." : "Try Again"}
                </Button>
              )}
            </div>
          </div>
        ) : summary ? (
          summary.map((item, i) => (
            item.label === "Total Amount" ? (
              <Card key={item.label} className="">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="mb-2 -mx-1">
                    <Tabs value={displayCurrency} onValueChange={(v) => setSelectedCurrency(v)}>
                      <div className="overflow-x-auto scrollbar-thin-x">
                        <TabsList className="min-w-max">
                          {(monthlyMultiSeries?.currencies || []).map((code) => (
                            <TabsTrigger key={code} value={code} className="px-2 sm:px-3">
                              {code}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                    </Tabs>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {displayCurrency} {Number(computedCurrencyTotals[displayCurrency] ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">For current fiscal year</p>
                </CardContent>
              </Card>
            ) : (
              <Card key={item.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {item.label === "Total Invoices" && ""}
                    {item.label === "Paid Invoices" && summary[0]?.value > 0 ? `${Math.round((item.value / summary[0].value) * 100)}% of total invoices` : item.label === "Paid Invoices" ? "0% of total invoices" : null}
                    {item.label === "Pending Invoices" && summary[0]?.value > 0 ? `${Math.round((item.value / summary[0].value) * 100)}% of total invoices` : item.label === "Pending Invoices" ? "0% of total invoices" : null}
                  </p>
                </CardContent>
              </Card>
            )
          ))
        ) : null}
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium">Monthly Invoices</CardTitle>
          <CardDescription>Invoice amounts by month</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
            </div>
          ) : (
            <MonthlyInvoiceChart
              data={monthlyInvoiceData?.map(prev => ({ ...prev, currency: selectedCurrency }))}
              multiSeries={monthlyMultiSeries || undefined}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex bg-paper rounded-lg p-4 flex-col gap-4 md:flex-row md:items-end mt-3 md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2 relative">
          <Input
            type="text"
            placeholder="Search invoices..."
            className="h-9 pr-8"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            disabled={searchLoading}
          />
          {searchValue && (
            <button
              type="button"
              className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              onClick={handleClearSearch}
              tabIndex={-1}
              aria-label="Clear search"
            >
              {/* <XIcon className="h-4 w-4" /> */}
            </button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 lg:px-3"
            onClick={handleSearch}
            disabled={searchLoading}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">{searchLoading ? "Searching..." : "Search"}</span>
          </Button>
        </div>
        <form className="flex flex-row items-end gap-2" onSubmit={e => { e.preventDefault(); handleFilterSubmit() }}>
          <div className="flex flex-col">
            <label htmlFor="start-date" className="text-xs text-muted-foreground font-normal mb-1">Start Date</label>
            <Input
              id="start-date"
              type="date"
              className="h-9 w-[140px]"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              max={endDate || undefined}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="end-date" className="text-xs text-muted-foreground font-normal mb-1">End Date</label>
            <Input
              id="end-date"
              type="date"
              className="h-9 w-[140px]"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </div>
          {/* <div className="flex flex-col">
            <label htmlFor="status-filter" className="text-xs text-muted-foreground font-normal mb-1">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter" className="h-9 w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="processing">processing</SelectItem>
                <SelectItem value="processing">paid</SelectItem>
              </SelectContent>
            </Select>
          </div> */}




          <Button type="submit" variant="default" size="sm" className="h-9 px-4 self-end" disabled={filterLoading || !isFilterActive}>
            {filterLoading ? "Filtering..." : "Apply Filter"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 px-2 self-end"
            onClick={handleClearFilters}
            disabled={!isFilterActive}
          >
            Clear Filters
          </Button>
        </form>
      </div>

      <div className="bg-paper rounded p-4">
        <Tabz.Root value={status} onValueChange={setStatus} className="flex flex-col space-y-2">

          <Tabz.List className="flex space-x-2">

            <Tabz.Trigger
              value="processing"
              className="px-3 py-1.5 text-sm rounded-md border text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Processing
            </Tabz.Trigger>
            <Tabz.Trigger
              value="pending"
              className="px-3 py-1.5 text-sm rounded-md border text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Pending
            </Tabz.Trigger>
            <Tabz.Trigger
              value="approved"
              className="px-3 py-1.5 text-sm rounded-md border text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Approved
            </Tabz.Trigger>
            <Tabz.Trigger
              value="paid"
              className="px-3 py-1.5 text-sm rounded-md border text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Paid
            </Tabz.Trigger>
          </Tabz.List>
        </Tabz.Root>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">All Invoices</CardTitle>
              <CardDescription>Manage and track all company invoices</CardDescription>
            </div>
            <Button variant="outline" onClick={handleExportAllInvoices}>
              <FileDown className="mr-2 h-4 w-4" />
              {getExportButtonText()}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InvoiceTable
            ref={invoiceTableRef}
            currency={companyCurrency}
            searchTerm={searchTerm}
            filterParams={filterParams}
            boardMemberRole={boardMemberRole}
            roleName={roleName}
            onSelectionChange={setSelectedInvoiceCount}
            activeTab={status}
          />
        </CardContent>
      </Card>
    </div>
  )
}

const InvoiceTable = React.forwardRef(function InvoiceTable(
  { currency, searchTerm, filterParams, boardMemberRole, roleName, onSelectionChange, activeTab }: { currency: string, searchTerm?: string, filterParams?: { status: string, startDate: string, endDate: string }, boardMemberRole?: string, roleName?: string, onSelectionChange?: (count: number) => void, activeTab?: string },
  ref: React.ForwardedRef<{ handleAllInvoicesPDF: () => void; handleExportAllInvoicesPDF: () => void; selectedCount: number }>
) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("invoiceNumber")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  // Selection state
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const authData = getAuthData()

  // Helper function for status colors
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

  const fetchInvoicesWithRetry = async (retryAttempt = 0) => {
    setLoading(true)
    setError(null)
    try {
      const authData = getAuthData()
      const companyId = authData?.user?.company?.id
      if (!companyId) throw new Error("Company ID not found")
      let url = `/company/invoices/${companyId}`
      let params: any = {}
      // Only add params if searchTerm is set, or filters are changed from default
      if (searchTerm) {
        params.search = searchTerm
      } else if (filterParams) {
        if (filterParams.status) {
          params.status = filterParams.status
        }
        if (filterParams.startDate) {
          params.startDate = filterParams.startDate
        }
        if (filterParams.endDate) {
          params.endDate = filterParams.endDate
        }
      }
      const query = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : ""

      // Add timeout to prevent long waits
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      )

      const fetchPromise = getRequest(url + query)
      const res: any = await Promise.race([fetchPromise, timeoutPromise])

      setInvoices(res.data)
      setRetryCount(0) // Reset retry count on success
    } catch (err: any) {
      const isServerOverload = err.message?.includes("Server is temporarily overloaded")
      const isTimeout = err.message?.includes("Request timeout")

      if ((isServerOverload || isTimeout) && retryAttempt < 2) {
        // Reduced delay for faster retries (500ms, 1000ms)
        const delay = Math.pow(2, retryAttempt) * 500
        setTimeout(() => {
          fetchInvoicesWithRetry(retryAttempt + 1)
        }, delay)
        return
      }
      setError(err.message || "Failed to fetch invoices")
      setRetryCount(retryAttempt)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    fetchInvoicesWithRetry(0)
    setTimeout(() => setIsRetrying(false), 1000)
  }

  useEffect(() => {
    fetchInvoicesWithRetry()
  }, [searchTerm, filterParams])

  useEffect(() => {
    setFilteredInvoices(invoices)
    // Reset selection when invoices change
    setSelectedInvoices(new Set())
    setSelectAll(false)
    onSelectionChange?.(0)
  }, [invoices, onSelectionChange])

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange?.(selectedInvoices.size)
  }, [selectedInvoices.size, onSelectionChange])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDir("asc")
    }
  }

  // Selection handlers
  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    const invoice = sortedInvoices.find(inv => inv.id === invoiceId)
    if (!invoice) return

    const newSelected = new Set(selectedInvoices)

    if (checked) {
      // Check if this selection would create an incompatible mix
      const currentlySelected = sortedInvoices.filter(inv => selectedInvoices.has(inv.id))

      if (currentlySelected.length > 0) {
        const firstSelectedStatus = currentlySelected[0].status

        // Prevent mixing different statuses that can't be batch processed together
        // Only apply this restriction if not on the paid tab (where selection is only for export)
        if (activeTab !== 'paid') {
          if (
            (firstSelectedStatus === 'paid') ||
            (currentlySelected.some(inv => inv.status === 'paid'))
          ) {
            alert("Cannot select paid invoices for batch operations.")
            return
          }
        }
      }

      newSelected.add(invoiceId)
    } else {
      newSelected.delete(invoiceId)
    }

    setSelectedInvoices(newSelected)

    // Update select all state
    if (checked && newSelected.size === sortedInvoices.length) {
      setSelectAll(true)
    } else if (!checked) {
      setSelectAll(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select invoices that can be batch processed together
      // For now, select all invoices with the same status as the first one
      // On paid tab, allow selecting all paid invoices for export
      if (sortedInvoices.length > 0) {
        const firstStatus = sortedInvoices[0].status
        const compatibleInvoices = activeTab === 'paid'
          ? sortedInvoices
          : sortedInvoices.filter(invoice => invoice.status !== 'paid')
        const compatibleIds = new Set(compatibleInvoices.map(invoice => invoice.id))
        setSelectedInvoices(compatibleIds)
        setSelectAll(compatibleIds.size === sortedInvoices.length)
      }
    } else {
      setSelectedInvoices(new Set())
      setSelectAll(false)
    }
  }

  const [loading2, setLoading2] = useState(false)



  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue: any, bValue: any
    switch (sortBy) {
      case "employee":
        aValue = a.user?.fullName || ""
        bValue = b.user?.fullName || ""
        break
      case "period":
        aValue = a.startDate ? new Date(a.startDate).getTime() : 0
        bValue = b.startDate ? new Date(b.startDate).getTime() : 0
        break
      case "amount":
        aValue = Number(a.amount)
        bValue = Number(b.amount)
        break
      case "status":
        aValue = a.status || ""
        bValue = b.status || ""
        break
      default:
        aValue = a.id
        bValue = b.id
    }
    if (aValue < bValue) return sortDir === "asc" ? -1 : 1
    if (aValue > bValue) return sortDir === "asc" ? 1 : -1
    return 0
  })

  // Get selected invoices with their status
  const selectedInvoicesWithStatus = useMemo(() => {
    return sortedInvoices.filter(invoice => selectedInvoices.has(invoice.id))
  }, [selectedInvoices, sortedInvoices])

  // Check if any selected invoices are already approved
  const hasApprovedInvoices = useMemo(() => {
    return selectedInvoicesWithStatus.some(invoice => invoice.status === 'approved')
  }, [selectedInvoicesWithStatus])

  // Check if all selected invoices are approved (for paid button)
  const allSelectedAreApproved = useMemo(() => {
    return selectedInvoicesWithStatus.length > 0 && selectedInvoicesWithStatus.every(invoice => invoice.status === 'approved')
  }, [selectedInvoicesWithStatus])

  // Check if any selected invoices are already paid
  const hasPaidInvoices = useMemo(() => {
    return selectedInvoicesWithStatus.some(invoice => invoice.status === 'paid')
  }, [selectedInvoicesWithStatus])

  // PDF download for row (stateless: checkboxes No, comment empty)
  const handleRowDownloadPDF = async (invoice: any) => {
    try {
      const getCurrencyOrigin = () => {
        return { code: invoice.user?.currency || 'USD', origin: 'User' }
      }
      const currencyInfo = getCurrencyOrigin()

      const formatCurrency = (amount: any, code = 'USD') => {
        return `${code} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }

      const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 210mm; margin: 0 auto; padding: 12mm 10mm; background: white; color: #1f2937;">
        <!-- Header -->
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
          ${invoice.user?.company?.name ? `<div style="margin-bottom: 8px;"><h2 style="font-size: 16px; font-weight: 700; color: #F6931B; margin: 0 0 2px 0;">${invoice.user.company.name}</h2>${invoice.user?.company?.sector ? `<p style="font-size: 11px; color: #6b7280; margin: 0;">${invoice.user.company.sector}</p>` : ''}</div>` : ''}
          <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">INVOICE</h1>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">${invoice.invoiceNumber || invoice.id}</p>
        </div>

        <!-- Invoice Details and Consultant Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Invoice Details</h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Issue Date:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Period:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Last Updated:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
              </div>
            </div>
          </div>

          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Consultant Information</h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
              <div>
                <div style="font-weight: 600; color: #111827;">${invoice.user?.fullName || 'Consultant Name'}</div>
                <div style="color: #6b7280; text-transform: capitalize; margin-top: 1px; font-size: 10px;">${invoice.user?.jobTitle || 'Consultant'} Consultant</div>
              </div>
              <div style="color: #6b7280; display: flex; align-items: center; margin-top: 2px;">
                <span>${invoice.user?.email || 'email@example.com'}</span>
              </div>
              <div style="color: #6b7280; display: flex; align-items: center;">
                <span>${invoice.user?.phoneNumber || 'Phone Number'}</span>
              </div>
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
                <th style="padding: 8px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Hours</th>
                <th style="padding: 8px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Rate</th>
                <th style="padding: 8px 10px; text-align: right; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">
                  <div style="font-weight: 500; color: #111827; font-size: 11px;">Consulting Services</div>
                  <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">Period: ${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</div>
                </td>
                <td style="padding: 8px 10px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 11px;">${invoice.totalHours || '-'}</td>
                <td style="padding: 8px 10px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 11px;">${formatCurrency(((invoice.user?.grossPay / invoice?.user?.totalHoursPerMonth) || 0), currencyInfo.code)}</td>
                <td style="padding: 8px 10px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #111827; font-size: 11px;">${formatCurrency(invoice.amount || 0, currencyInfo.code)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
          <div style="width: 250px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.amount || 0, currencyInfo.code)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
              <span>Tax:</span>
              <span>${formatCurrency(0, currencyInfo.code)}</span>
            </div>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #111827;">
                <span>Total:</span>
                <span>${formatCurrency(invoice.amount || 0, currencyInfo.code)}</span>
              </div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #9ca3af; text-align: right;">
              Showing amounts in <span style="font-weight: 600;">${currencyInfo.code}</span> (${currencyInfo.origin} currency)
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        ${invoice.user?.bankDetails ? `
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 16px; background: #fafafa;">
          <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 10px 0;">Payment Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Bank Name</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.bankName || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Branch</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.branch || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Account Name</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.accountName || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Account Number</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.accountNumber || 'N/A'}</div>
            </div>
            <div style="grid-column: 1 / -1;">
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">SWIFT Code</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.swiftCode || 'N/A'}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 16px; text-align: center; font-size: 10px; color: #6b7280;">
          <p style="margin: 0 0 4px 0;">Thank you for your business!</p>
          <p style="margin: 0;">For any questions regarding this invoice, please contact ${invoice.user?.email || 'support@company.com'}</p>
        </div>
      </div>
    `
      await generatePdf(html)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  // PDF download for all visible invoices
  const handleAllInvoicesPDF = async () => {

    try {
      // Table headers
      const headers = [
        'Email',
        'Status',
        'Amount',
      ];
      // Build table rows from filteredInvoices
      const rows = filteredInvoices.map(inv => [
        inv.user?.email || '-',
        inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : '-',
        (inv.amount != null && !isNaN(Number(inv.amount)))
          ? `${currency} ${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'N/A',
      ]);


      // Build HTML table
      const tableHtml = `
      <h1 class="text-3xl text-primary font-bold mb-4">${authData?.user?.company?.name || ''}</h1>
        <p class="mb-4">Invoices for the duration: &nbsp; ${getInvoiceDateRange(filteredInvoices)}</p>
        <span class=" text-xs  mb-4">Printed: ${format(new Date(), 'yyyy-MM-dd')}</span>
        <br/>
        <br/>
        <table class="min-w-full border border-gray-300 rounded overflow-hidden text-sm">
          <thead class="bg-gray-100">
            <tr>
              ${headers.map(h => `<th class="border border-gray-300 px-4 py-2 text-left font-semibold">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0 ? `<tr><td class="border border-gray-300 px-4 py-2 text-center text-gray-500" colspan="${headers.length}">No invoices found.</td></tr>` :
          rows.map(row =>
            `<tr>
                  ${row.map(cell => `<td class="border border-gray-300 px-4 py-2">${cell}</td>`).join('')}
                </tr>`
          ).join('')
        }
          </tbody>
        </table>
      `;
      await generatePdf(tableHtml);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  // Helper function to generate HTML for a single invoice PDF
  const generateInvoicePDFHtml = async (invoice: any, reviewedText: string = 'No', satisfiedText: string = 'No', approvedText: string = 'No', commentBlock: string = '') => {
    const getCurrencyOrigin = () => {
      return { code: invoice.user?.currency || 'USD', origin: 'User' }
    }
    const currencyInfo = getCurrencyOrigin()
    const formatCurrency = (amount: any, code = 'USD') => {
      return `${code} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 210mm; margin: 0 auto; padding: 12mm 10mm; background: white; color: #1f2937;">
            <!-- Header -->
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
              ${invoice.user?.company?.name ? `<div style="margin-bottom: 8px;"><h2 style="font-size: 16px; font-weight: 700; color: #F6931B; margin: 0 0 2px 0;">${invoice.user.company.name}</h2>${invoice.user?.company?.sector ? `<p style="font-size: 11px; color: #6b7280; margin: 0;">${invoice.user.company.sector}</p>` : ''}</div>` : ''}
              <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">INVOICE</h1>
              <p style="font-size: 12px; color: #6b7280; margin: 0;">${invoice.invoiceNumber || invoice.id}</p>
            </div>

        <!-- Invoice Details and Consultant Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Invoice Details</h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Issue Date:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Period:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Last Updated:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
              </div>
            </div>
          </div>

          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Consultant Information</h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
              <div>
                <div style="font-weight: 600; color: #111827;">${invoice.user?.fullName || 'Consultant Name'}</div>
                <div style="color: #6b7280; text-transform: capitalize; margin-top: 1px; font-size: 10px;">${invoice.user?.jobTitle || 'Consultant'} Consultant</div>
              </div>
              <div style="color: #6b7280; display: flex; align-items: center; margin-top: 2px;">
                <span>${invoice.user?.email || 'email@example.com'}</span>
              </div>
              <div style="color: #6b7280; display: flex; align-items: center;">
                <span>${invoice.user?.phoneNumber || 'Phone Number'}</span>
              </div>
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
                <th style="padding: 8px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Hours</th>
                <th style="padding: 8px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Rate</th>
                <th style="padding: 8px 10px; text-align: right; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">
                  <div style="font-weight: 500; color: #111827; font-size: 11px;">Consulting Services</div>
                  <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">Period: ${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</div>
                </td>
                <td style="padding: 8px 10px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 11px;">${invoice.totalHours || '-'}</td>
                <td style="padding: 8px 10px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 11px;">${formatCurrency(((invoice.user?.grossPay / invoice?.user?.totalHoursPerMonth) || 0), currencyInfo.code)}</td>
                <td style="padding: 8px 10px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #111827; font-size: 11px;">${formatCurrency(invoice.amount || 0, currencyInfo.code)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
          <div style="width: 250px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.amount || 0, currencyInfo.code)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
              <span>Tax:</span>
              <span>${formatCurrency(0, currencyInfo.code)}</span>
            </div>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #111827;">
                <span>Total:</span>
                <span>${formatCurrency(invoice.amount || 0, currencyInfo.code)}</span>
              </div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #9ca3af; text-align: right;">
              Showing amounts in <span style="font-weight: 600;">${currencyInfo.code}</span> (${currencyInfo.origin} currency)
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        ${invoice.user?.bankDetails ? `
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 16px; background: #fafafa;">
          <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 10px 0;">Payment Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Bank Name</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.bankName || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Branch</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.branch || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Account Name</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.accountName || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Account Number</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.accountNumber || 'N/A'}</div>
            </div>
            <div style="grid-column: 1 / -1;">
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">SWIFT Code</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.swiftCode || 'N/A'}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 16px; text-align: center; font-size: 10px; color: #6b7280;">
          <p style="margin: 0 0 4px 0;">Thank you for your business!</p>
          <p style="margin: 0;">For any questions regarding this invoice, please contact ${invoice.user?.email || 'support@company.com'}</p>
        </div>
      </div>
    `
  }

  // Helper function to sanitize filename
  const sanitizeFilename = (email: string): string => {
    // Replace invalid filename characters with underscores
    return email.replace(/[<>:"/\\|?*]/g, '_').replace(/[^\w.-]/g, '_')
  }

  // PDF download for ALL invoices matching current filters OR selected invoices
  const handleExportAllInvoicesPDF = async () => {
    try {
      let invoicesToExport: any[] = []
      const authData = getAuthData()

      // Check if invoices are selected - if yes, export only selected
      if (selectedInvoices.size > 0) {
        invoicesToExport = sortedInvoices.filter(inv => selectedInvoices.has(inv.id))

        if (invoicesToExport.length === 0) {
          alert('No invoices selected for export')
          return
        }
      } else {
        // If no invoices selected, fetch all matching filters
        const companyId = authData?.user?.company?.id
        if (!companyId) {
          alert('Company ID not found')
          return
        }

        let url = `/company/invoices/${companyId}`
        let params: any = {}

        // Apply current filters (same logic as fetchInvoicesWithRetry)
        if (searchTerm) {
          params.search = searchTerm
        } else if (filterParams) {
          if (filterParams.status) {
            params.status = filterParams.status
          }
          if (filterParams.startDate) {
            params.startDate = filterParams.startDate
          }
          if (filterParams.endDate) {
            params.endDate = filterParams.endDate
          }
        }

        const query = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : ""

        // Add timeout to prevent long waits
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000)
        )

        const fetchPromise = getRequest(url + query)
        const res: any = await Promise.race([fetchPromise, timeoutPromise])

        invoicesToExport = res.data || []
      }

      if (invoicesToExport.length === 0) {
        alert('No invoices found to export')
        return
      }

      // Build zip filename based on filters
      let zipFilename = 'invoices'
      if (selectedInvoices.size > 0) {
        zipFilename = `selected-invoices-${selectedInvoices.size}`
      } else if (searchTerm) {
        zipFilename = `invoices-${sanitizeFilename(searchTerm)}`
      } else if (filterParams?.status) {
        const statusLabel = filterParams.status.charAt(0).toUpperCase() + filterParams.status.slice(1)
        zipFilename = `${statusLabel.toLowerCase()}-invoices`
      }

      // Add date range if present
      if (filterParams?.startDate || filterParams?.endDate) {
        const dateStr = filterParams.startDate
          ? format(new Date(filterParams.startDate), 'yyyy-MM-dd')
          : 'all'
        zipFilename += `-${dateStr}`
      }

      zipFilename = `${zipFilename}-${format(new Date(), 'yyyy-MM-dd')}.zip`

      // Show loading message
      toast.loading(`Generating ${invoicesToExport.length} PDF${invoicesToExport.length > 1 ? 's' : ''}...`, { id: 'export-progress' })

      // Create zip file
      const zip = new JSZip()
      let successfulCount = 0
      let failedCount = 0

      // Generate PDFs and add to zip
      for (let i = 0; i < invoicesToExport.length; i++) {
        const invoice = invoicesToExport[i]
        const email = invoice.user?.email || `invoice-${invoice.id}`
        const filename = `${sanitizeFilename(email)}.pdf`

        try {
          // Generate HTML for this invoice (async - converts logo to base64)
          const html = await generateInvoicePDFHtml(invoice)

          // Generate PDF as blob
          const pdfBlob = await generatePdfAsBlob(html)

          // Verify blob is valid
          if (pdfBlob && pdfBlob instanceof Blob && pdfBlob.size > 0) {
            // Add PDF to zip with proper naming
            zip.file(filename, pdfBlob)
            successfulCount++
            console.log(`Successfully generated PDF for ${email} (${pdfBlob.size} bytes)`)
          } else {
            console.error(`Generated PDF blob is invalid for ${email}`)
            failedCount++
          }

          // Update progress for large exports
          if (invoicesToExport.length > 5 && (i + 1) % 5 === 0) {
            toast.loading(`Generating PDFs... ${i + 1}/${invoicesToExport.length}`, { id: 'export-progress' })
          }
        } catch (err) {
          console.error(`Failed to generate PDF for ${email}:`, err)
          failedCount++
          // Continue with other invoices even if one fails
        }
      }

      // Check if we have any files in the zip
      if (successfulCount === 0) {
        toast.error('No PDFs were generated. Please check the console for errors.', { id: 'export-progress' })
        return
      }

      if (failedCount > 0) {
        toast.warning(`Generated ${successfulCount} PDF${successfulCount > 1 ? 's' : ''}, ${failedCount} failed`, { id: 'export-progress' })
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })

      // Download zip file
      const link = document.createElement('a')
      const url = URL.createObjectURL(zipBlob)
      link.href = url
      link.download = zipFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Successfully exported ${invoicesToExport.length} invoice${invoicesToExport.length > 1 ? 's' : ''} as ${zipFilename}`, { id: 'export-progress' })
    } catch (err) {
      console.error('Failed to generate PDFs:', err);
      toast.error('Failed to generate PDFs. Please try again.', { id: 'export-progress' })
    }
  }

  // Confirmation dialog state for approve
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  const handleApproveAll = async () => {
    // Prevent approval if any selected invoices are already approved
    if (hasApprovedInvoices) {
      toast.error("Some selected invoices are already approved. Please deselect approved invoices and try again.")
      return
    }

    // Show confirmation dialog
    setShowApproveConfirm(true)
  }

  const confirmApproveAll = async () => {
    setShowApproveConfirm(false)
    const selectedIds = Array.from(selectedInvoices)
    setLoading2(true)
    try {
      const data = await postRequest(`/company/invoices/approve/${authData.user.company.id}`, { invoiceIds: selectedIds })
      if (data) {
        toast.success(`Successfully approved ${selectedIds.length} invoice${selectedIds.length > 1 ? 's' : ''}.`)
        fetchInvoicesWithRetry(1)
        setSelectedInvoices(new Set()) // Clear selection after successful approval
        setSelectAll(false)
      }
    } catch (err: any) {
      console.warn(err)

      // Check if it's a fetch error with status code
      if (err.message && typeof err.message === 'string') {
        // Try to extract status code from error message or check if it's a network error
        if (err.message.includes('403') || err.message.includes('Access denied')) {
          toast.error("Access denied. Please check your permissions.")
        } else if (err.message.includes('400') || err.message.includes('validation')) {
          toast.error(err.message)
        } else if (err.message.includes('500') || err.message.includes('server')) {
          toast.error(err.message)
        } else {
          // For any other status codes (404, 501, 502, etc.), show not implemented message
          toast.error("This feature has not yet been implemented by the developers.")
        }
      } else {
        // For network errors or other issues
        toast.error("This feature has not yet been implemented by the developers.")
      }
    } finally {
      setLoading2(false)
    }
  }

  // Confirmation dialog state for mark as paid
  const [showMarkPaidConfirm, setShowMarkPaidConfirm] = useState(false)

  const handleMarkAsPaid = async () => {
    // Prevent marking as paid if any selected invoices are already paid
    if (hasPaidInvoices) {
      toast.error("Some selected invoices are already paid. Please deselect paid invoices and try again.")
      return
    }

    // Show confirmation dialog
    setShowMarkPaidConfirm(true)
  }

  const confirmMarkAsPaid = async () => {
    setShowMarkPaidConfirm(false)
    const selectedIds = Array.from(selectedInvoices)
    setLoading2(true)
    try {
      const data = await postRequest(`/company/invoices/mark-paid/${authData.user.company.id}`, { invoiceIds: selectedIds })
      if (data) {
        toast.success(`Successfully marked ${selectedIds.length} invoice${selectedIds.length > 1 ? 's' : ''} as paid.`)
        fetchInvoicesWithRetry(1)
        setSelectedInvoices(new Set()) // Clear selection after successful update
        setSelectAll(false)
      }
    } catch (err: any) {
      console.warn(err)

      // Check if it's a fetch error with status code
      if (err.message && typeof err.message === 'string') {
        // Try to extract status code from error message or check if it's a network error
        if (err.message.includes('403') || err.message.includes('Access denied')) {
          toast.error("Access denied. Please check your permissions.")
        } else if (err.message.includes('400') || err.message.includes('validation')) {
          toast.error(err.message)
        } else if (err.message.includes('500') || err.message.includes('server')) {
          toast.error(err.message)
        } else {
          // For any other status codes (404, 501, 502, etc.), show not implemented message
          toast.error("This feature has not yet been implemented by the developers.")
        }
      } else {
        // For network errors or other issues
        toast.error("This feature has not yet been implemented by the developers.")
      }
    } finally {
      setLoading2(false)
    }
  }

  useImperativeHandle(ref, () => ({
    handleAllInvoicesPDF,
    handleExportAllInvoicesPDF,
    selectedCount: selectedInvoices.size
  }))

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 7 }).map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 7 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="text-red-500 mb-4">
            {error.includes("Server is temporarily overloaded") ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">Server is temporarily overloaded</p>
                <p className="text-sm text-muted-foreground">
                  We're experiencing high traffic. Please try again in a moment.
                </p>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Retry attempt {retryCount} of 3
                  </p>
                )}
              </div>
            ) : (
              error
            )}
          </div>
          {error.includes("Server is temporarily overloaded") && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="mt-2"
            >
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>
          )}
        </div>
      </div>
    )
  }
  if (!filteredInvoices.length) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No invoices found.</div>
  }

  const sortArrow = (column: string) => (
    <span className="inline-flex flex-col ml-2 align-middle">
      <svg width="10" height="7" viewBox="0 0 10 7" className={
        sortBy === column && sortDir === "asc"
          ? "text-primary opacity-100"
          : "text-muted-foreground opacity-40"
      } style={{ marginBottom: "1px" }} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <polygon points="5,1 9,6 1,6" />
      </svg>
      <span style={{ height: 1 }} />
      <svg width="10" height="7" viewBox="0 0 10 7" className={
        sortBy === column && sortDir === "desc"
          ? "text-primary opacity-100"
          : "text-muted-foreground opacity-40"
      } style={{ marginTop: "1px", transform: 'rotate(180deg)' }} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <polygon points="5,1 9,6 1,6" />
      </svg>
    </span>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedInvoices.size > 0 ? `${selectedInvoices.size} invoice(s) selected` : 'No invoices selected'}
          </span>
        </div>
        {selectedInvoices.size > 0 && activeTab !== 'paid' && (
          <div className="flex gap-2">
            {/* Show Approve button only if no approved invoices are selected */}
            {!hasApprovedInvoices && !allSelectedAreApproved && (
              <Button
                onClick={handleApproveAll}
                variant="default"
                size="sm"
                className="bg-primary"
                disabled={loading2}
              >
                {loading2 ? "Updating..." : "Approve All"} ({selectedInvoices.size})
              </Button>
            )}

            {/* Show Pay button only if all selected invoices are approved and not paid */}
            {allSelectedAreApproved && !hasPaidInvoices && (
              <Button
                onClick={handleMarkAsPaid}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={loading2}
              >
                {loading2 ? "Processing..." : "Pay"} ({selectedInvoices.size})
              </Button>
            )}

            {/* Show warning if trying to select mixed statuses */}
            {hasApprovedInvoices && !allSelectedAreApproved && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-200">
                Cannot approve: Some selected invoices are already approved
              </div>
            )}
          </div>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                aria-label="Select all invoices"
              />
            </TableHead>
            <TableHead
              className={`cursor-pointer select-none ${sortBy === "employee" ? "text-primary font-semibold" : ""}`}
              onClick={() => handleSort("employee")}
            >
              Consultant
              {sortArrow("employee")}
            </TableHead>
            <TableHead
              className={`cursor-pointer select-none ${sortBy === "period" ? "text-primary font-semibold" : ""}`}
              onClick={() => handleSort("period")}
            >
              Period
              {sortArrow("period")}
            </TableHead>
            <TableHead
              className={`cursor-pointer select-none ${sortBy === "amount" ? "text-primary font-semibold" : ""}`}
              onClick={() => handleSort("amount")}
            >
              Amount
              {sortArrow("amount")}
            </TableHead>
            <TableHead
              className={`cursor-pointer select-none ${sortBy === "status" ? "text-primary font-semibold" : ""}`}
              onClick={() => handleSort("status")}
            >
              Status
              {sortArrow("status")}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Checkbox
                  checked={selectedInvoices.has(invoice.id)}
                  onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked === true)}
                  aria-label={`Select invoice ${invoice.invoiceNumber || invoice.id}`}
                />
              </TableCell>
              <TableCell>{invoice.user?.fullName || "-"}</TableCell>
              <TableCell>{invoice.startDate && invoice.endDate ? `${format(new Date(invoice.startDate), "MMM yyyy")}` : "-"}</TableCell>
              <TableCell>
                {invoice.amount != null && !isNaN(Number(invoice.amount))
                  ? `${invoice.user.currency} ${Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    invoice.status === "approved"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                      : invoice.status === "pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                        : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800"
                  }
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(invoice); setModalOpen(true); }}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRowDownloadPDF(invoice)}>
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Invoice Details Modal */}
      <InvoiceDetailsModal open={modalOpen} onOpenChange={setModalOpen} invoice={selectedInvoice} currency={currency} boardMemberRole={boardMemberRole} roleName={roleName} />

      {/* Approve All Confirmation Dialog */}
      <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {selectedInvoices.size} invoice{selectedInvoices.size > 1 ? 's' : ''}? This action will change the status of the selected invoices to "approved" and cannot be undone easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApproveAll} className="bg-primary">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Paid Confirmation Dialog */}
      <AlertDialog open={showMarkPaidConfirm} onOpenChange={setShowMarkPaidConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Mark as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {selectedInvoices.size} invoice{selectedInvoices.size > 1 ? 's' : ''} as paid? This action will change the status of the selected invoices to "paid" and cannot be undone easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkAsPaid} className="bg-green-600 hover:bg-green-700">
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

function InvoiceActions({ onDownloadAll }: { onDownloadAll?: () => void }) {
  return (
    <Button variant="outline" onClick={onDownloadAll}>
      <FileDown className="mr-2 h-4 w-4" /> Download PDF
    </Button>
  )
}

// Modal component for invoice details
function InvoiceDetailsModal({ open, onOpenChange, invoice, currency, boardMemberRole, roleName }: { open: boolean, onOpenChange: (open: boolean) => void, invoice: any, currency: string, boardMemberRole?: string, roleName?: string }) {
  if (!invoice) return null
  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }
  // Company logo logic
  const companyLogo = invoice.user?.company?.logo || 'https://www.tekjuice.co.uk/assets/images/logos.svg'
  const getCurrencyOrigin = () => {
    return { code: invoice.user.currency || 'USD', origin: 'User' }
  }
  const formatCurrency = (amount: any, code = 'USD') => {
    // Always show as 'CODE amount', e.g., 'USD 1,000.00', no symbol
    return `${code} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
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
  const currencyInfo = getCurrencyOrigin()
  // --- Checks and Comments State ---
  const [reviewed, setReviewed] = useState(false)
  const [satisfied, setSatisfied] = useState(false)
  const [approved, setApproved] = useState(false)
  // Comments state: array of {author, date, content, boardMemberRole}
  const [comments, setComments] = useState<Array<{ author: string, date: string, content: string, boardMemberRole?: string }>>([])
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  // Comments loading state
  const [commentsLoading, setCommentsLoading] = useState(true)
  // Show more/less state
  const [showAllComments, setShowAllComments] = useState(false)
  // Load comments only when modal is open and invoice is present
  React.useEffect(() => {
    if (!open || !invoice?.id) return;
    setCommentsLoading(true);
    fetchApproverActions(
      invoice.id,
      setCommentsLoading,
      (error) => {
        setComments([]);
        setCommentsLoading(false);
        // Optionally show error UI
      }
    )
      .then((actions: ApproverAction[]) => {
        setComments(
          actions.map((a) => ({
            author: a.user.name,
            date: new Date(a.date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            content: a.comment,
            boardMemberRole: a.boardMemberRole,
          }))
        );
      })
      .catch(() => {
        setComments([]);
      });
  }, [open, invoice?.id])
  const checksChanged = reviewed !== false || satisfied !== false || approved !== false // always allow save for demo
  // Confirmation dialog state for save
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // Save both checks and comment
  const handleSave = async () => {
    // Show confirmation dialog if approving or marking as satisfied/reviewed
    if (approved || satisfied || reviewed || comment.trim()) {
      setShowSaveConfirm(true)
    } else {
      // No changes, nothing to save
      return
    }
  }

  const confirmSave = async () => {
    setShowSaveConfirm(false)
    setSaving(true);
    try {
      await createInvoiceApproval(
        invoice.id,
        comment.trim(),
        setSaving,
        (error) => {
          alert(error?.message || "Failed to create approval");
        }
      );
      // Optionally update comments UI
      if (comment.trim()) {
        setComments([
          ...comments,
          {
            author: "You",
            date: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            content: comment.trim(),
          },
        ]);
        setComment("");
      }
      // Reset checkboxes after successful save
      setReviewed(false)
      setSatisfied(false)
      setApproved(false)
    } catch (e) {
      // Error already handled by onError
    }
  };
  // PDF Generation (updated to match bulk export style)
  const handleDownloadPDF = async () => {
    try {
      const getCurrencyOrigin = () => {
        return { code: invoice.user?.currency || 'USD', origin: 'User' }
      }
      const currencyInfo = getCurrencyOrigin()

      const formatCurrency = (amount: any, code = 'USD') => {
        return `${code} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }

      const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 210mm; margin: 0 auto; padding: 12mm 10mm; background: white; color: #1f2937;">
        <!-- Header -->
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
          ${invoice.user?.company?.name ? `<div style="margin-bottom: 8px;"><h2 style="font-size: 16px; font-weight: 700; color: #F6931B; margin: 0 0 2px 0;">${invoice.user.company.name}</h2>${invoice.user?.company?.sector ? `<p style="font-size: 11px; color: #6b7280; margin: 0;">${invoice.user.company.sector}</p>` : ''}</div>` : ''}
          <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">INVOICE</h1>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">${invoice.invoiceNumber || invoice.id}</p>
        </div>

        <!-- Invoice Details and Consultant Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Invoice Details</h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Issue Date:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Period:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Last Updated:</span>
                <span style="font-weight: 500; color: #111827;">${typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
              </div>
            </div>
          </div>

          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Consultant Information</h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
              <div>
                <div style="font-weight: 600; color: #111827;">${invoice.user?.fullName || 'Consultant Name'}</div>
                <div style="color: #6b7280; text-transform: capitalize; margin-top: 1px; font-size: 10px;">${invoice.user?.jobTitle || 'Consultant'} Consultant</div>
              </div>
              <div style="color: #6b7280; display: flex; align-items: center; margin-top: 2px;">
                <span>${invoice.user?.email || 'email@example.com'}</span>
              </div>
              <div style="color: #6b7280; display: flex; align-items: center;">
                <span>${invoice.user?.phoneNumber || 'Phone Number'}</span>
              </div>
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
                <th style="padding: 8px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Hours</th>
                <th style="padding: 8px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Rate</th>
                <th style="padding: 8px 10px; text-align: right; font-size: 11px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">
                  <div style="font-weight: 500; color: #111827; font-size: 11px;">Consulting Services</div>
                  <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">Period: ${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</div>
                </td>
                <td style="padding: 8px 10px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 11px;">${invoice.totalHours || '-'}</td>
                <td style="padding: 8px 10px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 11px;">${formatCurrency(((invoice.user?.grossPay / invoice?.user?.totalHoursPerMonth) || 0), currencyInfo.code)}</td>
                <td style="padding: 8px 10px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #111827; font-size: 11px;">${formatCurrency(invoice.amount || 0, currencyInfo.code)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
          <div style="width: 250px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.amount || 0, currencyInfo.code)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; color: #6b7280;">
              <span>Tax:</span>
              <span>${formatCurrency(0, currencyInfo.code)}</span>
            </div>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #111827;">
                <span>Total:</span>
                <span>${formatCurrency(invoice.amount || 0, currencyInfo.code)}</span>
              </div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #9ca3af; text-align: right;">
              Showing amounts in <span style="font-weight: 600;">${currencyInfo.code}</span> (${currencyInfo.origin} currency)
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        ${invoice.user?.bankDetails ? `
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 16px; background: #fafafa;">
          <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 10px 0;">Payment Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Bank Name</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.bankName || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Branch</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.branch || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Account Name</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.accountName || 'N/A'}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">Account Number</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.accountNumber || 'N/A'}</div>
            </div>
            <div style="grid-column: 1 / -1;">
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">SWIFT Code</div>
              <div style="font-weight: 500; color: #111827;">${invoice.user?.bankDetails?.swiftCode || 'N/A'}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 16px; text-align: center; font-size: 10px; color: #6b7280;">
          <p style="margin: 0 0 4px 0;">Thank you for your business!</p>
          <p style="margin: 0;">For any questions regarding this invoice, please contact ${invoice.user?.email || 'support@company.com'}</p>
        </div>
      </div>
    `
      await generatePdf(html)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 min-w-[60vw] max-h-[95vh] bg-gray-50 overflow-y-auto">
        <br />
        <br />
        <DialogTitle className="sr-only">Invoice Details {invoice.invoiceNumber ? `- ${invoice.invoiceNumber}` : ''}</DialogTitle>
        <Card className="shadow-none border-none bg-transparent">

          <CardHeader className="pb-4">
            {/* Company Logo at the top */}
            <div className="flex  items-center pt-6 pb-2">
              <img
                src={companyLogo}
                alt="Company Logo"
                style={{ maxHeight: 64, maxWidth: 120, objectFit: 'contain', background: 'none' }}
                className="mb-2 mix-blend-multiply"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">{invoice.invoiceNumber}</CardDescription>
            {invoice.user?.company && (
              <div className="bg-primary text-white px-4 py-6 rounded mt-2">
                <span className="text-lg font-bold">{invoice.user.company.name}</span>
                <span className="block text-xs">{invoice.user.company.sector}</span>
              </div>
            )}
            <div className={`inline-block px-3 py-1 rounded-full w-[max-content] text-xs font-medium border mt-2 ${getStatusColor(invoice.status)}`}>{invoice.status?.toUpperCase()}</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-neutral-800 border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center text-primary"><Calendar className="w-4 h-4 mr-2 text-primary" />Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Issue Date:</span><span className="font-medium">{typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Period:</span><span className="font-medium">{typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - {typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Last Updated:</span><span className="font-medium">{typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span></div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-neutral-800 border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center text-primary"><Building2 className="w-4 h-4 mr-2 text-primary" />Consultant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><span className="font-semibold text-gray-900 dark:text-white">{invoice.user?.fullName}</span><span className="block text-gray-600 dark:text-gray-300 capitalize">{invoice.user?.jobTitle} Consultant</span></div>
                  <div className="flex items-center text-muted-foreground"><Mail className="w-4 h-4 mr-2" /><span>{invoice.user?.email}</span></div>
                  <div className="flex items-center text-muted-foreground"><Phone className="w-4 h-4 mr-2" /><span>{invoice.user?.phoneNumber}</span></div>
                  {invoice.user?.address && (<div className="flex items-start text-muted-foreground"><MapPin className="w-4 h-4 mr-2 mt-1" /><span>{invoice.user.address.street}, {invoice.user.address.city}, {invoice.user.address.state}, {invoice.user.address.country}</span></div>)}
                </CardContent>
              </Card>
            </div>
            {invoice.description && (
              <Card className="bg-white border-none">
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-primary">Service Description</CardTitle></CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-200 text-sm">{invoice.description}</CardContent>
              </Card>
            )}
            <Card className=" bg-white">
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
                      <td className="px-4 py-3"><span className="font-medium text-gray-900 dark:text-white">Consulting Services</span><span className="block text-xs text-gray-500 dark:text-gray-400">Period: {typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to {typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span></td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{invoice.totalHours || '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{formatCurrency(invoice.user?.hourlyRate || 0, currencyInfo.code)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.amount || 0, currencyInfo.code)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-neutral-800 border-none">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal:</span><span>{formatCurrency(invoice.amount || 0, currencyInfo.code)}</span></div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Tax:</span><span>{formatCurrency(0, currencyInfo.code)}</span></div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white items-center"><span className="flex items-center gap-1">Total:<TooltipProvider><Tooltip><TooltipTrigger asChild><span tabIndex={0}><Info className="w-4 h-4 text-primary ml-1" /></span></TooltipTrigger><TooltipContent><span>Currency: {currencyInfo.code} <br />Source: {currencyInfo.origin}</span></TooltipContent></Tooltip></TooltipProvider></span><span>{formatCurrency(invoice.amount || 0, currencyInfo.code)}</span></div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-right">Showing amounts in <span className="font-semibold">{currencyInfo.code}</span> ({currencyInfo.origin} currency)</div>
              </CardContent>
            </Card>
            {invoice.user?.bankDetails && (
              <Card className="bg-white dark:from-neutral-900 dark:to-blue-950 border-none">
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center text-primary"><CreditCard className="w-4 h-4 mr-2 text-primary" />Payment Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Bank Name</span><span className="block font-medium">{invoice.user.bankDetails.bankName}</span></div>
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Branch</span><span className="block font-medium">{invoice.user.bankDetails.branch}</span></div>
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Account Name</span><span className="block font-medium">{invoice.user.bankDetails.accountName}</span></div>
                  <div><span className="text-xs text-gray-600 dark:text-gray-300">Account Number</span><span className="block font-medium">{invoice.user.bankDetails.accountNumber}</span></div>
                  <div className="md:col-span-2"><span className="text-xs text-gray-600 dark:text-gray-300">SWIFT Code</span><span className="block font-medium">{invoice.user.bankDetails.swiftCode}</span></div>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex-col border-t pt-4">
            <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
              <p>Thank you for your business!</p>
              {invoice.user?.email && (<p className="mt-1">For any questions regarding this invoice, please contact {invoice.user.email}</p>)}
            </div>
          </CardFooter>
        </Card>
        {/* Comment Section with Checks */}
        <CardFooter className="flex-col items-start gap-2 px-0 pb-0 pt-0 border-t border-gray-200 dark:border-neutral-800">
          <div className="w-full">
            <Card className="bg-white border-none shadow-none w-full">
              <CardContent className="py-4 px-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  {roleName === "company-admin" ? (
                    <>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={reviewed} disabled /> Reviewed
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={satisfied} disabled /> Satisfied
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={approved} disabled /> Approved
                      </label>
                    </>
                  ) : boardMemberRole === "reviewer" ? (
                    <>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={reviewed} onCheckedChange={checked => setReviewed(checked === true)} /> Reviewed
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={satisfied} onCheckedChange={checked => setSatisfied(checked === true)} /> Satisfied
                      </label>
                    </>
                  ) : boardMemberRole === "approver" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={approved} onCheckedChange={checked => setApproved(checked === true)} /> Approved
                    </label>
                  ) : null}
                </div>
                {/* Get current user role and conditionally render comment input */}
                {(() => {
                  let userRole = undefined;
                  if (typeof window !== 'undefined') {
                    const authData = getAuthData();
                    userRole = authData?.user?.role?.name;
                  }
                  if (userRole !== 'Company Admin') {
                    return (
                      <>
                        <div className="mb-4">
                          <Label htmlFor="invoice-comment" className="text-xs mb-1">Add Comment</Label>
                          <Textarea
                            id="invoice-comment"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows={2}
                            className="resize-none mt-1"
                            disabled={saving}
                          />
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Comments</span>
                          <Button size="sm" variant="default" onClick={handleSave} disabled={saving || (!comment.trim() && !checksChanged)}>
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}

                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto">
                  {commentsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-4 w-4 rounded-full bg-gray-200 animate-pulse inline-block" />
                      Loading comments...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No comments yet.</div>
                  ) : (
                    <>
                      {(showAllComments ? comments : [comments[comments.length - 1]]).map((c, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{c.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{c.author}</span>
                              {c.boardMemberRole && (
                                <Badge variant="secondary" className="text-xs capitalize">{c.boardMemberRole}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{c.date}</span>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{c.content}</div>
                          </div>
                        </div>
                      ))}
                      {comments.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline self-start mt-1"
                          onClick={() => setShowAllComments(v => !v)}
                        >
                          {showAllComments ? 'Show less' : `Show more (${comments.length - 1} more)`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardFooter>
        {/* End Comment Section */}
        <CardFooter className="flex justify-end gap-2 px-6 pb-4 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
        </CardFooter>
      </DialogContent>
      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Invoice Action</AlertDialogTitle>
            <AlertDialogDescription>
              {approved && "You are about to approve this invoice. "}
              {satisfied && "You are marking this invoice as satisfied. "}
              {reviewed && "You are marking this invoice as reviewed. "}
              {comment.trim() && "You are adding a comment. "}
              This action will update the invoice status and cannot be undone easily. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-primary">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
} 