"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, Download, Search, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { InvoiceVolumeChart } from "@/components/invoice-volume-chart"
import { InvoiceStatusChart } from "@/components/invoice-status-chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { fetchCompanyInvoiceStats, fetchCompanyInvoices, CompanyInvoice, createCompanyInvoice, fetchCompanies } from "@/services/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const invoiceFormSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

export default function InvoicesPage() {
  const [stats, setStats] = useState([
    { label: "Total", count: 0, amount: 0 },
    { label: "Paid", count: 0, amount: 0 },
    { label: "Pending", count: 0, amount: 0 },
    { label: "Overdue", count: 0, amount: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [invoices, setInvoices] = useState<CompanyInvoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [invoicesError, setInvoicesError] = useState("")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState("")

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      companyId: "",
      amount: 0,
      currency: "USD",
      invoiceDate: "",
      dueDate: "",
      status: "Pending",
    },
  })

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError("")
      try {
        const json = await fetchCompanyInvoiceStats()
        if (json.data) setStats(json.data)
      } catch (err) {
        setError("Could not load stats.")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    async function fetchInvoices() {
      setInvoicesLoading(true)
      setInvoicesError("")
      try {
        const json = await fetchCompanyInvoices()
        if (json.data) setInvoices(json.data)
      } catch (err) {
        setInvoicesError("Could not load invoices.")
      } finally {
        setInvoicesLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  useEffect(() => {
    if (addOpen) {
      setCompaniesLoading(true)
      setCompaniesError("")
      fetchCompanies()
        .then(res => setCompanies(res.data || []))
        .catch(() => setCompaniesError("Could not load companies."))
        .finally(() => setCompaniesLoading(false))
    }
  }, [addOpen])

  const filteredInvoices = invoices.filter((invoice) => {
    const q = search.toLowerCase()
    return (
      (invoice.invoiceNumber?.toLowerCase() || "").includes(q) ||
      (invoice.companyName?.toLowerCase() || "").includes(q)
    )
  })

  const handleAddInvoice = async (values: InvoiceFormValues) => {
    try {
      await createCompanyInvoice(values)
      toast.success("Invoice created successfully!")
      setAddOpen(false)
      form.reset()
      // Refresh invoices
      setInvoicesLoading(true)
      setInvoicesError("")
      const json = await fetchCompanyInvoices()
      if (json.data) setInvoices(json.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice.")
    } finally {
      setInvoicesLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Invoices</h1>
        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="default">+ Add Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Invoice</DialogTitle>
                <DialogDescription>Create a new invoice for a company.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddInvoice)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={companiesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={companiesLoading ? "Loading companies..." : "Select company"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companiesLoading ? (
                              <div className="p-2 text-center"><Loader2 className="animate-spin inline-block mr-2" />Loading...</div>
                            ) : companiesError ? (
                              <div className="p-2 text-red-500">{companiesError}</div>
                            ) : companies.length === 0 ? (
                              <div className="p-2 text-muted-foreground">No companies found</div>
                            ) : (
                              companies.map((company: any) => (
                                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={0.01} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="KES">KES</SelectItem>
                            <SelectItem value="ZAR">ZAR</SelectItem>
                            <SelectItem value="UGX">UGX</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Dates in one row */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="invoiceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                      Create Invoice
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium bg-muted rounded animate-pulse w-24 h-4" />
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold bg-muted rounded animate-pulse w-16 h-6" />
                <p className="text-xs text-muted-foreground bg-muted rounded animate-pulse w-20 h-3 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-4 text-red-500">{error}</div>
        ) : (
          stats.map((stat, i) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label} Invoices</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count.toLocaleString()}</div>
                {stat.label === "Total" && (
                  <p className="text-xs text-muted-foreground">
                    {/* You can add a comparison here if available */}
                  </p>
                )}
                {stat.label === "Paid" && (
                  <p className="text-xs text-muted-foreground">
                    {/* You can add percentage if you have total */}
                  </p>
                )}
                {stat.label === "Pending" && (
                  <p className="text-xs text-muted-foreground">
                    {/* You can add percentage if you have total */}
                  </p>
                )}
                {stat.label === "Overdue" && (
                  <p className="text-xs text-muted-foreground">
                    {/* You can add percentage if you have total */}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Invoice Volume</CardTitle>
            <CardDescription>Monthly invoice volume across all companies</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceVolumeChart />
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Distribution by payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceStatusChart />
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Manage and monitor all invoices across companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search invoices..."
                    className="w-full pl-8"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button> */}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Status</h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="paid" />
                          <label htmlFor="paid" className="text-sm">
                            Paid
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="pending" />
                          <label htmlFor="pending" className="text-sm">
                            Pending
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="overdue" />
                          <label htmlFor="overdue" className="text-sm">
                            Overdue
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <h4 className="font-medium text-sm">Date Range</h4>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last30">Last 30 days</SelectItem>
                            <SelectItem value="last90">Last 90 days</SelectItem>
                            <SelectItem value="year">This year</SelectItem>
                            <SelectItem value="custom">Custom range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button size="sm">Apply Filters</Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <span>Invoice</span>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center gap-1 cursor-pointer">
                          <span>Company</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center gap-1 cursor-pointer">
                          <span>Amount</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center gap-1 cursor-pointer">
                          <span>Status</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center gap-1 cursor-pointer">
                          <span>Date</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesLoading ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">Loading invoices...</td>
                      </tr>
                    ) : invoicesError ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-red-500">{invoicesError}</td>
                      </tr>
                    ) : filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">No invoices found.</td>
                      </tr>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <span className="font-medium">{invoice.invoiceNumber}</span>
                          </td>
                          <td className="p-4 align-middle">{invoice.companyName}</td>
                          <td className="p-4 align-middle">${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-4 align-middle">
                            <Badge className={
                              invoice.status === "Paid"
                                ? "bg-green-500"
                                : invoice.status === "Pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">{new Date(invoice.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View</DropdownMenuItem>
                                <DropdownMenuItem>Download</DropdownMenuItem>
                                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
