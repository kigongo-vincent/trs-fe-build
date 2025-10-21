"use client"
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
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCompanyById, getCompanySummary } from "@/services/api"
import { getAllConsultants } from "@/services/consultants"
import React from "react"

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params)
  const companyId = unwrappedParams.id
  const [company, setCompany] = useState<any>(null)
  const [consultants, setConsultants] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchCompanyById(companyId),
      getAllConsultants(),
      getCompanySummary(companyId)
    ])
      .then(([companyData, consultantsData, summaryData]) => {
        setCompany(companyData.data)
        setConsultants(consultantsData.data || [])
        setSummary((summaryData as any).data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching company, consultants, or summary:", err)
        setLoading(false)
      })
  }, [companyId])

  // Skeletons
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!company) {
    return <div className="p-8 text-center text-muted-foreground">Company not found.</div>
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
        <h1 className="text-2xl font-bold tracking-tight text-primary">{company.name || '_'}</h1>
        <Badge className="ml-2 bg-green-500">{company.status || '_'}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Details about {company.name}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{company.name || '_'}</h3>
                    <p className="text-sm text-muted-foreground">{company.sector || '_'}</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.email || '_'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone || '_'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{company.address || '_'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Begin: Detailed Package Card or Placeholder */}
            {company.package ? (
              <Card className="border-2 border-primary/60 bg-primary/5 flex flex-col mb-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">Current Plan</Badge>
                      {company.package.name}
                    </CardTitle>
                    <CardDescription className="mt-2">{company.package.description}</CardDescription>
                    <div className="mt-4 flex gap-6 text-xs">
                      <span>Status: <Badge className="ml-1 capitalize">{company.package.status}</Badge></span>
                      <span>Users: <span className="font-medium">{company.package.no_of_users}</span></span>
                      <span>Created: {company.package.createdAt ? new Date(company.package.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-2xl font-bold">{company.package.price === 0 ? 'Free' : `$${company.package.price}/${company.package.durationType === 'yearly' ? 'yr' : 'mo'}`}</span>
                    <Badge variant="outline" className="capitalize">{company.package.durationType}</Badge>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4v4m0 0v4m0-4h4m-4 0H7" /></svg>
                <span className="text-lg font-semibold">No package assigned to this company.</span>
              </div>
            )}
            {/* End: Detailed Package Card or Placeholder */}
            <div className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Employees</span>
                  <span className="font-medium">{consultants.length} / {company.package?.no_of_users ?? '_'}
                  </span>
                </div>
                {(() => {
                  const total = company.package?.no_of_users || 0;
                  const used = consultants.length;
                  const percent = total ? Math.min((used / total) * 100, 100) : 0;
                  let barColor = "bg-green-500";
                  if (percent >= 100) barColor = "bg-red-500";
                  else if (percent >= 50) barColor = "bg-orange-400";
                  return (
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  );
                })()}
              </div>
              {/* Removed Projects section and Manage Subscription button */}
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
            <div className="text-2xl font-bold">{summary ? summary.consultants : consultants.length}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary ? summary.departments : (company.departments?.length ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Across company</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary ? summary.projects : 0}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary ? summary.totalMinutes : 0}</div>
            <p className="text-xs text-muted-foreground">Total minutes</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          {/* <TabsTrigger value="activity">Activity</TabsTrigger> */}
          {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
          {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employees</CardTitle>
                <CardDescription>Manage company employees</CardDescription>
              </div>
              {/* <Button>
                <User className="mr-2 h-4 w-4" /> Add Employee
              </Button> */}
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
                      </tr>
                    </thead>
                    <tbody>
                      {consultants.length ? (
                        consultants.map((user: any) => (
                          <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{user.fullName?.split(" ").map((n: string) => n[0]).join("") || '_'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{user.fullName || '_'}</p>
                                  <p className="text-xs text-muted-foreground">{user.email || '_'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">{user.department?.name || '_'}</td>
                            <td className="p-4 align-middle">{user.jobTitle || '_'}</td>
                            <td className="p-4 align-middle">
                              <Badge className={user.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>{user.status}</Badge>
                            </td>
                            <td className="p-4 align-middle">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '_'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">No employees found.</td>
                        </tr>
                      )}
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
        </TabsContent>
        {/* <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Recent activity in the company</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyActivityChart />
            </CardContent>
          </Card>
        </TabsContent> */}
        {/* <TabsContent value="billing" className="space-y-4">
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
                        <td className="p-4 align-middle">-</td>
                        <td className="p-4 align-middle">-</td>
                        <td className="p-4 align-middle">-</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-500">-</Badge>
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
        </TabsContent> */}
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
