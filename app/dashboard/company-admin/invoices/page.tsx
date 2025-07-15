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
import { getCompanyInvoicesSummary, getRequest } from "@/services/api"
import { getAuthData } from "@/services/auth"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import jsPDF from "jspdf"
import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Helper function for date formatting (top-level, shared)
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
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
  const [status, setStatus] = useState("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [filterLoading, setFilterLoading] = useState(false)
  const [filterParams, setFilterParams] = useState<{ status: string, startDate: string, endDate: string }>({ status: "all", startDate: "", endDate: "" })

  // Add a ref to InvoiceTable for PDF download
  const invoiceTableRef = useRef<{ handleAllInvoicesPDF: () => void } | null>(null)

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

  // Sample data for MonthlyInvoiceChart (you can replace this with real API data)
  const monthlyInvoiceData = [
    { month: "January", totalAmount: 0, currency: currency },
    { month: "February", totalAmount: 0, currency: currency },
    { month: "March", totalAmount: 0, currency: currency },
    { month: "April", totalAmount: 0, currency: currency },
    { month: "May", totalAmount: 0, currency: currency },
    { month: "June", totalAmount: 0, currency: currency },
    { month: "July", totalAmount: 0, currency: currency },
    { month: "August", totalAmount: 0, currency: currency },
    { month: "September", totalAmount: 0, currency: currency },
    { month: "October", totalAmount: 0, currency: currency },
    { month: "November", totalAmount: 0, currency: currency },
    { month: "December", totalAmount: 0, currency: currency },
  ]

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Invoices</h1>
        <div className="flex items-center gap-2">
          <InvoiceActions onDownloadAll={handleTopDownloadPDF} />
        </div>
      </div>

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
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{item.label === "Total Amount" ? `${item.currency || "USD"} ${Number(item.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : item.value}</div>
                <p className="text-xs text-muted-foreground">
                  {item.label === "Total Invoices" && ""}
                  {item.label === "Paid Invoices" && summary[0]?.value > 0 ? `${Math.round((item.value / summary[0].value) * 100)}% of total invoices` : item.label === "Paid Invoices" ? "0% of total invoices" : null}
                  {item.label === "Pending Invoices" && summary[0]?.value > 0 ? `${Math.round((item.value / summary[0].value) * 100)}% of total invoices` : item.label === "Pending Invoices" ? "0% of total invoices" : null}
                  {item.label === "Total Amount" && "For current fiscal year"}
                </p>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>
      {showDisclaimer && (
        <div className="text-xs text-muted-foreground mt-2">
          * Amounts are shown in USD by default. If your data uses a different currency, please check your company settings.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Monthly Invoices</CardTitle>
          <CardDescription>Invoice amounts by month</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
            </div>
          ) : (
            <MonthlyInvoiceChart data={monthlyInvoiceData} />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-end mt-3 md:justify-between">
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
          <div className="flex flex-col">
            <label htmlFor="status-filter" className="text-xs text-muted-foreground font-normal mb-1">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter" className="h-9 w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">All Invoices</CardTitle>
          <CardDescription>Manage and track all company invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceTable ref={invoiceTableRef} currency={currency} searchTerm={searchTerm} filterParams={filterParams} />
        </CardContent>
      </Card>
    </div>
  )
}

const InvoiceTable = React.forwardRef(function InvoiceTable(
  { currency, searchTerm, filterParams }: { currency: string, searchTerm?: string, filterParams?: { status: string, startDate: string, endDate: string } },
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
  }, [invoices])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDir("asc")
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
  const handleRowDownloadPDF = (invoice: any) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
    const reviewedText = 'No'
    const satisfiedText = 'No'
    const approvedText = 'No'
    const commentBlock = ''
    const currencyInfo = { code: currency, origin: 'Company' }
    const html = `
      <div style='font-family: Arial, sans-serif; color: #222; font-size: 12pt; max-width: 700px;'>
        <h2 style='margin-bottom: 0;'>INVOICE</h2>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px;'><b>Invoice Number:</b></td><td style='padding:4px;'>${invoice.invoiceNumber || invoice.id}</td></tr>
          <tr><td style='padding:4px;'><b>Status:</b></td><td style='padding:4px;'>${invoice.status ? invoice.status.toUpperCase() : '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Issue Date:</b></td><td style='padding:4px;'>${typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Period:</b></td><td style='padding:4px;'>${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Last Updated:</b></td><td style='padding:4px;'>${typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</td></tr>
        </table>
        <h3 style='margin-bottom: 4px;'>Consultant Information</h3>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px;'><b>Name:</b></td><td style='padding:4px;'>${invoice.user?.fullName || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Email:</b></td><td style='padding:4px;'>${invoice.user?.email || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Phone:</b></td><td style='padding:4px;'>${invoice.user?.phoneNumber || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Job Title:</b></td><td style='padding:4px;'>${invoice.user?.jobTitle || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Company:</b></td><td style='padding:4px;'>${invoice.user?.company?.name || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Address:</b></td><td style='padding:4px;'>${invoice.user?.address ? `${invoice.user.address.street}, ${invoice.user.address.city}, ${invoice.user.address.state}, ${invoice.user.address.country}` : '-'}</td></tr>
        </table>
        <h3 style='margin-bottom: 4px;'>Invoice Items</h3>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr style='background:#f5f5f5;'>
            <th style='border:1px solid #bbb; padding:8px;'>Description</th>
            <th style='border:1px solid #bbb; padding:8px;'>Hours</th>
            <th style='border:1px solid #bbb; padding:8px;'>Rate</th>
            <th style='border:1px solid #bbb; padding:8px;'>Amount</th>
          </tr>
          <tr>
            <td style='border:1px solid #bbb; padding:8px;'>Consulting Services<br><span style='font-size:10pt;color:#888;'>Period: ${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span></td>
            <td style='border:1px solid #bbb; padding:8px; text-align:center;'>${invoice.totalHours || '-'}</td>
            <td style='border:1px solid #bbb; padding:8px; text-align:center;'>${currencyInfo.code} ${(invoice.user?.grossPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style='border:1px solid #bbb; padding:8px; text-align:right;'>${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px; text-align:right;'><b>Subtotal:</b></td><td style='padding:4px; text-align:right;'>${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
          <tr><td style='padding:4px; text-align:right;'><b>Tax:</b></td><td style='padding:4px; text-align:right;'>${currencyInfo.code} 0.00</td></tr>
          <tr><td style='padding:4px; text-align:right;'><b>Total:</b></td><td style='padding:4px; text-align:right;'>${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
        </table>
        <h3 style='margin-bottom: 4px;'>Review Status</h3>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px; border:1px solid #bbb;'><b>Reviewed:</b></td><td style='padding:4px; border:1px solid #bbb;'>${reviewedText}</td></tr>
          <tr><td style='padding:4px; border:1px solid #bbb;'><b>Satisfied:</b></td><td style='padding:4px; border:1px solid #bbb;'>${satisfiedText}</td></tr>
          <tr><td style='padding:4px; border:1px solid #bbb;'><b>Approved:</b></td><td style='padding:4px; border:1px solid #bbb;'>${approvedText}</td></tr>
          ${commentBlock}
        </table>
        <div style='margin-top:24px; color:#888; font-size:10pt;'>
          Thank you for your business!<br>
          ${invoice.user?.email ? `For any questions regarding this invoice, please contact ${invoice.user.email}` : ''}
        </div>
      </div>
    `
    doc.html(html, {
      x: 32,
      y: 32,
      width: 530,
      windowWidth: 700,
      callback: function (doc) {
        doc.save(`Invoice_${invoice.invoiceNumber || invoice.id}.pdf`)
      }
    })
  }

  // PDF download for all visible invoices
  const handleAllInvoicesPDF = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
    const margin = 32
    const pageWidth = doc.internal.pageSize.getWidth()
    const title = 'Company Invoices'
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    // Summations
    let totalAmount = 0
    let totalHours = 0
    sortedInvoices.forEach(inv => {
      totalAmount += Number(inv.amount) || 0
      totalHours += Number(inv.totalHours) || 0
    })
    // Table headers and rows
    const headers = ['Invoice #', 'Consultant', 'Period Start', 'Amount', 'Status', 'Hours']
    const columnWidths = [100, 120, 80, 80, 100, 60]
    const rows = sortedInvoices.map(inv => [
      String(inv.invoiceNumber || inv.id),
      inv.user?.fullName || '-',
      typeof inv.startDate === 'string' ? formatDate(inv.startDate) : '-',
      `${currency} ${(Number(inv.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      inv.status ? inv.status.toUpperCase() : '-',
      String(inv.totalHours || '-')
    ])
    // Title
    doc.setFontSize(18)
    doc.text(title, margin, margin)
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text(`Generated: ${dateStr}`, margin, margin + 16)
    doc.setTextColor(30)
    doc.setFontSize(11)
    // Table
    let y = margin + 32
    y = renderTableWithPageBreaks(doc, headers, rows, y, { columnWidths, marginLeft: margin, marginRight: margin })
    // Summations
    y += 16
    doc.setFont('helvetica', 'bold')
    doc.text('Total Amount:', pageWidth - margin - 160, y)
    doc.text(`${currency} ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 60, y, { align: 'right' })
    y += 18
    doc.text('Total Hours:', pageWidth - margin - 160, y)
    doc.text(`${totalHours}`, pageWidth - margin - 60, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    y += 32
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text('Thank you for your business!', margin, y)
    doc.save(`Company_Invoices_${dateStr.replace(/\s+/g, '_')}.pdf`)
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
              {Array.from({ length: 6 }).map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
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
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell className="font-medium">{invoice.invoiceNumber || invoice.id}</TableCell>
              <TableCell>{invoice.user?.fullName || "-"}</TableCell>
              <TableCell>{invoice.startDate && invoice.endDate ? `${format(new Date(invoice.startDate), "MMM yyyy")}` : "-"}</TableCell>
              <TableCell>
                {invoice.amount != null && !isNaN(Number(invoice.amount))
                  ? `${currency} ${Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    invoice.status === "paid"
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
      <InvoiceDetailsModal open={modalOpen} onOpenChange={setModalOpen} invoice={selectedInvoice} currency={currency} />
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
function InvoiceDetailsModal({ open, onOpenChange, invoice, currency }: { open: boolean, onOpenChange: (open: boolean) => void, invoice: any, currency: string }) {
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
    if (invoice.user?.currency) return { code: invoice.user.currency, origin: `Consultant` }
    if (currency) return { code: currency, origin: `Company` }
    return { code: 'USD', origin: 'Default' }
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
  // Comments state: array of {author, date, content}
  const [comments, setComments] = useState<Array<{ author: string, date: string, content: string }>>([
    // Example initial comment (could be empty)
    // { author: invoice.user?.fullName || 'Consultant', date: formatDate(invoice.createdAt), content: 'Initial invoice created.' }
  ])
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  // Comments loading state
  const [commentsLoading, setCommentsLoading] = useState(true)
  // Show more/less state
  const [showAllComments, setShowAllComments] = useState(false)
  // Simulate loading comments on mount
  React.useEffect(() => {
    setCommentsLoading(true)
    const timeout = setTimeout(() => setCommentsLoading(false), 400)
    return () => clearTimeout(timeout)
  }, [])
  const checksChanged = reviewed !== false || satisfied !== false || approved !== false // always allow save for demo
  // Save both checks and comment
  const handleSave = async () => {
    setSaving(true)
    // Add comment if not empty
    let newComments = comments
    if (comment.trim()) {
      newComments = [
        ...comments,
        {
          author: 'You',
          date: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          content: comment.trim(),
        },
      ]
      setComments(newComments)
      setComment("")
    }
    // Simulate save delay
    await new Promise(res => setTimeout(res, 700))
    setSaving(false)
  }
  // PDF Generation (basic, organized, with inline HTML/CSS and table borders)
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
    const reviewedText = reviewed ? 'Yes' : 'No'
    const satisfiedText = satisfied ? 'Yes' : 'No'
    const approvedText = approved ? 'Yes' : 'No'
    // Use the first comment for PDF (or empty)
    const firstComment = comments[0]?.content || ''
    const commentBlock = firstComment
      ? `<tr><td colspan='2' style='padding:8px; border:1px solid #bbb;'><b>Comment:</b> ${firstComment}</td></tr>`
      : ''
    const html = `
      <div style='font-family: Arial, sans-serif; color: #222; font-size: 12pt; max-width: 700px;'>
        <h2 style='margin-bottom: 0;'>INVOICE</h2>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px;'><b>Invoice Number:</b></td><td style='padding:4px;'>${invoice.invoiceNumber || invoice.id}</td></tr>
          <tr><td style='padding:4px;'><b>Status:</b></td><td style='padding:4px;'>${invoice.status ? invoice.status.toUpperCase() : '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Issue Date:</b></td><td style='padding:4px;'>${typeof invoice.createdAt === 'string' ? formatDate(invoice.createdAt) : typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Period:</b></td><td style='padding:4px;'>${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} - ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Last Updated:</b></td><td style='padding:4px;'>${typeof invoice.updatedAt === 'string' ? formatDate(invoice.updatedAt) : typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</td></tr>
        </table>
        <h3 style='margin-bottom: 4px;'>Consultant Information</h3>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px;'><b>Name:</b></td><td style='padding:4px;'>${invoice.user?.fullName || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Email:</b></td><td style='padding:4px;'>${invoice.user?.email || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Phone:</b></td><td style='padding:4px;'>${invoice.user?.phoneNumber || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Job Title:</b></td><td style='padding:4px;'>${invoice.user?.jobTitle || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Company:</b></td><td style='padding:4px;'>${invoice.user?.company?.name || '-'}</td></tr>
          <tr><td style='padding:4px;'><b>Address:</b></td><td style='padding:4px;'>${invoice.user?.address ? `${invoice.user.address.street}, ${invoice.user.address.city}, ${invoice.user.address.state}, ${invoice.user.address.country}` : '-'}</td></tr>
        </table>
        <h3 style='margin-bottom: 4px;'>Invoice Items</h3>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr style='background:#f5f5f5;'>
            <th style='border:1px solid #bbb; padding:8px;'>Description</th>
            <th style='border:1px solid #bbb; padding:8px;'>Hours</th>
            <th style='border:1px solid #bbb; padding:8px;'>Rate</th>
            <th style='border:1px solid #bbb; padding:8px;'>Amount</th>
          </tr>
          <tr>
            <td style='border:1px solid #bbb; padding:8px;'>Consulting Services<br><span style='font-size:10pt;color:#888;'>Period: ${typeof invoice.startDate === 'string' ? formatDate(invoice.startDate) : '-'} to ${typeof invoice.endDate === 'string' ? formatDate(invoice.endDate) : '-'}</span></td>
            <td style='border:1px solid #bbb; padding:8px; text-align:center;'>${invoice.totalHours || '-'}</td>
            <td style='border:1px solid #bbb; padding:8px; text-align:center;'>${currencyInfo.code} ${(invoice.user?.grossPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style='border:1px solid #bbb; padding:8px; text-align:right;'>${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px; text-align:right;'><b>Subtotal:</b></td><td style='padding:4px; text-align:right;'>${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
          <tr><td style='padding:4px; text-align:right;'><b>Tax:</b></td><td style='padding:4px; text-align:right;'>${currencyInfo.code} 0.00</td></tr>
          <tr><td style='padding:4px; text-align:right;'><b>Total:</b></td><td style='padding:4px; text-align:right;'>${currencyInfo.code} ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
        </table>
        <h3 style='margin-bottom: 4px;'>Review Status</h3>
        <table style='width:100%; border-collapse:collapse; margin-bottom:16px;'>
          <tr><td style='padding:4px; border:1px solid #bbb;'><b>Reviewed:</b></td><td style='padding:4px; border:1px solid #bbb;'>${reviewedText}</td></tr>
          <tr><td style='padding:4px; border:1px solid #bbb;'><b>Satisfied:</b></td><td style='padding:4px; border:1px solid #bbb;'>${satisfiedText}</td></tr>
          <tr><td style='padding:4px; border:1px solid #bbb;'><b>Approved:</b></td><td style='padding:4px; border:1px solid #bbb;'>${approvedText}</td></tr>
          ${commentBlock}
        </table>
        <div style='margin-top:24px; color:#888; font-size:10pt;'>
          Thank you for your business!<br>
          ${invoice.user?.email ? `For any questions regarding this invoice, please contact ${invoice.user.email}` : ''}
        </div>
      </div>
    `
    doc.html(html, {
      x: 32,
      y: 32,
      width: 530,
      windowWidth: 700,
      callback: function (doc) {
        doc.save(`Invoice_${invoice.invoiceNumber || invoice.id}.pdf`)
      }
    })
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
              className="mb-2"
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
              <Card className=" dark:bg-blue-900/30 border-none">
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-primary">Service Description</CardTitle></CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-200 text-sm">{invoice.description}</CardContent>
              </Card>
            )}
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
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={reviewed} onCheckedChange={checked => setReviewed(checked === true)} /> Reviewed
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={satisfied} onCheckedChange={checked => setSatisfied(checked === true)} /> Satisfied
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={approved} onCheckedChange={checked => setApproved(checked === true)} /> Approved
                  </label>
                </div>
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