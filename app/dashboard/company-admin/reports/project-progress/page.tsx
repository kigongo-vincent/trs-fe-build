"use client";
import { useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";

const initialData = [
    { name: "Website Redesign", description: "Revamp company website", department: "Engineering", head: "Jane Doe", lead: "Alice Smith", teamSize: 5, budget: 20000, status: "In Progress", progress: 60, deadline: "2024-07-01" },
    { name: "Ad Campaign", description: "Summer ad campaign", department: "Marketing", head: "John Smith", lead: "Bob Lee", teamSize: 3, budget: 10000, status: "Completed", progress: 100, deadline: "2024-06-10" },
    { name: "API Development", description: "New public API", department: "Engineering", head: "Jane Doe", lead: "Carol Jones", teamSize: 4, budget: 15000, status: "Not Started", progress: 0, deadline: "2024-08-01" },
    { name: "Brand Refresh", description: "Update branding", department: "Marketing", head: "John Smith", lead: "Eva Green", teamSize: 2, budget: 5000, status: "In Progress", progress: 40, deadline: "2024-07-15" },
];

const columns = [
    { key: "name", label: "Project Name" },
    { key: "description", label: "Description" },
    { key: "department", label: "Department" },
    { key: "head", label: "Department Head" },
    { key: "lead", label: "Project Lead" },
    { key: "teamSize", label: "Team Size" },
    { key: "budget", label: "Budget ($)" },
    { key: "status", label: "Status" },
    { key: "progress", label: "Progress %" },
    { key: "deadline", label: "Deadline" },
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

export default function ProjectProgressReport() {
    const [sortBy, setSortBy] = useState("deadline");
    const [sortDir, setSortDir] = useState("asc");
    const [dateRange, setDateRange] = useState(null);
    const sorted = sortData(initialData, sortBy, sortDir);

    // Filter by deadline if selected
    const filtered = dateRange && dateRange.from ?
        sorted.filter(row => {
            const d = new Date(row.deadline);
            const from = dateRange.from;
            const to = dateRange.to || dateRange.from;
            return d >= from && d <= to;
        }) : sorted;

    const totalProjects = filtered.length;
    const avgProgress = totalProjects ? Math.round(filtered.reduce((sum, row) => sum + row.progress, 0) / totalProjects) : 0;

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-2">Project Progress & Status Report</h2>
            <div className="mb-2 text-gray-600 text-sm">Date: <span className="font-medium">{formatDateRange(dateRange)}</span></div>
            <div className="mb-4 text-gray-700 text-sm flex gap-6">
                <span>Total Projects: <b>{totalProjects}</b></span>
                <span>Average Progress: <b>{avgProgress}%</b></span>
            </div>
            <DateRangePicker onChange={setDateRange} />
            {/* TODO: Add department/status filters */}
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