"use client";
import { useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";

const initialData = [
    { department: "Engineering", head: "Jane Doe", employees: 12, inProgress: 2, completed: 4, hours: 320, unproductive: 2, progress: 75 },
    { department: "Marketing", head: "John Smith", employees: 8, inProgress: 1, completed: 3, hours: 210, unproductive: 1, progress: 80 },
    { department: "HR", head: "Mary Lee", employees: 4, inProgress: 0, completed: 1, hours: 120, unproductive: 0, progress: 90 },
    { department: "Finance", head: "Paul Kim", employees: 5, inProgress: 1, completed: 2, hours: 150, unproductive: 0, progress: 85 },
];

const columns = [
    { key: "department", label: "Department" },
    { key: "head", label: "Department Head" },
    { key: "employees", label: "Employees" },
    { key: "inProgress", label: "Projects In Progress" },
    { key: "completed", label: "Projects Completed" },
    { key: "hours", label: "Total Hours" },
    { key: "unproductive", label: "Unproductive Days" },
    { key: "progress", label: "Average Progress (%)" },
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

export default function DepartmentPerformanceReport() {
    const [sortBy, setSortBy] = useState("department");
    const [sortDir, setSortDir] = useState("asc");
    const [dateRange, setDateRange] = useState(null);
    const sorted = sortData(initialData, sortBy, sortDir);

    // No date field in department, so just show all for now
    const filtered = sorted;
    const totalDepartments = filtered.length;
    const avgProgress = totalDepartments ? Math.round(filtered.reduce((sum, row) => sum + row.progress, 0) / totalDepartments) : 0;

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-2">Department Performance Report</h2>
            <div className="mb-2 text-gray-600 text-sm">Date: <span className="font-medium">{formatDateRange(dateRange)}</span></div>
            <div className="mb-4 text-gray-700 text-sm flex gap-6">
                <span>Total Departments: <b>{totalDepartments}</b></span>
                <span>Average Progress: <b>{avgProgress}%</b></span>
            </div>
            <DateRangePicker onChange={setDateRange} />
            {/* TODO: Add filters if needed */}
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