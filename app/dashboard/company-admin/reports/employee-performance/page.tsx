"use client";
import { useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";

const initialData = [
    { name: "Alice Smith", email: "alice@company.com", job: "Frontend Dev", department: "Engineering", hours: 160, projects: 2, tasks: 15, unproductive: 1, score: 92 },
    { name: "Bob Lee", email: "bob@company.com", job: "Marketing Lead", department: "Marketing", hours: 120, projects: 1, tasks: 10, unproductive: 0, score: 88 },
    { name: "Carol Jones", email: "carol@company.com", job: "Backend Dev", department: "Engineering", hours: 140, projects: 2, tasks: 12, unproductive: 1, score: 90 },
    { name: "David Kim", email: "david@company.com", job: "QA Engineer", department: "Engineering", hours: 130, projects: 1, tasks: 9, unproductive: 0, score: 85 },
];

const columns = [
    { key: "name", label: "Employee Name" },
    { key: "email", label: "Email" },
    { key: "job", label: "Job Title" },
    { key: "department", label: "Department" },
    { key: "hours", label: "Hours Logged" },
    { key: "projects", label: "Projects Participated" },
    { key: "tasks", label: "Tasks Completed" },
    { key: "unproductive", label: "Unproductive Days" },
    { key: "score", label: "Performance Score" },
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

export default function EmployeePerformanceReport() {
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [dateRange, setDateRange] = useState(null);
    const sorted = sortData(initialData, sortBy, sortDir);

    // No date field in employee, so just show all for now
    const filtered = sorted;
    const totalEmployees = filtered.length;
    const avgScore = totalEmployees ? Math.round(filtered.reduce((sum, row) => sum + row.score, 0) / totalEmployees) : 0;

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-2">Employee Performance Report</h2>
            <div className="mb-2 text-gray-600 text-sm">Date: <span className="font-medium">{formatDateRange(dateRange)}</span></div>
            <div className="mb-4 text-gray-700 text-sm flex gap-6">
                <span>Total Employees: <b>{totalEmployees}</b></span>
                <span>Average Score: <b>{avgScore}</b></span>
            </div>
            <DateRangePicker onChange={setDateRange} />
            {/* TODO: Add department filter */}
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