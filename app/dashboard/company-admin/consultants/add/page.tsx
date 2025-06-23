"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getRequest, postRequest } from "@/services/api"
import { getAuthData } from "@/services/auth"

// Interface for department data
interface Department {
  id: string
  name: string
  head: string
  createdAt: string | null
  updatedAt: string
  users: any[]
}

// Interface for API response
interface DepartmentsResponse {
  status: number
  message: string
  data: Department[]
}

export default function AddConsultantPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    departmentId: "",
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Consultant role ID
  const consultantRoleId = "0728a760-9495-4c9b-850b-d1f4ca5gb707"

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      setError(null)
      try {
        const authData = getAuthData()
        if (!authData || !authData.user || !authData.user.company) {
          throw new Error("Authentication data not found. Please log in again.")
        }

        const companyId = authData.user.company.id
        console.log(":: companyId ::", companyId)
        const response = await getRequest<DepartmentsResponse>(`/departments/company/${companyId}`)
        setDepartments(response.data)
      } catch (err: any) {
        console.error("Error fetching departments:", err)
        setError(err.message || "Failed to fetch departments. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, departmentId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate form
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (!formData.departmentId) {
      setError("Please select a department")
      return
    }

    setSubmitting(true)

    try {
      const authData = getAuthData()
      if (!authData || !authData.user || !authData.user.company) {
        throw new Error("Authentication data not found. Please log in again.")
      }

      const companyId = authData.user.company.id

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        departmentId: formData.departmentId,
        roleId: consultantRoleId,
        companyId: companyId,
      }

      await postRequest("/auth/signup", payload)
      // Immediately redirect back to the consultants list
      router.push("/dashboard/company-admin/consultants")
    } catch (err: any) {
      console.error("Error creating consultant:", err)
      setError(err.message || "Failed to create consultant. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/company-admin/consultants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Consultant</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Consultant Information</CardTitle>
          <CardDescription>
            Add a new consultant to your company. They will receive an email with instructions to set up their account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter consultant's full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the consultant's full name as it should appear in the system.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="consultant@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                The consultant will use this email to log in to the system.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.departmentId} onValueChange={handleDepartmentChange}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading departments...</span>
                    </div>
                  ) : departments.length === 0 ? (
                    <div className="py-2 px-2 text-sm">No departments found</div>
                  ) : (
                    departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Assign the consultant to a department within your company.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/company-admin/consultants">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Consultant
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
