"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PackageDistributionChart } from "@/components/package-distribution-chart"
import { useEffect, useState } from "react"
import { fetchPackages, createPackage, updatePackage, fetchPackagesSummary, type PackagesSummaryItem } from "@/services/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Skeleton } from "@/components/ui/skeleton"

type PackageType = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationType: string;
  no_of_users: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type PackagesApiResponse = {
  status: number;
  message: string;
  data: PackageType[];
}

const createPackageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  durationType: z.enum(["monthly", "yearly"]),
  no_of_users: z.coerce.number().min(1, "At least 1 user required"),
  status: z.string().min(1, "Status is required"),
})
type CreatePackageForm = z.infer<typeof createPackageSchema>

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null)
  const [summary, setSummary] = useState<PackagesSummaryItem[] | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPackages() {
      setLoading(true)
      setError(null)
      try {
        const res: PackagesApiResponse = await fetchPackages()
        setPackages(res.data || [])
      } catch (err: any) {
        setError("Failed to fetch packages")
      } finally {
        setLoading(false)
      }
    }
    loadPackages()
  }, [])

  useEffect(() => {
    async function loadSummary() {
      setSummaryLoading(true)
      setSummaryError(null)
      try {
        const res = await fetchPackagesSummary()
        setSummary(res.data)
      } catch (err: any) {
        setSummaryError("Failed to fetch summary")
      } finally {
        setSummaryLoading(false)
      }
    }
    loadSummary()
  }, [])

  // Filter and search logic
  const filteredPackages = packages.filter(pkg => {
    // Filter by tab
    if (tab === "active" && pkg.status.toLowerCase() !== "active") return false
    if (tab === "archived" && pkg.status.toLowerCase() !== "archived") return false
    // Search by name or description
    if (search.trim() !== "") {
      const s = search.toLowerCase()
      return (
        pkg.name.toLowerCase().includes(s) ||
        (pkg.description && pkg.description.toLowerCase().includes(s))
      )
    }
    return true
  })

  // Create package form
  const form = useForm<CreatePackageForm>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      durationType: "monthly",
      no_of_users: 1,
      status: "active",
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreatePackage = async (data: CreatePackageForm) => {
    setIsSubmitting(true)
    try {
      const created = await createPackage(data)
      toast.success("Package created!", { description: `Package '${data.name}' was created successfully.` })
      setModalOpen(false)
      form.reset()
      // Add the new package to state
      setPackages(prev => created?.data ? [...prev, created.data] : prev)
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to create package" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit package form
  const editForm = useForm<CreatePackageForm>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      durationType: "monthly",
      no_of_users: 1,
      status: "active",
    },
  })
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // When editingPackage changes, reset the form with its values
  useEffect(() => {
    if (editingPackage) {
      editForm.reset({
        name: editingPackage.name,
        description: editingPackage.description,
        price: editingPackage.price,
        durationType: editingPackage.durationType as "monthly" | "yearly",
        no_of_users: editingPackage.no_of_users,
        status: editingPackage.status,
      })
    }
  }, [editingPackage])

  const handleEditPackage = async (data: CreatePackageForm) => {
    if (!editingPackage) return
    setIsEditSubmitting(true)
    try {
      const updated = await updatePackage(editingPackage.id, data)
      toast.success("Package updated!", { description: `Package '${data.name}' was updated successfully.` })
      setEditModalOpen(false)
      setEditingPackage(null)
      // Update the package in state
      setPackages(prev => prev.map(pkg => pkg.id === editingPackage.id ? { ...pkg, ...data, ...updated.data } : pkg))
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to update package" })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.status.toLowerCase() === "active").length;
  const archivedPackages = packages.filter(p => p.status.toLowerCase() === "archived").length;
  // Calculate monthly revenue (sum of price for active, monthly packages)
  const monthlyRevenue = packages
    .filter(p => p.status.toLowerCase() === "active" && p.durationType === "monthly")
    .reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : 0), 0);
  // Find most popular (highest no_of_users among active packages)
  const mostPopular = packages
    .filter(p => p.status.toLowerCase() === "active")
    .reduce((max, p) => (p.no_of_users > (max?.no_of_users ?? 0) ? p : max), null as PackageType | null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Packages</h1>
        <div className="flex items-center gap-2">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Package</DialogTitle>
                <DialogDescription>Fill in the details to create a new package.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePackage)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Package name" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Description" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl><Input type="number" min={0} step={0.01} placeholder="0.00" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="durationType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="no_of_users" render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Users</FormLabel>
                      <FormControl><Input type="number" min={1} placeholder="1" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog open={editModalOpen} onOpenChange={open => { setEditModalOpen(open); if (!open) setEditingPackage(null) }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Package</DialogTitle>
                <DialogDescription>Update the details for this package.</DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleEditPackage)} className="space-y-4">
                  <FormField control={editForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Package name" {...field} disabled={isEditSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Description" {...field} disabled={isEditSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl><Input type="number" min={0} step={0.01} placeholder="0.00" {...field} disabled={isEditSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="durationType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isEditSubmitting}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="no_of_users" render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Users</FormLabel>
                      <FormControl><Input type="number" min={1} placeholder="1" {...field} disabled={isEditSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isEditSubmitting}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="submit" disabled={isEditSubmitting}>
                      {isEditSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : summaryError ? (
          <div className="col-span-4 text-center text-red-500 py-8">{summaryError}</div>
        ) : summary && summary.length > 0 ? (
          summary.map((item, idx) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.label === "Monthly Revenue" ? `$${item.value}` : item.value}</div>
                {/* Optionally add a description or extra info here if needed */}
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Packages</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search packages..."
                className="w-full pl-8"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <TabsContent value={tab} className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="flex items-center gap-4 p-4 shadow-sm">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">{error}</div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No packages found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map(pkg => (
                <Card key={pkg.id} className="flex items-center gap-4 p-4 border-gray-300 shadow-sm">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold truncate">{pkg.name}</span>
                      <Badge className="ml-2">{pkg.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{pkg.description}</div>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>Price: <span className="font-medium">{pkg.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></span>
                      <span>Users: <span className="font-medium">{pkg.no_of_users}</span></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/super-admin/packages/${pkg.id}`} aria-label="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => { setEditingPackage(pkg); setEditModalOpen(true); }} aria-label="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3zm0 0v3a2 2 0 002 2h3" /></svg>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Package Distribution</CardTitle>
          <CardDescription>Active subscriptions by package type</CardDescription>
        </CardHeader>
        <CardContent>
          <PackageDistributionChart packages={packages} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}
