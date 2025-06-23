import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CompaniesByPackageChart } from "@/components/companies-by-package-chart"

export default function CompaniesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/super-admin/companies/new">
              <Plus className="mr-2 h-4 w-4" /> Add Company
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">92% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">8% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Users</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Per company</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
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
              <Input type="search" placeholder="Search companies..." className="w-full pl-8" />
            </div>
          </div>
        </div>
        <TabsContent value="all" className="space-y-4">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Company</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Package</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Users</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Joined</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Acme Corp</p>
                          <p className="text-xs text-muted-foreground">acme.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">Premium</td>
                    <td className="p-4 align-middle">42</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-green-500">Active</Badge>
                    </td>
                    <td className="p-4 align-middle">Jan 12, 2023</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/companies/1">View</Link>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">TechSolutions Inc</p>
                          <p className="text-xs text-muted-foreground">techsolutions.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">Enterprise</td>
                    <td className="p-4 align-middle">78</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-green-500">Active</Badge>
                    </td>
                    <td className="p-4 align-middle">Feb 3, 2023</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/companies/2">View</Link>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Global Innovations</p>
                          <p className="text-xs text-muted-foreground">globalinnovations.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">Standard</td>
                    <td className="p-4 align-middle">23</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-green-500">Active</Badge>
                    </td>
                    <td className="p-4 align-middle">Mar 15, 2023</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/companies/3">View</Link>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Startup Labs</p>
                          <p className="text-xs text-muted-foreground">startuplabs.co</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">Basic</td>
                    <td className="p-4 align-middle">8</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-yellow-500">Trial</Badge>
                    </td>
                    <td className="p-4 align-middle">May 2, 2023</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/companies/4">View</Link>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          {/* Similar table with only active companies */}
        </TabsContent>
        <TabsContent value="trial" className="space-y-4">
          {/* Similar table with only trial companies */}
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4">
          <div className="text-center py-6">
            <p className="text-muted-foreground">No inactive companies found.</p>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Companies by Package</CardTitle>
          <CardDescription>Distribution of companies across different packages</CardDescription>
        </CardHeader>
        <CardContent>
          <CompaniesByPackageChart />
        </CardContent>
      </Card>
    </div>
  )
}
