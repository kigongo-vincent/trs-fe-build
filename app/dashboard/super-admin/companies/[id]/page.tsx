import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Download, Edit, Mail, Phone, User, Users } from "lucide-react"
import Link from "next/link"
import { CompanyEmployeesChart } from "@/components/company-employees-chart"
import { CompanyActivityChart } from "@/components/company-activity-chart"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function CompanyDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the company data based on the ID
  const companyId = params.id

  // Mock company data
  const company = {
    id: companyId,
    name: "Acme Corp",
    website: "acme.com",
    email: "info@acme.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, San Francisco, CA 94105",
    status: "Active",
    package: "Premium",
    joinedDate: "Jan 12, 2023",
    employees: 42,
    departments: 5,
    projects: 12,
    tasks: 156,
    logo: "/placeholder.svg?height=40&width=40",
    contactPerson: {
      name: "John Smith",
      position: "CTO",
      email: "john@acme.com",
      phone: "+1 (555) 987-6543",
    },
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard/super-admin/companies">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
        <Badge className="ml-2 bg-green-500">{company.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Details about {company.name}</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.website}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{company.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="font-medium">Primary Contact</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{company.contactPerson.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{company.contactPerson.name}</p>
                    <p className="text-sm text-muted-foreground">{company.contactPerson.position}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.contactPerson.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.contactPerson.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Current Package</h3>
                  <Badge>{company.package}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Renewed on Jan 12, 2024</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Employees</span>
                  <span className="font-medium">{company.employees} / 50</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(company.employees / 50) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <span className="font-medium">45 GB / 100 GB</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Projects</span>
                  <span className="font-medium">{company.projects} / 20</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(company.projects / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <Button className="w-full">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.employees}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.departments}</div>
            <p className="text-xs text-muted-foreground">Across company</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.projects}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.tasks}</div>
            <p className="text-xs text-muted-foreground">Total tasks</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employees</CardTitle>
                <CardDescription>Manage company employees</CardDescription>
              </div>
              <Button>
                <User className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Employee</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Department</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Joined</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>JS</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">John Smith</p>
                              <p className="text-xs text-muted-foreground">john@acme.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">Engineering</td>
                        <td className="p-4 align-middle">CTO</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Active</Badge>
                        </td>
                        <td className="p-4 align-middle">Jan 15, 2023</td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>SD</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Sarah Davis</p>
                              <p className="text-xs text-muted-foreground">sarah@acme.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">Marketing</td>
                        <td className="p-4 align-middle">Director</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Active</Badge>
                        </td>
                        <td className="p-4 align-middle">Feb 3, 2023</td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>RJ</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Robert Johnson</p>
                              <p className="text-xs text-muted-foreground">robert@acme.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">Sales</td>
                        <td className="p-4 align-middle">Manager</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Active</Badge>
                        </td>
                        <td className="p-4 align-middle">Mar 15, 2023</td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>EW</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Emily Wilson</p>
                              <p className="text-xs text-muted-foreground">emily@acme.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">HR</td>
                        <td className="p-4 align-middle">Specialist</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Active</Badge>
                        </td>
                        <td className="p-4 align-middle">Apr 2, 2023</td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Distribution</CardTitle>
              <CardDescription>Distribution of employees by department</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyEmployeesChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Recent activity in the company</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyActivityChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download invoices</CardDescription>
              </div>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Download All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Invoice</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">INV-001</td>
                        <td className="p-4 align-middle">Jan 1, 2024</td>
                        <td className="p-4 align-middle">$499.00</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Paid</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">INV-002</td>
                        <td className="p-4 align-middle">Feb 1, 2024</td>
                        <td className="p-4 align-middle">$499.00</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Paid</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">INV-003</td>
                        <td className="p-4 align-middle">Mar 1, 2024</td>
                        <td className="p-4 align-middle">$499.00</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Paid</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">INV-004</td>
                        <td className="p-4 align-middle">Apr 1, 2024</td>
                        <td className="p-4 align-middle">$499.00</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">Paid</Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>Manage company settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Company settings content would go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
