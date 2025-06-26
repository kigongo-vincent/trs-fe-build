"use client";
import { useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";

const initialData = [
    { name: "Alice Smith", email: "alice@company.com", job: "Frontend Dev", department: "Engineering", project: "Website Redesign", projectStatus: "In Progress", date: "2024-06-01", duration: 8, status: "Approved" },
    { name: "Bob Lee", email: "bob@company.com", job: "Marketing Lead", department: "Marketing", project: "Ad Campaign", projectStatus: "Completed", date: "2024-06-02", duration: 6, status: "Pending" },
    { name: "Carol Jones", email: "carol@company.com", job: "Backend Dev", department: "Engineering", project: "API Development", projectStatus: "Not Started", date: "2024-06-03", duration: 7.5, status: "Rejected" },
    { name: "David Kim", email: "david@company.com", job: "QA Engineer", department: "Engineering", project: "Website Redesign", projectStatus: "In Progress", date: "2024-06-01", duration: 7, status: "Approved" },
    { name: "Eva Green", email: "eva@company.com", job: "Designer", department: "Marketing", project: "Brand Refresh", projectStatus: "In Progress", date: "2024-06-04", duration: 5, status: "Approved" },
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

function sortData(data, sortBy, sortDir) {
    return [...data].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortDir === "asc" ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortDir === "asc" ? 1 : -1;
        return 0;
    });
}

function formatDateRange(range) {
    if (!range || !range.from) return "All Time";
    if (!range.to) return `${range.from.toLocaleDateString()}`;
    return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
}

export default function EmployeeTimeLogsReport() {
    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState("asc");
    const [dateRange, setDateRange] = useState(null);
    const sorted = sortData(initialData, sortBy, sortDir);

    // Filter by date range if selected
    const filtered = dateRange && dateRange.from ?
        sorted.filter(row => {
            const d = new Date(row.date);
            const from = dateRange.from;
            const to = dateRange.to || dateRange.from;
            return d >= from && d <= to;
        }) : sorted;

    const totalLogs = filtered.length;
    const totalHours = filtered.reduce((sum, row) => sum + row.duration, 0);

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-2">Employee Time Logs Report</h2>
            <div className="mb-2 text-gray-600 text-sm">Date: <span className="font-medium">{formatDateRange(dateRange)}</span></div>
            <div className="mb-4 text-gray-700 text-sm flex gap-6">
                <span>Total Logs: <b>{totalLogs}</b></span>
                <span>Total Hours: <b>{totalHours}</b></span>
            </div>
            <DateRangePicker onChange={setDateRange} />
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
                                    <td key={col.key} className="px-4 py-2 border">{row[col.key]}</td>
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