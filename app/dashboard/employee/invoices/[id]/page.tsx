import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  // In a real application, you would fetch the invoice data based on the ID
  const invoiceId = params.id

  // Mock data for the invoice
  const invoice = {
    id: invoiceId,
    period: invoiceId === "INV-2025-05" ? "May 2025" : "April 2025",
    status: invoiceId === "INV-2025-05" ? "Processing" : "Paid",
    dateProcessed: invoiceId === "INV-2025-05" ? "May 31, 2025" : "April 30, 2025",
    datePaid: invoiceId === "INV-2025-05" ? "-" : "May 5, 2025",
    hours: invoiceId === "INV-2025-05" ? 170 : 165,
    rate: 25,
    amount: invoiceId === "INV-2025-05" ? 4250 : 4125,
    employee: {
      name: "John Doe",
      position: "Frontend Developer",
      department: "Engineering",
      employeeId: "EMP-2023-042",
    },
    company: {
      name: "Tek Tasks Inc.",
      address: "123 Tech Street, San Francisco, CA 94107",
      phone: "+1 (555) 123-4567",
      email: "billing@tektasks.com",
    },
    timeEntries: [
      { project: "Website Redesign", task: "Update homepage", hours: invoiceId === "INV-2025-05" ? 42 : 40, rate: 25 },
      { project: "Bug Fixes", task: "Fix login issues", hours: invoiceId === "INV-2025-05" ? 35 : 32, rate: 25 },
      { project: "Product Launch", task: "Create mockups", hours: invoiceId === "INV-2025-05" ? 48 : 45, rate: 25 },
      { project: "Marketing Campaign", task: "Design assets", hours: invoiceId === "INV-2025-05" ? 45 : 48, rate: 25 },
    ],
  }

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
                  <p className="text-sm text-muted-foreground">{invoice.id}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-semibold">Tek Tasks Inc.</h3>
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
                    <p className="text-sm font-medium">{invoice.employee.name}</p>
                    <p className="text-sm text-muted-foreground">{invoice.employee.position}</p>
                    <p className="text-sm text-muted-foreground">{invoice.employee.department}</p>
                    <p className="text-sm text-muted-foreground">Employee ID: {invoice.employee.employeeId}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">From:</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">{invoice.company.name}</p>
                    <p className="text-sm text-muted-foreground">{invoice.company.address}</p>
                    <p className="text-sm text-muted-foreground">{invoice.company.phone}</p>
                    <p className="text-sm text-muted-foreground">{invoice.company.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Invoice Number</h4>
                    <p className="text-sm mt-1">{invoice.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Period</h4>
                    <p className="text-sm mt-1">{invoice.period}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={
                          invoice.status === "Paid"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Date Processed</h4>
                    <p className="text-sm mt-1">{invoice.dateProcessed}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Date Paid</h4>
                    <p className="text-sm mt-1">{invoice.datePaid}</p>
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
              <h4 className="text-sm font-medium mb-4">Time Entries</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.timeEntries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.project}</TableCell>
                      <TableCell>{entry.task}</TableCell>
                      <TableCell className="text-right">{entry.hours}</TableCell>
                      <TableCell className="text-right">${entry.rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(entry.hours * entry.rate).toFixed(2)}</TableCell>
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
                  <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>Tax:</div>
                  <div className="font-medium">$0.00</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-medium">
                  <div>Total:</div>
                  <div>${invoice.amount.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="p-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  Thank you for your work during {invoice.period}. This invoice represents the hours worked and approved
                  for the period.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
