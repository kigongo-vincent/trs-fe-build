"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, FileText, FileSpreadsheet } from "lucide-react";

const initialData = [
    { name: "Website Redesign", description: "Revamp company website", department: "Engineering", head: "Jane Doe", lead: "Alice Smith", teamSize: 5, budget: 20000, status: "In Progress", progress: 60, deadline: "2024-07-01" },
    { name: "Ad Campaign", description: "Summer ad campaign", department: "Marketing", head: "John Smith", lead: "Bob Lee", teamSize: 3, budget: 10000, status: "Completed", progress: 100, deadline: "2024-06-10" },
    { name: "API Development", description: "New public API", department: "Engineering", head: "Jane Doe", lead: "Carol Jones", teamSize: 4, budget: 15000, status: "Not Started", progress: 0, deadline: "2024-08-01" },
    { name: "Brand Refresh", description: "Update branding", department: "Marketing", head: "John Smith", lead: "Eva Green", teamSize: 2, budget: 5000, status: "In Progress", progress: 40, deadline: "2024-07-15" },
];

const columns = [
    { key: "name", label: "Project Name" },
    { key: "department", label: "Dept" },
    { key: "lead", label: "Project Lead" },
    { key: "teamSize", label: "Team Size" },
    { key: "budget", label: "Budget ($)" },
    { key: "status", label: "Status" },
    { key: "progress", label: "Progress %" },
    { key: "deadline", label: "Deadline" },
];

function sortData(data: any[], sortBy: string, sortDir: string) {
    return [...data].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortDir === "asc" ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortDir === "asc" ? 1 : -1;
        return 0;
    });
}

function getSortIcon(columnKey: string, currentSortBy: string, currentSortDir: string) {
    if (currentSortBy !== columnKey) {
        return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return currentSortDir === "asc"
        ? <ChevronUp className="h-4 w-4 text-blue-600" />
        : <ChevronDown className="h-4 w-4 text-blue-600" />;
}

function exportToExcel(data: any[], columns: any[]) {
    // Create CSV content
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(row =>
        columns.map(col => {
            const value = row[col.key];
            // Handle values that might contain commas
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `project-progress-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printAsPDF() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString();
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Project Progress Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header-info { margin: 20px 0; color: #666; }
                .summary { margin: 20px 0; padding: 10px; background-color: #f9f9f9; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>Project Progress & Status Report</h1>
            <div class="header-info">
                <p><strong>Generated:</strong> ${currentDate}</p>
            </div>
            <div class="summary">
                <p><strong>Total Projects:</strong> ${initialData.length}</p>
                <p><strong>Average Progress:</strong> ${Math.round(initialData.reduce((sum, row) => sum + row.progress, 0) / initialData.length)}%</p>
            </div>
            <table>
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${initialData.map(row => `
                        <tr>
                            ${columns.map(col => `<td>${(row as any)[col.key]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()">Print Report</button>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
}

export default function ProjectProgressReport() {
    const [sortBy, setSortBy] = useState("deadline");
    const [sortDir, setSortDir] = useState("asc");
    const sorted = sortData(initialData, sortBy, sortDir);

    const totalProjects = sorted.length;
    const avgProgress = totalProjects ? Math.round(sorted.reduce((sum, row) => sum + row.progress, 0) / totalProjects) : 0;

    const handleSort = (col: string) => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-1">Project Progress & Status Report</h2>
            <div className="mb-2 text-gray-700 text-sm flex gap-4">
                <span>Total Projects: <b>{totalProjects}</b></span>
                <span>Average Progress: <b>{avgProgress}%</b></span>
            </div>
            <div className="my-3 overflow-x-auto">
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className="px-3 py-1.5 border cursor-pointer select-none hover:bg-gray-200 transition-colors"
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{col.label}</span>
                                        {getSortIcon(col.key, sortBy, sortDir)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((row, i) => (
                            <tr key={i} className="even:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col.key} className="px-3 py-1.5 border">{row[col.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 mt-2">
                <button
                    className="border border-green-600 text-green-600 px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600 hover:text-white transition-colors text-[13.5px]"
                    onClick={() => exportToExcel(sorted, columns)}
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export to Excel
                </button>
                <button
                    className="border border-red-600 text-red-600 px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600 hover:text-white transition-colors text-[13.5px]"
                    onClick={printAsPDF}
                >
                    <FileText className="h-4 w-4" />
                    Print as PDF
                </button>
            </div>
        </div>
    );
} 