import { getRequest } from "./api";
import { getAuthData } from "./auth";

export interface TasksSummaryData {
  totalTasks: number;
  activeTasks: number;
  draftTasks: number;
  totalHours: number;
}

export interface TasksSummaryResponse {
  status: number;
  message: string;
  data: TasksSummaryData;
}

export interface TasksByDepartmentData {
  departmentName: string;
  totalTasks: number;
}

export interface TasksByDepartmentResponse {
  status: number;
  message: string;
  data: TasksByDepartmentData[];
}

export interface Department {
  id: string;
  name: string;
  head: string;
  status: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  deadline: string;
  progress: number;
  created_at: string;
  updated_at: string;
  department: Department;
}

export interface Task {
  id: string;
  duration: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  project: Project;
}

export interface AllTasksResponse {
  status: number;
  message: string;
  data: Task[];
}

export interface UpdateTaskPayload {
  duration: number;
  title: string;
  description: string;
  status?: string;
  project: number;
  department?: string;
  urls?: { name: string; url: string }[];
  attachments?: any[];
}

export async function fetchTasksSummary(): Promise<TasksSummaryResponse> {
  const authData = getAuthData();
  if (!authData?.user?.company?.id) {
    throw new Error("Company ID not found");
  }

  return getRequest(
    `/company/tasks/overview/summary/${authData.user.company.id}`
  );
}

export async function fetchTasksByDepartment(): Promise<TasksByDepartmentResponse> {
  const authData = getAuthData();
  if (!authData?.user?.company?.id) {
    throw new Error("Company ID not found");
  }

  return getRequest(
    `/company/tasks/overview/department/${authData.user.company.id}`
  );
}

export async function fetchAllTasks(): Promise<AllTasksResponse> {
  const authData = getAuthData();
  if (!authData?.user?.company?.id) {
    throw new Error("Company ID not found");
  }

  return getRequest(`/company/tasks/all/${authData.user.company.id}`);
}

export async function updateTask(
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  const { putRequest } = await import("./api");
  return putRequest<Task>(`/consultants/time-logs/${id}`, payload);
}

export async function deleteTask(id: string): Promise<void> {
  const { deleteRequest } = await import("./api");
  await deleteRequest(`/consultants/time-logs/${id}`);
}
