"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Clock,
    TrendingUp,
    FileText,
    BarChart3,
    Users,
    ArrowRight,
    Download
} from "lucide-react";
import Link from "next/link";

const exportToPDF = (section: string) => {
    // Placeholder for PDF export logic
    alert(`Exporting ${section} report as PDF (feature coming soon)`);
};

export default function ReportsDashboard() {
    const reports = [
        {
            name: "Employee Time Logs",
            path: "/dashboard/company-admin/reports/employee-time-logs",
            description: "Track employee time spent on tasks and projects",
            icon: Clock,
            color: "text-blue-600"
        },
        {
            name: "Project Progress & Status",
            path: "/dashboard/company-admin/reports/project-progress",
            description: "Monitor project completion rates and milestones",
            icon: TrendingUp,
            color: "text-green-600"
        },
        {
            name: "Invoice Summary",
            path: "/dashboard/company-admin/reports/invoice-summary",
            description: "View and export invoice reports and summaries",
            icon: FileText,
            color: "text-purple-600"
        },
        {
            name: "Department Performance",
            path: "/dashboard/company-admin/reports/department-performance",
            description: "Analyze department productivity and efficiency",
            icon: BarChart3,
            color: "text-orange-600"
        },
        {
            name: "Employee Performance",
            path: "/dashboard/company-admin/reports/employee-performance",
            description: "Review individual employee performance metrics",
            icon: Users,
            color: "text-indigo-600"
        },
    ];

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Company Reports</h1>
                <p className="text-muted-foreground">
                    Access detailed reports and analytics for your company
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => {
                    const IconComponent = report.icon;
                    return (
                        <Card key={report.path} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-primary/10 ${report.color}`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{report.name}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {report.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <div className="flex gap-2">
                                    <Button className="flex-1" variant="outline" asChild>
                                        <Link href={report.path}>
                                            View Report
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => exportToPDF(report.name)}
                                        title={`Export ${report.name} as PDF`}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
} 