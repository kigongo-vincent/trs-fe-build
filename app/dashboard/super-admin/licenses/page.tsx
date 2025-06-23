import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LicenseStatusChart } from "@/components/license-status-chart"

export default function LicensesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">License Keys</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/super-admin/licenses/new">
              <Plus className="mr-2 h-4 w-4" /> Generate License
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">165</div>
            <p className="text-xs text-muted-foreground">+15 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">132</div>
            <p className="text-xs text-muted-foreground">80% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">9% of total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
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
              <Input type="search" placeholder="Search licenses..." className="w-full pl-8" />
            </div>
          </div>
        </div>
        <TabsContent value="all" className="space-y-4">
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
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-mono text-xs">TK-ACME-PRO-2023-05-12</td>
                    <td className="p-4 align-middle">Acme Corp</td>
                    <td className="p-4 align-middle">Premium</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-green-500">Active</Badge>
                    </td>
                    <td className="p-4 align-middle">May 12, 2024</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/licenses/1">View</Link>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-mono text-xs">TK-TECH-ENT-2023-02-03</td>
                    <td className="p-4 align-middle">TechSolutions Inc</td>
                    <td className="p-4 align-middle">Enterprise</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-green-500">Active</Badge>
                    </td>
                    <td className="p-4 align-middle">Feb 3, 2024</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/licenses/2">View</Link>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-mono text-xs">TK-GLOB-STD-2023-03-15</td>
                    <td className="p-4 align-middle">Global Innovations</td>
                    <td className="p-4 align-middle">Standard</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-yellow-500">Expiring Soon</Badge>
                    </td>
                    <td className="p-4 align-middle">Jun 15, 2023</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/licenses/3">View</Link>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-mono text-xs">TK-STAR-BAS-2023-05-02</td>
                    <td className="p-4 align-middle">Startup Labs</td>
                    <td className="p-4 align-middle">Basic</td>
                    <td className="p-4 align-middle">
                      <Badge className="bg-red-500">Expired</Badge>
                    </td>
                    <td className="p-4 align-middle">May 2, 2023</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/super-admin/licenses/4">View</Link>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          {/* Similar table with only active licenses */}
        </TabsContent>
        <TabsContent value="expiring" className="space-y-4">
          {/* Similar table with only expiring licenses */}
        </TabsContent>
        <TabsContent value="expired" className="space-y-4">
          {/* Similar table with only expired licenses */}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>License Status</CardTitle>
          <CardDescription>Overview of all license keys</CardDescription>
        </CardHeader>
        <CardContent>
          <LicenseStatusChart />
        </CardContent>
      </Card>
    </div>
  )
}
