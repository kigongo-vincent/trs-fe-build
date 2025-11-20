import { getRequest, postRequest, putRequest, deleteRequest } from "./api";

// Types for Freelancer Dashboard API Response
export interface HoursData {
  count: number;
  percentage: number;
}

export interface WeekDistribution {
  day: number;
  hours: number;
}

export interface RecentLog {
  date: string;
  title: string;
  project: string;
  minutes: number;
  status: string;
  id: string;
}

export interface FreelancerDashboardData {
  hoursToday: HoursData;
  hoursWeek: HoursData;
  hoursMonth: HoursData;
  weekDistribution: WeekDistribution[];
  recentLogs: RecentLog[];
}

export interface FreelancerDashboardResponse {
  status: number;
  message: string;
  data: FreelancerDashboardData;
}

// Types for Time Logs API Response
export interface FreelancerTimeLogUser {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  password: string;
  freelancerId: string | null;
  status: string;
  hourlyRate: number | null;
  bio: string | null;
  profileImage: string | null;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerTimeLogProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerTimeLog {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  status: string;
  projectId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: FreelancerTimeLogUser;
  project: FreelancerTimeLogProject | null;
}

export interface FreelancerTimeLogsResponse {
  status: number;
  message: string;
  data: {
    items: FreelancerTimeLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface FreelancerTimeLogsWithFiltersResponse {
  status: number;
  message: string;
  data: {
    items: FreelancerTimeLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface FreelancerCompany {
  id: string;
  companyName: string;
  sector: string;
  contactPersonName1: string;
  contactPersonEmail1: string;
  contactPersonName2: string;
  contactPersonEmail2: string;
  address: string;
  status: "active" | "inactive";
}

export interface FreelancerCompanyResponse {
  status: number;
  message: string;
  data: FreelancerCompany[];
}

// API Functions
export const fetchFreelancerDashboard =
  async (): Promise<FreelancerDashboardData> => {
    try {
      const response = await getRequest<FreelancerDashboardResponse>(
        "/freelancer/dashboard"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching freelancer dashboard:", error);
      throw error;
    }
  };

export const fetchFreelancerCompanies =
  async (): Promise<FreelancerCompanyResponse> => {
    try {
      const response = await getRequest<any>("/freelancer/companies");
      return response.data;
    } catch (error) {
      // console.error("Error fetching freelancer companies:", error);
      throw error;
    }
  };

export const createFreelancerCompany = async (
  data: FreelancerCompany
): Promise<any> => {
  return await postRequest<any>("/freelancer/companies", data);
};

export const updateFreelancerCompany = async (
  companyId: string,
  data: Partial<FreelancerCompany>
): Promise<any> => {
  return await putRequest<any>(`/freelancer/companies/${companyId}`, data);
};

export const deleteFreelancerCompany = async (
  companyId: string
): Promise<any> => {
  return await deleteRequest<any>(`/freelancer/companies/${companyId}`);
};

export const fetchFreelancerTimeLogs = async (
  params: {
    page?: number;
    limit?: number;
  } = {}
): Promise<FreelancerTimeLogsResponse["data"]> => {
  try {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    });

    const response = await getRequest<FreelancerTimeLogsResponse>(
      `/freelancer/time-logs?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching freelancer time logs:", error);
    throw error;
  }
};

export const fetchFreelancerTimeLogsWithFilters = async (filters: {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}): Promise<FreelancerTimeLogsWithFiltersResponse["data"]> => {
  try {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 20).toString(),
    });

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.projectId) params.append("projectId", filters.projectId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await getRequest<FreelancerTimeLogsWithFiltersResponse>(
      `/freelancer/time-logs/filter?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching freelancer time logs with filters:", error);
    throw error;
  }
};

export const createFreelancerTimeLog = async (timeLogData: {
  title: string;
  description?: string;
  duration: number;
  status: string;
  projectId?: string;
  attachments?: string[];
  urls?: { url: string; name: string }[];
}): Promise<FreelancerTimeLog> => {
  try {
    const response = await postRequest<{
      status: number;
      message: string;
      data: FreelancerTimeLog;
    }>("/freelancer/time-logs", timeLogData);
    return response.data;
  } catch (error) {
    console.error("Error creating freelancer time log:", error);
    throw error;
  }
};

export const updateFreelancerTimeLog = async (
  id: string,
  timeLogData: {
    title?: string;
    description?: string;
    duration?: number;
    status?: string;
    projectId?: string;
    attachments?: string[];
    urls?: { url: string; name: string }[];
  }
): Promise<FreelancerTimeLog> => {
  try {
    const response = await putRequest<{
      status: number;
      message: string;
      data: FreelancerTimeLog;
    }>(`/freelancer/time-logs/${id}`, timeLogData);
    return response.data;
  } catch (error) {
    console.error("Error updating freelancer time log:", error);
    throw error;
  }
};

export const deleteFreelancerTimeLog = async (id: string): Promise<void> => {
  try {
    await deleteRequest(`/freelancer/time-logs/${id}`);
  } catch (error) {
    console.error("Error deleting freelancer time log:", error);
    throw error;
  }
};

export const publishFreelancerTimeLog = async (
  id: string
): Promise<FreelancerTimeLog> => {
  try {
    const response = await putRequest<{
      status: number;
      message: string;
      data: FreelancerTimeLog;
    }>(`/freelancer/time-logs/${id}/publish`, {});
    return response.data;
  } catch (error) {
    console.error("Error publishing freelancer time log:", error);
    throw error;
  }
};

export const publishAllFreelancerDrafts = async (): Promise<{
  count: number;
}> => {
  try {
    const response = await putRequest<{
      status: number;
      message: string;
      data: { count: number };
    }>("/freelancer/time-logs/publish-all", {});
    return response.data;
  } catch (error) {
    console.error("Error publishing all freelancer drafts:", error);
    throw error;
  }
};

// Utility functions
export const formatDurationString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

export const formatHoursCount = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours % 1) * 60);
  if (wholeHours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
};
