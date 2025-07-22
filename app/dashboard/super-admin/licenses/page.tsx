"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LicenseStatusChart } from "@/components/license-status-chart"
import { useEffect, useState } from "react"
import { fetchLicenseKeys, LicenseKey, fetchLicenseKeySummary, LicenseKeySummaryItem } from "@/services/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { fetchCompanies, fetchPackages, createLicenseKey } from "@/services/api"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const createLicenseSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  packageId: z.string().min(1, "Package is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.string().min(1, "Status is required"),
})
type CreateLicenseForm = z.infer<typeof createLicenseSchema>

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<LicenseKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<string>("all")
  const [search, setSearch] = useState("")

  // Summary state
  const [summary, setSummary] = useState<LicenseKeySummaryItem[]>([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)

  const form = useForm<CreateLicenseForm>({
    resolver: zodResolver(createLicenseSchema),
    defaultValues: {
      companyId: "",
      packageId: "",
      expiryDate: "",
      status: "active",
    },
  })

  useEffect(() => {
    async function loadLicenses() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchLicenseKeys()
        setLicenses(res.data || [])
      } catch (err: any) {
        setError("Failed to fetch licenses")
      } finally {
        setLoading(false)
      }
    }
    loadLicenses()
  }, [])

  useEffect(() => {
    async function loadSummary() {
      setSummaryLoading(true)
      setSummaryError(null)
      try {
        const res = await fetchLicenseKeySummary()
        setSummary(res.data || [])
      } catch (err: any) {
        setSummaryError("Failed to fetch summary")
      } finally {
        setSummaryLoading(false)
      }
    }
    loadSummary()
  }, [])

  useEffect(() => {
    async function loadDropdowns() {
      setLoadingDropdowns(true)
      try {
        const [companiesRes, packagesRes] = await Promise.all([
          fetchCompanies(),
          fetchPackages(),
        ])
        setCompanies(companiesRes.data || [])
        setPackages(packagesRes.data || [])
      } catch (err) {
        toast.error("Failed to load companies or packages")
      } finally {
        setLoadingDropdowns(false)
      }
    }
    if (modalOpen) loadDropdowns()
  }, [modalOpen])

  // Filtering logic
  const filteredLicenses = licenses.filter((license) => {
    // Tab filter
    if (tab === "active" && license.status.toLowerCase() !== "active") return false
    if (tab === "expiring" && license.status.toLowerCase() !== "expiring soon") return false
    if (tab === "expired" && license.status.toLowerCase() !== "expired") return false
    // Search filter
    if (search) {
      const s = search.toLowerCase()
      return (
        license.key.toLowerCase().includes(s) ||
        license.company.name.toLowerCase().includes(s) ||
        license.package.name.toLowerCase().includes(s)
      )
    }
    return true
  })

  // Helper to get summary value by label
  const getSummaryValue = (label: string) => {
    const item = summary.find(s => s.label === label)
    return item ? item.value : 0
  }

  const handleCreateLicense = async (data: CreateLicenseForm) => {
    setIsSubmitting(true)
    try {
      await createLicenseKey(data)
      toast.success("License created!", { description: "A new license key was generated." })
      setModalOpen(false)
      form.reset()
      // Refresh licenses
      const res = await fetchLicenseKeys()
      setLicenses(res.data || [])
      // Optionally refresh summary
      const summaryRes = await fetchLicenseKeySummary()
      setSummary(summaryRes.data || [])
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to create license" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">License Keys</h1>
        <div className="flex items-center gap-2">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Generate License
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate License</DialogTitle>
                <DialogDescription>Fill in the details to generate a new license key.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateLicense)} className="space-y-4">
                  <FormField control={form.control} name="companyId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={loadingDropdowns || isSubmitting}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="packageId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={loadingDropdowns || isSubmitting}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a package" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <FormField control={form.control} name="expiryDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" className="w-[max-content]" placeholder="YYYY-MM-DD" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex-1">
                      <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="expiring soon">Expiring Soon</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                      Generate
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryLoading ? "-" : getSummaryValue("Total Licenses")}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryLoading ? "-" : getSummaryValue("Active Licenses")}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryLoading ? "-" : getSummaryValue("Expiring Licenses")}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryLoading ? "-" : getSummaryValue("Expired Licenses")}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={tab} className="space-y-4" onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Licenses</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search licenses..." className="w-full pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <TabsContent value={tab} className="space-y-4">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">License Key</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Company</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Package</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Skeleton loader for table rows
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="p-4">
                            <Skeleton className="h-6 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : error ? (
                    <tr><td colSpan={6} className="text-center py-6 text-red-500">{error}</td></tr>
                  ) : filteredLicenses.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No licenses found.</td></tr>
                  ) : (
                    filteredLicenses.map((license) => (
                      <tr key={license.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-mono text-xs">{license.key}</td>
                        <td className="p-4 align-middle">{license.company?.name || "-"}</td>
                        <td className="p-4 align-middle">{license.package?.name || "-"}</td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            license.status.toLowerCase() === "active"
                              ? "bg-green-500"
                              : license.status.toLowerCase() === "expiring soon"
                                ? "bg-yellow-500"
                                : license.status.toLowerCase() === "expired"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                          }>
                            {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">{license.expiryDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Removed LicenseStatusChart overview section below the table */}
    </div>
  )
}
