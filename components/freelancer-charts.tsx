"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts"

// Freelancer Companies Chart
const companiesData = [
    { name: "TechCorp Inc", projects: 5, earnings: 15000 },
    { name: "DesignStudio", projects: 3, earnings: 8500 },
    { name: "StartupXYZ", projects: 2, earnings: 5000 },
    { name: "MediaCorp", projects: 4, earnings: 12000 },
    { name: "FinanceCo", projects: 1, earnings: 3000 },
]

export function FreelancerCompaniesChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={companiesData}
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

// Freelancer Projects Status Chart
const projectStatusData = [
    { name: "Active", value: 3, color: "#F6931B" },
    { name: "Completed", value: 9, color: "#111827" },
    { name: "On Hold", value: 1, color: "#6b7280" },
    { name: "Cancelled", value: 0, color: "#111827" },
]

export function FreelancerProjectStatusChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
const earningsData = [
    { month: "Jan", earnings: 4000 },
    { month: "Feb", earnings: 4500 },
    { month: "Mar", earnings: 5000 },
    { month: "Apr", earnings: 5500 },
    { month: "May", earnings: 6000 },
    { month: "Jun", earnings: 6500 },
]

export function FreelancerEarningsChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={earningsData}
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
const invoiceStatusData = [
    { name: "Paid", value: 8, color: "#F6931B" },
    { name: "Sent", value: 3, color: "#111827" },
    { name: "Draft", value: 2, color: "#6b7280" },
    { name: "Overdue", value: 1, color: "#111827" },
]

export function FreelancerInvoiceStatusChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {invoiceStatusData.map((entry, index) => (
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
