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
import { useState, useEffect, useRef } from "react"
import { getCompanyInvoicesSummary, getRequest } from "@/services/api"
import { getAuthData } from "@/services/auth"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function InvoicesPage() {
  const [summary, setSummary] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  // Filter states
  const [status, setStatus] = useState("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [filterLoading, setFilterLoading] = useState(false)
  const [filterParams, setFilterParams] = useState<{ status: string, startDate: string, endDate: string }>({ status: "all", startDate: "", endDate: "" })

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true)
      setError(null)
      try {
        const authData = getAuthData()
        const companyId = authData?.user?.company?.id
        if (!companyId) throw new Error("Company ID not found")
        const res: any = await getCompanyInvoicesSummary(companyId)
        setSummary(res.data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch summary")
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  // Find the currency from the summary data (if present)
  const totalAmountItem = summary?.find((item) => item.label === "Total Amount")
  const currency = totalAmountItem?.currency || "USD"
  const showDisclaimer = !totalAmountItem?.currency || totalAmountItem.currency !== "USD"

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <div className="flex items-center gap-2">
          <InvoiceActions />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-[110px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium bg-gray-200 rounded w-24 h-4" />
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold bg-gray-200 rounded w-16 h-6" />
                <p className="text-xs text-muted-foreground bg-gray-100 rounded w-20 h-3 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-4 text-red-500">{error}</div>
        ) : summary ? (
          summary.map((item, i) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.label === "Total Amount" ? `${item.currency || "USD"} ${Number(item.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : item.value}</div>
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
          <MonthlyInvoiceChart />
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
              <XIcon className="h-4 w-4" />
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
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Manage and track all company invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceTable currency={currency} searchTerm={searchTerm} filterParams={filterParams} />
        </CardContent>
      </Card>
    </div>
  )
}

function InvoiceTable({ currency, searchTerm, filterParams }: { currency: string, searchTerm?: string, filterParams?: { status: string, startDate: string, endDate: string } }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("invoiceNumber")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([])
  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true)
      setError(null)
      try {
        const authData = getAuthData()
        const companyId = authData?.user?.company?.id
        if (!companyId) throw new Error("Company ID not found")
        let url = `/company/invoices/${companyId}`
        let params: any = {}
        if (searchTerm) {
          params.search = searchTerm
        } else if (filterParams) {
          if (filterParams.status && filterParams.status !== "all") params.status = filterParams.status
          if (filterParams.startDate) params.startDate = filterParams.startDate
          if (filterParams.endDate) params.endDate = filterParams.endDate
        }
        const query = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : ""
        const res: any = await getRequest(url + query)
        setInvoices(res.data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch invoices")
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
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

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center">Loading...</div>
  }
  if (error) {
    return <div className="h-[300px] flex items-center justify-center text-red-500">{error}</div>
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/company-admin/invoices/${invoice.id}/download`}>
                      <Download className="h-4 w-4 mr-1" /> PDF
                    </Link>
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 min-w-[60vw] max-h-[95vh] bg-gray-50 overflow-y-auto">
        <br />
        <br />
        <DialogTitle className="sr-only">Invoice Details {invoice.invoiceNumber ? `- ${invoice.invoiceNumber}` : ''}</DialogTitle>
        <Card className="shadow-none border-none bg-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">{invoice.invoiceNumber}</CardDescription>
            {invoice.user?.company && (
              <div className="bg-primary text-white px-4 py-6 rounded mt-2">
                <span className="text-lg font-bold">{invoice.user.company.name}</span>
                <span className="block text-blue-100 text-xs">{invoice.user.company.sector}</span>
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
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Issue Date:</span><span className="font-medium">{formatDate(invoice.createdAt || invoice.startDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Period:</span><span className="font-medium">{formatDate(invoice.startDate)} - {formatDate(invoice.endDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Last Updated:</span><span className="font-medium">{formatDate(invoice.updatedAt || invoice.endDate)}</span></div>
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
              <Card className=" dark:bg-blue-900/30 ">
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
                      <td className="px-4 py-3"><span className="font-medium text-gray-900 dark:text-white">Consulting Services</span><span className="block text-xs text-gray-500 dark:text-gray-400">Period: {formatDate(invoice.startDate)} to {formatDate(invoice.endDate)}</span></td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{invoice.totalHours || '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{formatCurrency(invoice.user?.grossPay || 0, currencyInfo.code)}</td>
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
            <CardFooter className="flex-col border-t pt-4">
              <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
                <p>Thank you for your business!</p>
                {invoice.user?.email && (<p className="mt-1">For any questions regarding this invoice, please contact {invoice.user.email}</p>)}
              </div>
            </CardFooter>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 px-6 pb-4 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button asChild>
              <Link href={`/dashboard/company-admin/invoices/${invoice.id}/download`}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

function InvoiceActions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Download
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <div className="grid gap-2">
          <h4 className="font-medium leading-none">Download Options</h4>
          <p className="text-sm text-muted-foreground">Choose a download format</p>
          <div className="grid gap-2 pt-2">
            <Button size="sm" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" /> All Invoices (PDF)
            </Button>
            <Button size="sm" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" /> Selected Invoices (PDF)
            </Button>
            <Button size="sm" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" /> Export as CSV
            </Button>
            <Button size="sm" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" /> Export as Excel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
