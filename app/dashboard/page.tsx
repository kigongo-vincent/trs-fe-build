"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Task Reporting System</h1>
        <p className="text-muted-foreground">Select your role to access the appropriate dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Image
                  src="/placeholder.svg?height=64&width=64"
                  alt="Super Admin"
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Super Admin</CardTitle>
            <CardDescription className="text-center">Manage packages, companies, and license keys</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="space-y-2">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Create and manage packages</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Assign license keys</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Monitor company usage</span>
                </li>
              </ul>
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/super-admin">
                  Access Super Admin
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Image
                  src="/placeholder.svg?height=64&width=64"
                  alt="Company Admin"
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Company Admin</CardTitle>
            <CardDescription className="text-center">Manage departments, projects, and consultants</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="space-y-2">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Create departments and projects</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Manage consultants and tasks</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Export invoices and reports</span>
                </li>
              </ul>
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/company-admin">
                  Access Company Admin
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Image
                  src="/placeholder.svg?height=64&width=64"
                  alt="Consultant"
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Consultant</CardTitle>
            <CardDescription className="text-center">Manage and track your assigned tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="space-y-2">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>View assigned tasks</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Log time spent on tasks</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Track your performance</span>
                </li>
              </ul>
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/consultant">
                  Access Consultant Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
