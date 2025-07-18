"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { HoursLoggedChart } from "@/components/hours-logged-chart"
import { DepartmentPerformanceChart } from "@/components/department-performance-chart"
import { ProjectCompletionChart } from "@/components/project-completion-chart"
import { EmployeePerformanceChart } from "@/components/employee-performance-chart"
import { getRequest } from "@/services/api"
import { useEffect, useState } from "react"
import { getAuthData } from "@/services/auth"
import DashboardSidebarWithSuspense from "@/components/dashboard-sidebar"

export default function AnalyticsPage() {
  // Get companyId from session
  const companyId = typeof window !== "undefined" ? getAuthData()?.user?.company?.id : undefined;

  // State for analytics data and loading
  const [dailyHours, setDailyHours] = useState<any[]>([]);
  const [hoursPerDept, setHoursPerDept] = useState<any[]>([]);
  const [topConsultants, setTopConsultants] = useState<any[]>([]);
  const [isLoadingDailyHours, setIsLoadingDailyHours] = useState(true);
  const [isLoadingHoursPerDept, setIsLoadingHoursPerDept] = useState(true);
  const [isLoadingTopConsultants, setIsLoadingTopConsultants] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    async function fetchAnalytics() {
      try {
        setIsLoadingDailyHours(true);
        setIsLoadingHoursPerDept(true);
        setIsLoadingTopConsultants(true);
        const dailyHoursRes = await getRequest<{ data?: any[] }>(`/company/analytics/daily-hours-current-month/${companyId}`);
        // Transform API data to match HoursLoggedChart expected shape
        const dailyHoursData = Array.isArray(dailyHoursRes?.data)
          ? dailyHoursRes.data.map((item: { date: string; totalHours: number }) => ({ date: item.date, hours: item.totalHours }))
          : Array.isArray(dailyHoursRes)
            ? (dailyHoursRes as any).map((item: { date: string; totalHours: number }) => ({ date: item.date, hours: item.totalHours }))
            : [];
        setDailyHours(dailyHoursData);
        setIsLoadingDailyHours(false);
        const hoursPerDeptRes = await getRequest<{ data?: any[] }>(`/company/analytics/hours-per-department/${companyId}`);
        // Transform API data to match DepartmentPerformanceChart expected shape
        const hoursPerDeptData = Array.isArray(hoursPerDeptRes?.data)
          ? hoursPerDeptRes.data.map((item: { department: string; totalHours: number }) => ({ name: item.department, hours: item.totalHours, tasks: 0, completion: 0 }))
          : Array.isArray(hoursPerDeptRes)
            ? (hoursPerDeptRes as any).map((item: { department: string; totalHours: number }) => ({ name: item.department, hours: item.totalHours, tasks: 0, completion: 0 }))
            : [];
        setHoursPerDept(hoursPerDeptData);
        setIsLoadingHoursPerDept(false);
        const topConsultantsRes = await getRequest<{ data?: any[] }>(`/company/analytics/top-consultants-by-hours-current-month/${companyId}`);
        // Transform API data to match EmployeePerformanceChart expected shape
        const topConsultantsData = Array.isArray(topConsultantsRes?.data)
          ? topConsultantsRes.data.map((item: { fullName: string; totalHours: number }) => ({ name: item.fullName, hours: item.totalHours, tasks: 0 }))
          : Array.isArray(topConsultantsRes)
            ? (topConsultantsRes as any).map((item: { fullName: string; totalHours: number }) => ({ name: item.fullName, hours: item.totalHours, tasks: 0 }))
            : [];
        setTopConsultants(topConsultantsData);
        setIsLoadingTopConsultants(false);
      } catch (err) {
        console.error("[Analytics] Error fetching analytics data:", err);
      }
    }
    fetchAnalytics();
  }, [companyId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Analytics</h1>
        <div className="flex items-center gap-2">
          {/* <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Reports
          </Button> */}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs defaultValue="hours" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="hours">Hours Logged</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
            </TabsList>
            {/* <div className="flex items-center gap-2">
              <Select defaultValue="month">
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <TabsContent value="hours" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Hours Logged</CardTitle>
                <CardDescription>Total hours logged across all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <HoursLoggedChart data={dailyHours} xAxisLabel="Date" yAxisLabel="Hours" isLoading={isLoadingDailyHours} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Productivity metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentPerformanceChart data={hoursPerDept} xAxisLabel="Department" yAxisLabel="Hours" isLoading={isLoadingHoursPerDept} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Performance</CardTitle>
                <CardDescription>Top performing employees by hours logged</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeePerformanceChart data={topConsultants} xAxisLabel="Employee" yAxisLabel="Hours" isLoading={isLoadingTopConsultants} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hours per Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">29.7</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">+6% from last month</p>
          </CardContent>
        </Card>
      </div> */}

      <div className="grid gap-4 md:grid-cols-2">
        {/* <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Important metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Productivity Trends</h3>
                <p className="text-sm text-muted-foreground">
                  Overall productivity has increased by 12% compared to last month, with the Development department
                  showing the highest improvement at 18%.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Project Insights</h3>
                <p className="text-sm text-muted-foreground">
                  The Website Redesign project is ahead of schedule by 5 days, while the Mobile App Development project
                  is currently 2 days behind schedule.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Resource Allocation</h3>
                <p className="text-sm text-muted-foreground">
                  The Marketing department is currently under-resourced with a 92% utilization rate, while the HR
                  department has a 65% utilization rate.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Employee Performance</h3>
                <p className="text-sm text-muted-foreground">
                  John Smith and Sarah Johnson are the top performers this month, with task completion rates of 95% and
                  92% respectively.
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested actions based on analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Resource Reallocation</h3>
                <p className="text-sm text-muted-foreground">
                  Consider reallocating 1-2 resources from HR to Marketing to balance workload and improve overall
                  productivity.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Project Timeline Adjustment</h3>
                <p className="text-sm text-muted-foreground">
                  The Mobile App Development project may need additional resources or a timeline adjustment to meet the
                  current deadline.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Performance Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Recognize top performers John Smith and Sarah Johnson to maintain high motivation and productivity
                  levels.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Process Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  The Finance department has the highest task completion time. Consider reviewing and optimizing their
                  workflows.
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
