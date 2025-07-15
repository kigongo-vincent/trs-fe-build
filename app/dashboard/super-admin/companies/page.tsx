"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CompaniesByPackageChart } from "@/components/companies-by-package-chart"
import { useEffect, useState } from "react"
import { fetchCompanies, fetchCompaniesSummary } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true)
      try {
        const res = await fetchCompanies()
        setCompanies(res.data || [])
      } catch (e) {
        setCompanies([])
      }
      setLoading(false)
    }
    loadCompanies()
  }, [])

  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true)
      try {
        const res = await fetchCompaniesSummary()
        setStats(res.data || [])
      } catch (e) {
        setStats([])
      }
      setStatsLoading(false)
    }
    loadStats()
  }, [])

  function getStat(label: string) {
    return stats.find((s) => s.label === label)?.value ?? 0
  }
  const totalCompanies = getStat("Total Companies")
  const activeCompanies = getStat("Active Companies")
  const trialCompanies = getStat("Trial Companies")
  const totalUsers = getStat("Total Users")
  const averageUsers = totalCompanies > 0 ? Math.floor(totalUsers / totalCompanies) : 0

  // Filtering logic
  const filteredCompanies = companies.filter((company) => {
    // Tab filter
    if (tab === "active" && company.status !== "active") return false
    if (tab === "trial" && company.status !== "trial") return false
    if (tab === "inactive" && company.status !== "inactive") return false
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const name = company.name?.toLowerCase() || ""
      const email = company.email?.toLowerCase() || ""
      return name.includes(searchLower) || email.includes(searchLower)
    }
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Companies</h1>
        <div className="flex items-center gap-2">
          {/* <Button asChild>
            <Link href="/dashboard/super-admin/companies/new">
              <Plus className="mr-2 h-4 w-4" /> Add Company
            </Link>
          </Button> */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-6 w-12" /> : totalCompanies}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-6 w-12" /> : activeCompanies}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-6 w-12" /> : trialCompanies}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Users</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-6 w-12" /> : averageUsers}</div>
            <p className="text-xs text-muted-foreground">Per company</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies by Package</CardTitle>
          <CardDescription>Distribution of companies across different packages</CardDescription>
        </CardHeader>
        <CardContent>
          <CompaniesByPackageChart data={companies} />
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Companies</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="trial">Trial</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search companies..."
                className="w-full pl-8"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <TabsContent value={tab} className="space-y-4">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Company</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Users</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Joined</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle"><Skeleton className="h-4 w-8" /></td>
                        <td className="p-4 align-middle"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-4 align-middle"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4 align-middle text-right"><Skeleton className="h-8 w-16" /></td>
                      </tr>
                    ))
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-muted-foreground">No companies found.</td>
                    </tr>
                  ) : (
                    filteredCompanies.map((company) => (
                      <tr key={company.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{company.name}</p>
                              <p className="text-xs text-muted-foreground">{company.email || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{company.users}</td>
                        <td className="p-4 align-middle">
                          <Badge className={company.status === "active" ? "bg-green-500" : company.status === "trial" ? "bg-yellow-500" : "bg-gray-400"}>
                            {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">{new Date(company.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/super-admin/companies/${company.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
