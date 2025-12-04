"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts"
import type {
    FreelancerInvoiceMonthlyTrendPoint,
    FreelancerInvoiceStatusDistribution,
    FreelancerProjectStatusDistribution
} from "@/services/api"

type CompanyPerformanceDatum = {
    name: string
    projects: number
    earnings: number
}

interface FreelancerCompaniesChartProps {
    data: CompanyPerformanceDatum[]
}

export function FreelancerCompaniesChart({ data }: FreelancerCompaniesChartProps) {
    const chartData = data?.length
        ? data
        : [{ name: "No data", projects: 0, earnings: 0 }]

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={chartData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="projects" fill="#F6931B" name="Projects" />
                <Bar yAxisId="right" dataKey="earnings" fill="#111827" name="Earnings" />
            </BarChart>
        </ResponsiveContainer>
    )
}

const DEFAULT_PROJECT_STATUS_DATA = [
    { name: "Active", value: 0, color: "#F6931B" },
    { name: "Completed", value: 0, color: "#111827" },
    { name: "On Hold", value: 0, color: "#6b7280" },
    { name: "Inactive", value: 0, color: "#9ca3af" }
]

interface FreelancerProjectStatusChartProps {
    data?: FreelancerProjectStatusDistribution | null
}

export function FreelancerProjectStatusChart({ data }: FreelancerProjectStatusChartProps) {
    const projectStatusData = data
        ? [
            { name: "Active", value: data.active ?? 0, color: "#F6931B" },
            { name: "Completed", value: data.completed ?? 0, color: "#111827" },
            { name: "On Hold", value: data["on-hold"] ?? 0, color: "#6b7280" },
            { name: "Inactive", value: data.inactive ?? 0, color: "#9ca3af" }
        ]
        : DEFAULT_PROJECT_STATUS_DATA

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}

// Freelancer Hours Tracking Chart
const hoursData = [
    { name: "Mon", hours: 8 },
    { name: "Tue", hours: 6 },
    { name: "Wed", hours: 7 },
    { name: "Thu", hours: 9 },
    { name: "Fri", hours: 8 },
    { name: "Sat", hours: 4 },
    { name: "Sun", hours: 2 },
]

export function FreelancerHoursChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart
                data={hoursData}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stroke="#F6931B" fill="#F6931B" fillOpacity={0.3} />
            </AreaChart>
        </ResponsiveContainer>
    )
}

// Freelancer Earnings Chart
const DEFAULT_EARNINGS_DATA = [
    { month: "Jan", earnings: 4000 },
    { month: "Feb", earnings: 4500 },
    { month: "Mar", earnings: 5000 },
    { month: "Apr", earnings: 5500 },
    { month: "May", earnings: 6000 },
    { month: "Jun", earnings: 6500 }
]

interface FreelancerEarningsChartProps {
    data?: FreelancerInvoiceMonthlyTrendPoint[] | null
}

export function FreelancerEarningsChart({ data }: FreelancerEarningsChartProps) {
    const chartData =
        data && data.length
            ? data.map(item => ({
                month: item.month,
                earnings: item.total
            }))
            : DEFAULT_EARNINGS_DATA

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="earnings" stroke="#111827" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}

// Freelancer Invoice Status Chart
const DEFAULT_INVOICE_STATUS_DATA = [
    { name: "Paid", value: 1, color: "#F6931B" },
    { name: "Sent", value: 1, color: "#111827" },
    { name: "Draft", value: 1, color: "#6b7280" },
    { name: "Overdue", value: 1, color: "#EF4444" }
]

const STATUS_COLOR_MAP: Record<string, string> = {
    paid: "#F6931B",
    sent: "#111827",
    active: "#3b82f6",
    draft: "#6b7280",
    overdue: "#EF4444"
}

interface FreelancerInvoiceStatusChartProps {
    data?: FreelancerInvoiceStatusDistribution | null
    loading?: boolean
}

export function FreelancerInvoiceStatusChart({ data, loading }: FreelancerInvoiceStatusChartProps) {
    // Show skeleton when loading
    if (loading || data === undefined) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center">
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 w-full max-w-[200px]">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                </div>
            </div>
        )
    }

    // If data is null (API responded with null), show empty state
    if (data === null) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No data available</p>
            </div>
        )
    }

    // Use actual data from API
    const chartData = [
        { name: "Paid", value: data.paid ?? 0, color: STATUS_COLOR_MAP.paid },
        { name: "Sent", value: data.sent ?? 0, color: STATUS_COLOR_MAP.sent },
        { name: "Active", value: (data as any).active ?? 0, color: STATUS_COLOR_MAP.active },
        { name: "Draft", value: data.draft ?? 0, color: STATUS_COLOR_MAP.draft },
        { name: "Overdue", value: data.overdue ?? 0, color: STATUS_COLOR_MAP.overdue }
    ]

    // Filter out zero values to avoid equal partitioning
    const filteredData = chartData.filter(item => item.value > 0)

    // If all values are zero, show empty state
    if (filteredData.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No invoices yet</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {filteredData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}

// Freelancer Task Distribution Chart
const taskDistributionData = [
    { name: "Completed", value: 45, color: "#F6931B" },
    { name: "In Progress", value: 15, color: "#111827" },
    { name: "Pending", value: 8, color: "#6b7280" },
    { name: "On Hold", value: 2, color: "#6b7280" },
]

export function FreelancerTaskDistributionChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {taskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}
