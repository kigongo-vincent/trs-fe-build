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
import { generatePdf, imageToBase64 } from "@/utils/GeneratePDF"
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
  const [filterParams, setFilterParams] = useState<{ status: string, startDate: string, endDate: string }>({ status: "all", startDate: "", endDate: "" })

  // Add a ref to InvoiceTable for PDF download
  const invoiceTableRef = useRef<{ handleAllInvoicesPDF: () => void } | null>(null)

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
    setStatus("all")
    setStartDate("")
    setEndDate("")
    setFilterParams({ status: "all", startDate: "", endDate: "" })
  }

  const isFilterActive = status !== "all" || !!startDate || !!endDate

  // Handler to trigger PDF from top button
  const handleTopDownloadPDF = () => {
    invoiceTableRef.current?.handleAllInvoicesPDF()
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

      <div onClick={handleFilterSubmit} className="bg-paper rounded p-4">
        <Tabz.Root value={status} onValueChange={setStatus} className="flex flex-col space-y-2">

          <Tabz.List className="flex space-x-2">

            <Tabz.Trigger
              value="approved"
              className="px-3 py-1.5 text-sm rounded-md border text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Approved
            </Tabz.Trigger>
            <Tabz.Trigger
              value="pending"
              className="px-3 py-1.5 text-sm rounded-md border text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Pending
            </Tabz.Trigger>
            <Tabz.Trigger
              value="processing"
              className="px-3 py-1.5 text-sm rounded-md border text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Processing
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
          <CardTitle className="text-xl font-medium">All Invoices</CardTitle>
          <CardDescription>Manage and track all company invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceTable ref={invoiceTableRef} currency={companyCurrency} searchTerm={searchTerm} filterParams={filterParams} boardMemberRole={boardMemberRole} roleName={roleName} />
        </CardContent>
      </Card>
    </div>
  )
}

const InvoiceTable = React.forwardRef(function InvoiceTable(
  { currency, searchTerm, filterParams, boardMemberRole, roleName }: { currency: string, searchTerm?: string, filterParams?: { status: string, startDate: string, endDate: string }, boardMemberRole?: string, roleName?: string },
  ref: React.ForwardedRef<{ handleAllInvoicesPDF: () => void }>
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
        if (filterParams.status && filterParams.status !== "all") {
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
  }, [invoices])

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
    const newSelected = new Set(selectedInvoices)
    if (checked) {
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
      const allIds = new Set(sortedInvoices.map(invoice => invoice.id))
      setSelectedInvoices(allIds)
      setSelectAll(true)
    } else {
      setSelectedInvoices(new Set())
      setSelectAll(false)
    }
  }

  const [loading2, setLoading2] = useState(false)

  const handleApproveAll = async () => {
    const selectedIds = Array.from(selectedInvoices)
    setLoading2(true)
    try {

      const data = await postRequest(`/company/invoices/approve/${authData.user.company.id}`, { invoiceIds: selectedIds })
      if (data) {
        fetchInvoicesWithRetry(1)
      }
    } catch (err) {
      console.warn(err)
    } finally {

      setLoading2(false)
    }
  }

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue: any, bValue: any
    switch (sortBy) {
      case "invoiceNumber":
        aValue = a.invoiceNumber || a.id
        bValue = b.invoiceNumber || b.id
        break
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
        aValue = a.invoiceNumber || a.id
        bValue = b.invoiceNumber || b.id
    }
    if (aValue < bValue) return sortDir === "asc" ? -1 : 1
    if (aValue > bValue) return sortDir === "asc" ? 1 : -1
    return 0
  })

  // PDF download for row (stateless: checkboxes No, comment empty)
  const handleRowDownloadPDF = async (invoice: any) => {
    try {
      const reviewedText = 'No'
      const satisfiedText = 'No'
      const approvedText = 'No'
      const commentBlock = ''
      const statusColor = getStatusColor(invoice.status)
      const statusText = invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'

      const html = `
        <div class="bg-white p-8 max-w-4xl mx-auto">
          <!-- Header -->
          <div class="border-b-2 border-gray-300 pb-6 mb-6">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p class="text-lg text-gray-600">${invoice.invoiceNumber || invoice.id}</p>
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
            <h2 class="text-xl font-bold mb-1">${invoice.user?.company?.name || 'Company Name'}</h2>
            <p class="text-blue-100 text-sm">${invoice.user?.company?.sector || 'Sector'}</p>
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
                  <span class="font-medium">${typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Period:</span>
                  <span class="font-medium">${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Updated:</span>
                  <span class="font-medium">${typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
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
                  <span class="font-semibold text-gray-900">${invoice.user?.fullName || 'Consultant Name'}</span>
                  <p class="text-gray-600 capitalize">${invoice.user?.jobTitle || 'Consultant'} Consultant</p>
                </div>
                <div class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>${invoice.user?.email || 'email@example.com'}</span>
                </div>
                <div class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>${invoice.user?.phoneNumber || 'Phone Number'}</span>
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
                      <p class="text-xs text-gray-500">Period: ${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</p>
                    </td>
                    <td class="px-4 py-3 text-center text-gray-900">${invoice.totalHours || '-'}</td>
                    <td class="px-4 py-3 text-center text-gray-900">${invoice.user.currency} ${((invoice.user?.grossPay / invoice?.user?.totalHoursPerMonth).toFixed(2) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="px-4 py-3 text-right font-medium text-gray-900">${invoice.user.currency} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                <span>${invoice.user.currency} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>${invoice.user.currency} 0.00</span>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between text-base font-bold text-gray-900">
                  <span>Total:</span>
                  <span>${invoice.user.currency} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500 text-right">
              Showing amounts in <span class="font-semibold">${invoice.user.currency}</span> (User currency)
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
                <p class="font-medium">${invoice.user?.bankDetails?.bankName || 'N/A'}</p>
              </div>
              <div>
                <span class="text-gray-300 text-xs">Branch</span>
                <p class="font-medium">${invoice.user?.bankDetails?.branch || 'N/A'}</p>
              </div>
              <div>
                <span class="text-gray-300 text-xs">Account Name</span>
                <p class="font-medium">${invoice.user?.bankDetails?.accountName || 'N/A'}</p>
              </div>
              <div>
                <span class="text-gray-300 text-xs">Account Number</span>
                <p class="font-medium">${invoice.user?.bankDetails?.accountNumber || 'N/A'}</p>
              </div>
              <div class="md:col-span-2">
                <span class="text-gray-300 text-xs">SWIFT Code</span>
                <p class="font-medium">${invoice.user?.bankDetails?.swiftCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          <!-- Review Status -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Review Status</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Reviewed:</span>
                <span class="font-medium">${reviewedText}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Satisfied:</span>
                <span class="font-medium">${satisfiedText}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Approved:</span>
                <span class="font-medium">${approvedText}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-gray-500 text-xs border-t pt-4">
            <p>Thank you for your business!</p>
            <p class="mt-1">For any questions regarding this invoice, please contact ${invoice.user?.email || 'support@company.com'}</p>
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
        'Invoice Number',
        'Email',
        'Status',
        'Amount',
      ];
      // Build table rows from filteredInvoices
      const rows = filteredInvoices.map(inv => [
        inv.invoiceNumber || inv.id || '-',
        inv.user?.email || '-',
        inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : '-',
        (inv.amount != null && !isNaN(Number(inv.amount)))
          ? `${currency} ${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'N/A',
      ]);


      let logo = authData?.user?.company?.logo;
      let logoBase64 = '';
      if (logo) {
        try {
          logoBase64 = await imageToBase64(logo);
        } catch (e) {
          logoBase64 = '';
        }
      }

      // Build HTML table
      const tableHtml = `
      ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="h-32 mb-4">` : ''}
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

  useImperativeHandle(ref, () => ({ handleAllInvoicesPDF }))

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
        {selectedInvoices.size > 0 && (
          <Button
            onClick={handleApproveAll}
            variant="default"
            size="sm"
            className="bg-primary"
          >
            {loading2 ? "Updating..." : "Approve All"} ({selectedInvoices.size})
          </Button>
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
              className={`cursor-pointer select-none ${sortBy === "invoiceNumber" ? "text-primary font-semibold" : ""}`}
              onClick={() => handleSort("invoiceNumber")}
            >
              Invoice Number
              {sortArrow("invoiceNumber")}
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
                {invoice.status != "approved" && <Checkbox
                  checked={selectedInvoices.has(invoice.id)}
                  onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked === true)}
                  aria-label={`Select invoice ${invoice.invoiceNumber || invoice.id}`}
                />}
              </TableCell>
              <TableCell className="font-medium">{invoice.invoiceNumber || invoice.id}</TableCell>
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
  // Save both checks and comment
  const handleSave = async () => {
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
    } catch (e) {
      // Error already handled by onError
    }
  };
  // PDF Generation (basic, organized, with inline HTML/CSS and table borders)
  const handleDownloadPDF = async () => {
    try {
      const reviewedText = reviewed ? 'Yes' : 'No'
      const satisfiedText = satisfied ? 'Yes' : 'No'
      const approvedText = approved ? 'Yes' : 'No'
      // Use the first comment for PDF (or empty)
      const firstComment = comments[0]?.content || ''
      const statusColor = getStatusColor(invoice.status)
      const statusText = invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'

      const html = `
        <div class="bg-white p-8 max-w-4xl mx-auto">
          <!-- Header -->
          <div class="border-b-2 border-gray-300 pb-6 mb-6">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p class="text-lg text-gray-600">${invoice.invoiceNumber || invoice.id}</p>
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
            <h2 class="text-xl font-bold mb-1">${invoice.user?.company?.name || 'Company Name'}</h2>
            <p class="text-blue-100 text-sm">${invoice.user?.company?.sector || 'Sector'}</p>
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
                  <span class="font-medium">${typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Period:</span>
                  <span class="font-medium">${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Updated:</span>
                  <span class="font-medium">${typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span>
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
                  <span class="font-semibold text-gray-900">${invoice.user?.fullName || 'Consultant Name'}</span>
                  <p class="text-gray-600 capitalize">${invoice.user?.jobTitle || 'Consultant'} Consultant</p>
                </div>
                <div class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>${invoice.user?.email || 'email@example.com'}</span>
                </div>
                <div class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>${invoice.user?.phoneNumber || 'Phone Number'}</span>
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
                      <p class="text-xs text-gray-500">Period: ${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</p>
                    </td>
                    <td class="px-4 py-3 text-center text-gray-900">${invoice.totalHours || '-'}</td>
                    <td class="px-4 py-3 text-center text-gray-900">${currencyInfo.code} ${((invoice.user?.grossPay / invoice?.user?.totalHoursPerMonth).toFixed(2) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="px-4 py-3 text-right font-medium text-gray-900">${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                <span>${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>${currencyInfo.code} 0.00</span>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between text-base font-bold text-gray-900">
                  <span>Total:</span>
                  <span>${invoice.user.currency} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500 text-right">
              Showing amounts in <span class="font-semibold">${currencyInfo.code}</span> (${currencyInfo.origin} currency)
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
                <p class="font-medium">${invoice.user?.bankDetails?.bankName || 'N/A'}</p>
              </div>
              <div>
                <span class="text-gray-300 text-xs">Branch</span>
                <p class="font-medium">${invoice.user?.bankDetails?.branch || 'N/A'}</p>
              </div>
              <div>
                <span class="text-gray-300 text-xs">Account Name</span>
                <p class="font-medium">${invoice.user?.bankDetails?.accountName || 'N/A'}</p>
              </div>
              <div>
                <span class="text-gray-300 text-xs">Account Number</span>
                <p class="font-medium">${invoice.user?.bankDetails?.accountNumber || 'N/A'}</p>
              </div>
              <div class="md:col-span-2">
                <span class="text-gray-300 text-xs">SWIFT Code</span>
                <p class="font-medium">${invoice.user?.bankDetails?.swiftCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          <!-- Review Status -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Review Status</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Reviewed:</span>
                <span class="font-medium">${reviewedText}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Satisfied:</span>
                <span class="font-medium">${satisfiedText}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Approved:</span>
                <span class="font-medium">${approvedText}</span>
              </div>
              ${firstComment ? `
              <div class="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <div class="text-sm">
                  <span class="font-medium text-gray-900">Comment:</span>
                  <p class="text-gray-700 mt-1">${firstComment}</p>
                </div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-gray-500 text-xs border-t pt-4">
            <p>Thank you for your business!</p>
            <p class="mt-1">For any questions regarding this invoice, please contact ${invoice.user?.email || 'support@company.com'}</p>
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
    </Dialog>
  )
} 