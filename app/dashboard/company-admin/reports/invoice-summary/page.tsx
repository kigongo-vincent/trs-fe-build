"use client";
import { useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";

const initialData = [
    { invoice: "INV-001", employee: "Alice Smith", department: "Engineering", amount: 1200, status: "Paid", due: "2024-06-10", paid: "2024-06-09", reviewer: "John Smith", approver: "Jane Doe", processed: "2024-06-08" },
    { invoice: "INV-002", employee: "Bob Lee", department: "Marketing", amount: 900, status: "Pending", due: "2024-06-15", paid: "-", reviewer: "Eva Green", approver: "John Smith", processed: "2024-06-13" },
    { invoice: "INV-003", employee: "Carol Jones", department: "Engineering", amount: 1500, status: "Overdue", due: "2024-06-05", paid: "-", reviewer: "Jane Doe", approver: "John Smith", processed: "2024-06-04" },
    { invoice: "INV-004", employee: "David Kim", department: "Engineering", amount: 1100, status: "Paid", due: "2024-06-12", paid: "2024-06-12", reviewer: "John Smith", approver: "Jane Doe", processed: "2024-06-11" },
];

const columns = [
    { key: "invoice", label: "Invoice Number" },
    { key: "employee", label: "Employee" },
    { key: "department", label: "Department" },
    { key: "amount", label: "Amount ($)" },
    { key: "status", label: "Status" },
    { key: "due", label: "Due Date" },
    { key: "paid", label: "Paid At" },
    { key: "reviewer", label: "Reviewer" },
    { key: "approver", label: "Approver" },
    { key: "processed", label: "Processed At" },
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

export default function InvoiceSummaryReport() {
    const [sortBy, setSortBy] = useState("due");
    const [sortDir, setSortDir] = useState("asc");
    const [dateRange, setDateRange] = useState(null);
    const sorted = sortData(initialData, sortBy, sortDir);

    // Filter by due date if selected
    const filtered = dateRange && dateRange.from ?
        sorted.filter(row => {
            const d = new Date(row.due);
            const from = dateRange.from;
            const to = dateRange.to || dateRange.from;
            return d >= from && d <= to;
        }) : sorted;

    const totalInvoices = filtered.length;
    const totalAmount = filtered.reduce((sum, row) => sum + row.amount, 0);

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-2">Invoice Summary Report</h2>
            <div className="mb-2 text-gray-600 text-sm">Date: <span className="font-medium">{formatDateRange(dateRange)}</span></div>
            <div className="mb-4 text-gray-700 text-sm flex gap-6">
                <span>Total Invoices: <b>{totalInvoices}</b></span>
                <span>Total Amount: <b>${totalAmount}</b></span>
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