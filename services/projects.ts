import { getRequest, postRequest, putRequest } from "./api";

export interface CreateProjectPayload {
  departmentId: string;
  name: string;
  leadId: string;
  deadline: string;
}

export interface CreateProjectResponse {
  status: number;
  message: string;
  data: {
    id: string;
    name: string;
    departmentId: string;
    leadId: string;
    deadline: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Project {
  id: string;
  name: string;
  status: string;
  deadline: string;
  progress: number;
  created_at: string;
  updated_at: string;
  department: {
    id: string;
    name: string;
    head: string;
    status: string;
    description: string | null;
    createdAt: string | null;
    updatedAt: string;
  };
  lead: {
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
  };
}

export interface ProjectsResponse {
  status: number;
  message: string;
  data: Project[];
}

export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
}

export interface ProjectSummaryResponse {
  status: number;
  message: string;
  data: ProjectSummary;
}

export interface ProjectTimelineItem {
  name: string;
  progress: number;
}

export interface ProjectTimelineResponse {
  status: number;
  message: string;
  data: ProjectTimelineItem[];
}

export interface UpdateProjectPayload {
  status?: string;
  progress?: number;
  // add other updatable fields as needed
}

export const createProject = async (
  payload: CreateProjectPayload
): Promise<CreateProjectResponse> => {
  return postRequest<CreateProjectResponse>("/projects/create", payload);
};

export const getProjects = async (
  companyId: string
): Promise<ProjectsResponse> => {
  return getRequest<ProjectsResponse>(`/projects/${companyId}`);
};

export const getProjectsSummary = async (
  companyId: string
): Promise<ProjectSummaryResponse> => {
  return getRequest<ProjectSummaryResponse>(
    `/projects/overview/summary/${companyId}`
  );
};

export const getProjectsTimeline = async (
  companyId: string
): Promise<ProjectTimelineResponse> => {
  return getRequest<ProjectTimelineResponse>(
    `/projects/overview/timeline/${companyId}`
  );
};

export const getProjectsByLead = async (): Promise<ProjectsResponse> => {
  return getRequest<ProjectsResponse>(`/projects/by-lead`);
};

export const updateProject = async (
  projectId: string,
  payload: UpdateProjectPayload
): Promise<Project> => {
  return putRequest<Project>(`/projects/${projectId}`, payload);
};
