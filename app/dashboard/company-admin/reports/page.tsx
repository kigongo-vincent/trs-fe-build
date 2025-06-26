"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CompanyEmployeesChart } from "@/components/company-employees-chart";
import { DepartmentComparisonChart } from "@/components/department-comparison-chart";
import { ConsultantsByDepartmentChart } from "@/components/consultants-by-department-chart";
import { Download } from "lucide-react";
import Link from "next/link";

const exportToPDF = (section: string) => {
    // Placeholder for PDF export logic
    alert(`Exporting ${section} report as PDF (feature coming soon)`);
};

export default function ReportsDashboard() {
    const reports = [
        { name: "Employee Time Logs", path: "/dashboard/company-admin/reports/employee-time-logs" },
        { name: "Project Progress & Status", path: "/dashboard/company-admin/reports/project-progress" },
        { name: "Invoice Summary", path: "/dashboard/company-admin/reports/invoice-summary" },
        { name: "Department Performance", path: "/dashboard/company-admin/reports/department-performance" },
        { name: "Employee Performance", path: "/dashboard/company-admin/reports/employee-performance" },
    ];
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Company Reports</h1>
            <ul className="space-y-4">
                {reports.map(r => (
                    <li key={r.path}>
                        <Link href={r.path} className="text-blue-600 hover:underline text-lg">{r.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
} 