"use client";
import { useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Clock,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Calendar,
    Building
} from "lucide-react";

interface TimeLogEntry {
    name: string;
    email: string;
    job: string;
    department: string;
    project: string;
    projectStatus: string;
    date: string;
    duration: number;
    status: string;
}

const initialData: TimeLogEntry[] = [
    { name: "Alice Smith", email: "alice@company.com", job: "Frontend Dev", department: "Engineering", project: "Website Redesign", projectStatus: "In Progress", date: "2024-06-01", duration: 8, status: "Approved" },
    { name: "Bob Lee", email: "bob@company.com", job: "Marketing Lead", department: "Marketing", project: "Ad Campaign", projectStatus: "Completed", date: "2024-06-02", duration: 6, status: "Pending" },
    { name: "Carol Jones", email: "carol@company.com", job: "Backend Dev", department: "Engineering", project: "API Development", projectStatus: "Not Started", date: "2024-06-03", duration: 7.5, status: "Rejected" },
    { name: "David Kim", email: "david@company.com", job: "QA Engineer", department: "Engineering", project: "Website Redesign", projectStatus: "In Progress", date: "2024-06-01", duration: 7, status: "Approved" },
    { name: "Eva Green", email: "eva@company.com", job: "Designer", department: "Marketing", project: "Brand Refresh", projectStatus: "In Progress", date: "2024-06-04", duration: 5, status: "Approved" },
    { name: "Frank Wilson", email: "frank@company.com", job: "Product Manager", department: "Product", project: "Mobile App", projectStatus: "In Progress", date: "2024-06-05", duration: 8.5, status: "Approved" },
    { name: "Grace Chen", email: "grace@company.com", job: "UX Designer", department: "Design", project: "Website Redesign", projectStatus: "In Progress", date: "2024-06-06", duration: 6.5, status: "Pending" },
];

const columns = [
    { key: "name", label: "Employee Name" },
    { key: "email", label: "Email" },
    { key: "job", label: "Job Title" },
    { key: "department", label: "Department" },
    { key: "project", label: "Project" },
    { key: "projectStatus", label: "Project Status" },
    { key: "date", label: "Date" },
    { key: "duration", label: "Duration (hrs)" },
    { key: "status", label: "Log Status" },
];

function sortData(data: TimeLogEntry[], sortBy: string, sortDir: string): TimeLogEntry[] {
    return [...data].sort((a, b) => {
        if (a[sortBy as keyof TimeLogEntry] < b[sortBy as keyof TimeLogEntry]) return sortDir === "asc" ? -1 : 1;
        if (a[sortBy as keyof TimeLogEntry] > b[sortBy as keyof TimeLogEntry]) return sortDir === "asc" ? 1 : -1;
        return 0;
    });
}

function formatDateRange(range: DateRange | null): string {
    if (!range || !range.from) return "All Time";
    if (!range.to) return `${range.from.toLocaleDateString()}`;
    return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
}

export default function EmployeeTimeLogsReport() {
    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState("asc");
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const sorted = sortData(initialData, sortBy, sortDir);

    // Filter by date range if selected
    const filtered = dateRange && dateRange.from ?
        sorted.filter(row => {
            const d = new Date(row.date);
            const from = dateRange.from!;
            const to = dateRange.to || dateRange.from!;
            return d >= from && d <= to;
        }) : sorted;

    // Calculate statistics
    const totalLogs = filtered.length;
    const totalHours = filtered.reduce((sum, row) => sum + row.duration, 0);
    const uniqueEmployees = new Set(filtered.map(row => row.name)).size;
    const uniqueDepartments = new Set(filtered.map(row => row.department)).size;
    const uniqueProjects = new Set(filtered.map(row => row.project)).size;

    // Status breakdown
    const statusCounts = filtered.reduce((acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const approvedLogs = statusCounts["Approved"] || 0;
    const pendingLogs = statusCounts["Pending"] || 0;
    const rejectedLogs = statusCounts["Rejected"] || 0;

    // Department breakdown
    const departmentHours = filtered.reduce((acc, row) => {
        acc[row.department] = (acc[row.department] || 0) + row.duration;
        return acc;
    }, {} as Record<string, number>);

    const topDepartment = Object.entries(departmentHours)
        .sort(([, a], [, b]) => b - a)[0] || ["None", 0];

    // Project status breakdown
    const projectStatusCounts = filtered.reduce((acc, row) => {
        acc[row.projectStatus] = (acc[row.projectStatus] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const inProgressProjects = projectStatusCounts["In Progress"] || 0;
    const completedProjects = projectStatusCounts["Completed"] || 0;

    // Average hours per log
    const avgHoursPerLog = totalLogs > 0 ? (totalHours / totalLogs).toFixed(1) : "0";

    const handleSort = (col: string) => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-2">Employee Time Logs Report</h2>
            <div className="mb-2 text-gray-600 text-sm">Date: <span className="font-medium">{formatDateRange(dateRange)}</span></div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHours}</div>
                        <p className="text-xs text-muted-foreground">
                            {avgHoursPerLog} avg per log
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLogs}</div>
                        <p className="text-xs text-muted-foreground">
                            {uniqueEmployees} employees
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalLogs > 0 ? Math.round((approvedLogs / totalLogs) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {approvedLogs} approved, {pendingLogs} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            {inProgressProjects} in progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Department Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(departmentHours).map(([dept, hours]) => (
                                <div key={dept} className="flex justify-between items-center">
                                    <span className="text-sm">{dept}</span>
                                    <span className="text-sm font-medium">{hours.toFixed(1)}h</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Log Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center">
                                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                    Approved
                                </span>
                                <span className="text-sm font-medium">{approvedLogs}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center">
                                    <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                                    Pending
                                </span>
                                <span className="text-sm font-medium">{pendingLogs}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center">
                                    <XCircle className="h-3 w-3 text-red-500 mr-1" />
                                    Rejected
                                </span>
                                <span className="text-sm font-medium">{rejectedLogs}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Project Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(projectStatusCounts).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center">
                                    <span className="text-sm">{status}</span>
                                    <span className="text-sm font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DateRangePicker onChange={(range) => setDateRange(range || null)} />
            {/* TODO: Add department/project/status filters */}
            <div className="my-6 overflow-x-auto">
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className="px-4 py-2 border cursor-pointer select-none"
                                    onClick={() => handleSort(col.key)}
                                >
                                    {col.label}
                                    {sortBy === col.key && (
                                        <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row, i) => (
                            <tr key={i} className="even:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col.key} className="px-4 py-2 border">{row[col.key as keyof TimeLogEntry]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Export</button>
        </div>
    );
} 