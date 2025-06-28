"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { fetchInvoiceById } from "@/services/employee"
import { format } from "date-fns"
import React from "react"

export default function EmployeeInvoiceClient({ params }: { params: any }) {
    // Unwrap params if it's a Promise (Next.js 15+)
    const unwrappedParams = typeof params.then === "function" ? React.use(params) : params
    const invoiceId = unwrappedParams.id
    const [invoice, setInvoice] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const data = await fetchInvoiceById(invoiceId)
                setInvoice(data)
            } catch (err) {
                setError("Failed to fetch invoice.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [invoiceId])

    if (isLoading) {
        return <div className="p-8 text-center">Loading invoice...</div>
    }
    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>
    }
    if (!invoice) {
        return <div className="p-8 text-center text-muted-foreground">Invoice not found.</div>
    }

    // Helper for formatting money
    const formatMoney = (amount: number) => `$${(amount / 100).toFixed(2)}`

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/employee/invoices">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-none">
                <CardContent className="p-0">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm" id="invoice-printable">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">INVOICE</h3>
                                    <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-xl font-semibold">{invoice.user?.company?.name || "Company"}</h3>
                                    <p className="text-sm text-muted-foreground">Time Tracking System</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium">Bill To:</h4>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm font-medium">{invoice.user?.fullName}</p>
                                        <p className="text-sm text-muted-foreground">{invoice.user?.jobTitle}</p>
                                        <p className="text-sm text-muted-foreground">{invoice.user?.department?.name}</p>
                                        <p className="text-sm text-muted-foreground">Employee ID: {invoice.user?.employeeId}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium">From:</h4>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm font-medium">{invoice.user?.company?.name}</p>
                                        <p className="text-sm text-muted-foreground">{invoice.user?.company?.address}</p>
                                        <p className="text-sm text-muted-foreground">{invoice.user?.company?.phone}</p>
                                        <p className="text-sm text-muted-foreground">{invoice.user?.company?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium">Invoice Number</h4>
                                        <p className="text-sm mt-1">{invoice.invoiceNumber}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">Period</h4>
                                        <p className="text-sm mt-1">{format(new Date(invoice.periodStart), 'MMM yyyy')}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium">Status</h4>
                                        <div className="mt-1">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    invoice.status === "paid"
                                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                                        : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                                                }
                                            >
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">Date Processed</h4>
                                        <p className="text-sm mt-1">{format(new Date(invoice.processedAt), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium">Date Paid</h4>
                                        <p className="text-sm mt-1">{invoice.paidAt ? format(new Date(invoice.paidAt), 'MMM d, yyyy') : '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">Total Hours</h4>
                                        <p className="text-sm mt-1">{invoice.hours} hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="p-6">
                            <h4 className="text-sm font-medium mb-4">Project Details</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead className="text-right">Entries</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(invoice.projectDetails || []).map((entry: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{entry.name}</TableCell>
                                            <TableCell className="text-right">{entry.hours}</TableCell>
                                            <TableCell className="text-right">{entry.entries}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Separator />
                        <div className="p-6 flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div>Subtotal:</div>
                                    <div className="font-medium">{formatMoney(invoice.amount)}</div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div>Tax:</div>
                                    <div className="font-medium">$0.00</div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-base font-medium">
                                    <div>Total:</div>
                                    <div>{formatMoney(invoice.amount)}</div>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="p-6">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Notes</h4>
                                <p className="text-sm text-muted-foreground">
                                    {invoice.description || `Thank you for your work during ${format(new Date(invoice.periodStart), 'MMM yyyy')}. This invoice represents the hours worked and approved for the period.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 