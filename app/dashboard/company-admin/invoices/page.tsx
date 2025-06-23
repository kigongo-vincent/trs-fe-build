"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Download, Eye, FileText, Plus, Search, FileDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MonthlyInvoiceChart } from "@/components/monthly-invoice-chart"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/company-admin/invoices/create">
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Link>
          </Button>
          <InvoiceActions />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <p className="text-xs text-muted-foreground">86% of total invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">14% of total invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$168,750</div>
            <p className="text-xs text-muted-foreground">For current fiscal year</p>
          </CardContent>
        </Card>
      </div>

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
          <InvoiceTable />
        </CardContent>
      </Card>
    </div>
  )
}

function InvoiceTable() {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  const invoices = [
    {
      id: "INV-2025-05-001",
      employee: "John Smith",
      department: "Development",
      period: "May 2025",
      amount: 4250.0,
      status: "pending",
    },
    {
      id: "INV-2025-05-002",
      employee: "Sarah Johnson",
      department: "Design",
      period: "May 2025",
      amount: 4125.0,
      status: "pending",
    },
    {
      id: "INV-2025-04-001",
      employee: "John Smith",
      department: "Development",
      period: "April 2025",
      amount: 4125.0,
      status: "paid",
    },
    {
      id: "INV-2025-04-002",
      employee: "Sarah Johnson",
      department: "Design",
      period: "April 2025",
      amount: 4000.0,
      status: "paid",
    },
    {
      id: "INV-2025-03-001",
      employee: "John Smith",
      department: "Development",
      period: "March 2025",
      amount: 4375.0,
      status: "paid",
    },
    {
      id: "INV-2025-03-002",
      employee: "Sarah Johnson",
      department: "Design",
      period: "March 2025",
      amount: 4250.0,
      status: "paid",
    },
  ]

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId) ? prev.filter((id) => id !== invoiceId) : [...prev, invoiceId],
    )
  }

  const toggleAllInvoices = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(invoices.map((invoice) => invoice.id))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox
              checked={selectedInvoices.length === invoices.length && invoices.length > 0}
              onCheckedChange={toggleAllInvoices}
              aria-label="Select all invoices"
            />
          </TableHead>
          <TableHead>Invoice #</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              <Checkbox
                checked={selectedInvoices.includes(invoice.id)}
                onCheckedChange={() => toggleInvoice(invoice.id)}
                aria-label={`Select invoice ${invoice.id}`}
              />
            </TableCell>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.employee}</TableCell>
            <TableCell>{invoice.department}</TableCell>
            <TableCell>{invoice.period}</TableCell>
            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  invoice.status === "paid"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                }
              >
                {invoice.status === "paid" ? "Paid" : "Pending"}
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
