import { getRequest } from "./api"

interface User {
  id: string
  fullName: string
  firstName: string | null
  lastName: string | null
  email: string
  password: string
  employeeId: string | null
  status: string
  jobTitle: string | null
  bio: string | null
  avatarUrl: string | null
  resetToken: string | null
  resetTokenExpires: string | null
  createdAt: string
  updatedAt: string
}

interface Department {
  id: string
  name: string
  head: string
  status: string
  description: string | null
  createdAt: string | null
  updatedAt: string
  users: User[]
  projects: any[]
}

interface DepartmentsResponse {
  status: number
  message: string
  data: Department[]
}

export const getDepartments = async (companyId: string): Promise<DepartmentsResponse> => {
  return getRequest<DepartmentsResponse>(`/departments/company/${companyId}`)
}
