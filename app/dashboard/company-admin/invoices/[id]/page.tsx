import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Mail, Printer } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const { id } = params

  // In a real application, you would fetch the invoice data based on the ID
  // For now, we'll use mock data
  const invoice = {
    id,
    number: id,
    date: "May 11, 2025",
    dueDate: "May 26, 2025",
    status: id.includes("05") ? "pending" : "paid",
    employee: {
      name: "John Smith",
      email: "john.smith@example.com",
      department: "Development",
      position: "Lead Developer",
    },
    company: {
      name: "Tek Tasks Inc.",
      address: "123 Tech Lane, San Francisco, CA 94107",
      email: "billing@tektasks.com",
      phone: "(555) 123-4567",
    },
    items: [
      {
        description: "Regular Hours",
        hours: 160,
        rate: 25,
        amount: 4000,
      },
      {
        description: "Overtime Hours",
        hours: 8,
        rate: 37.5,
        amount: 300,
      },
    ],
    subtotal: 4300,
    tax: 430,
    total: 4730,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/company-admin/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Invoice {invoice.number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Invoice</h2>
                <p className="text-primary-foreground/80">{invoice.number}</p>
              </div>
              <div className="flex flex-col items-start md:items-end">
                <Badge
                  variant="outline"
                  className={
                    invoice.status === "paid"
                      ? "bg-green-500/20 text-green-50 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-50 border-yellow-500/30"
                  }
                >
                  {invoice.status === "paid" ? "Paid" : "Pending"}
                </Badge>
                <p className="text-sm text-primary-foreground/80 mt-1">Due: {invoice.dueDate}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold">Bill From</h3>
                <div className="mt-2 space-y-1">
                  <p className="font-medium">{invoice.company.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.company.address}</p>
                  <p className="text-sm text-muted-foreground">{invoice.company.email}</p>
                  <p className="text-sm text-muted-foreground">{invoice.company.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Bill To</h3>
                <div className="mt-2 space-y-1">
                  <p className="font-medium">{invoice.employee.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.employee.position}</p>
                  <p className="text-sm text-muted-foreground">{invoice.employee.department}</p>
                  <p className="text-sm text-muted-foreground">{invoice.employee.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.hours}</TableCell>
                      <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tax (10%):</span>
                    <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">
                Payment is due within 15 days of invoice date. Please make payment to the bank account specified in your
                contract. Thank you for your business.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-6">
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">Invoice generated on {invoice.date}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/company-admin/invoices">Back to Invoices</Link>
              </Button>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
