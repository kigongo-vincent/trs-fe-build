import { getRequest, postRequest, putRequest, deleteRequest } from "./api";

interface User {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  password: string;
  employeeId: string | null;
  status: string;
  jobTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  resetToken: string | null;
  resetTokenExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  status: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string;
  users: User[];
  projects: any[];
}

interface DepartmentsResponse {
  status: number;
  message: string;
  data: Department[];
}

interface CreateDepartmentPayload {
  companyId: string;
  name: string;
  head: string;
  description: string;
}

interface CreateDepartmentResponse {
  status: number;
  message: string;
  data: Department;
}

interface UpdateDepartmentPayload {
  companyId: string;
  name: string;
  head: string;
  description: string;
}

interface UpdateDepartmentResponse {
  status: number;
  message: string;
  data: Department;
}

interface DeleteDepartmentResponse {
  status: number;
  message: string;
  data?: any;
}

export const getDepartments = async (
  companyId: string
): Promise<DepartmentsResponse> => {
  return getRequest<DepartmentsResponse>(`/departments/company/${companyId}`);
};

export const createDepartment = async (
  payload: CreateDepartmentPayload
): Promise<CreateDepartmentResponse> => {
  return postRequest<CreateDepartmentResponse>("/departments/create", payload);
};

export const updateDepartment = async (
  id: string,
  payload: UpdateDepartmentPayload
): Promise<UpdateDepartmentResponse> => {
  return putRequest<UpdateDepartmentResponse>(
    `/departments/update/${id}`,
    payload
  );
};

export const deleteDepartment = async (
  id: string
): Promise<DeleteDepartmentResponse> => {
  return deleteRequest<DeleteDepartmentResponse>(`/departments/${id}`);
};
