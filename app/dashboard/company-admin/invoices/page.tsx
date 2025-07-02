"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Download, Eye, FileText, Plus, Search, FileDown, Triangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MonthlyInvoiceChart } from "@/components/monthly-invoice-chart"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { getCompanyInvoicesSummary, getRequest } from "@/services/api"
import { getAuthData } from "@/services/auth"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

export default function InvoicesPage() {
  const [summary, setSummary] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
                <div className="text-2xl font-bold">{item.label === "Total Amount" ? `USD ${Number(item.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : item.value}</div>
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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="text" placeholder="Search invoices..." className="h-9" />
          <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3">
            <Search className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Search</span>
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Filter by date range</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={new Date(2025, 4)}
                selected={{
                  from: new Date(2025, 0, 1),
                  to: new Date(2025, 4, 11),
                }}
              />
            </PopoverContent>
          </Popover>
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Manage and track all company invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceTable currency={currency} />
        </CardContent>
      </Card>
    </div>
  )
}

function InvoiceTable({ currency }: { currency: string }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("invoiceNumber")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true)
      setError(null)
      try {
        const authData = getAuthData()
        const companyId = authData?.user?.company?.id
        if (!companyId) throw new Error("Company ID not found")
        const res: any = await getRequest(`/company/invoices/${companyId}`)
        setInvoices(res.data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch invoices")
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDir("asc")
    }
  }

  const sortedInvoices = [...invoices].sort((a, b) => {
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
  if (!invoices.length) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className={`cursor-pointer select-none ${sortBy === "invoiceNumber" ? "text-primary font-semibold" : ""}`}
            onClick={() => handleSort("invoiceNumber")}
          >
            Invoice #
            {sortArrow("invoiceNumber")}
          </TableHead>
          <TableHead
            className={`cursor-pointer select-none ${sortBy === "employee" ? "text-primary font-semibold" : ""}`}
            onClick={() => handleSort("employee")}
          >
            Employee
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
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/company-admin/invoices/${invoice.id}`}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Link>
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
