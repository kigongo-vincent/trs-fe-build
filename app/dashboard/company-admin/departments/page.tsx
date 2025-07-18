"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Plus, Search, SearchIcon, Trash, Users } from "lucide-react"
import { DepartmentDistributionChart } from "@/components/department-distribution-chart"
import { DeleteDepartmentDialog } from "@/components/delete-department-dialog"
import { getDepartments } from "@/services/departments"
import { getAuthData, getUserRole } from "@/services/auth"
import Link from "next/link"
import type { Department, User } from "@/services/departments"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true)

        // Get company ID from auth data
        const authData = getAuthData()
        if (!authData?.user?.company?.id) {
          setError("Company information not found. Please log in again.")
          return
        }

        const companyId = authData.user.company.id
        const response = await getDepartments(companyId)

        if (response.status === 200) {
          setDepartments(response.data)
        } else {
          setError("Failed to fetch departments")
        }
      } catch (err) {
        setError("An error occurred while fetching departments")
        console.error("Error fetching departments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  // Filter departments based on search term
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.head?.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  // Calculate statistics
  const totalDepartments = departments.length
  const totalEmployees = departments.reduce((sum, dept) => sum + dept.users.length, 0)
  const avgTeamSize = totalDepartments > 0 ? (totalEmployees / totalDepartments).toFixed(2) : "0"

  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
      case "inactive":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
    }
  }

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department)
    setDeleteModalOpen(true)
  }

  const handleDeleteSuccess = () => {
    // Refresh the departments list
    const fetchDepartments = async () => {
      try {
        setLoading(true)
        const authData = getAuthData()
        if (!authData?.user?.company?.id) {
          setError("Company information not found. Please log in again.")
          return
        }

        const companyId = authData.user.company.id
        const response = await getDepartments(companyId)

        if (response.status === 200) {
          setDepartments(response.data)
        } else {
          setError("Failed to fetch departments")
        }
      } catch (err) {
        setError("An error occurred while fetching departments")
        console.error("Error fetching departments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  if (userRole === null) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Departments</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Departments</h1>
        <div className="flex items-center gap-2">
          {userRole !== "Board Member" && (
            <Button asChild>
              <Link href="/dashboard/company-admin/departments/create">
                <Plus className="mr-2 h-4 w-4" /> Add Department
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl text-primary font-bold">{totalDepartments}</div>}
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl text-primary font-bold">{totalEmployees}</div>}
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl text-primary font-bold">{avgTeamSize}</div>}
            <p className="text-xs text-muted-foreground">Employees per department</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
          <CardDescription>Employee distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <DepartmentDistributionChart departments={departments.map((dept) => ({
              ...dept,
              head: dept.head?.fullName || "",
            }))} />
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <SearchIcon className="h-4 w-4" />
          </span>
          <Input
            type="text"
            placeholder="Search departments..."
            className="h-10 pl-10 pr-4 rounded-lg border border-muted bg-muted/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search departments"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>Manage your company departments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  {userRole !== "Board Member" && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {searchTerm ? "No departments found matching your search." : "No departments available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell>{department.head?.fullName || ""}</TableCell>
                      <TableCell>{department.users.length}</TableCell>
                      <TableCell>{department.projects.length}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getBadgeVariant(department.status)}>
                          {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                        </Badge>
                      </TableCell>
                      {userRole !== "Board Member" && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/company-admin/departments/edit/${department.id}?name=${encodeURIComponent(department.name)}&head=${encodeURIComponent(department.head?.fullName || "")}&description=${encodeURIComponent(department.description || '')}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(department)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteDepartmentDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleteSuccess={handleDeleteSuccess}
        department={
          departmentToDelete
            ? {
              ...departmentToDelete,
              head: departmentToDelete.head?.fullName || "",
            }
            : null
        }
      />
    </div>
  )
}
