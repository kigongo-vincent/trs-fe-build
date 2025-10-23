import { postRequest, getRequest, putRequest } from "./api";
import { getAuthUser } from "./auth";

interface CreateConsultantPayload {
  fullName: string;
  email: string;
  departmentId: string;
  roleId: string;
  companyId: string;
}

interface CreateConsultantResponse {
  status: number;
  message: string;
  data: any;
}

export interface Consultant {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  status: string;
  jobTitle: string | null;
  bio: string | null;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
    head: string;
    status: string;
    description: string | null;
  };
  company: {
    id: string;
    name: string;
    sector: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  role: {
    id: string;
    name: string;
    created_at: string | null;
    updated_at: string;
  };
  timeLogs: any[];
  invoices: any[];
  projects: any[];
}

interface ConsultantsResponse {
  status: number;
  message: string;
  data: Consultant[];
}

// Paginated consultants response interface
export interface PaginatedConsultantsResponse {
  status: number;
  message: string;
  data: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    items: Consultant[];
  };
}

export interface DepartmentSummary {
  id: string;
  name: string;
  head: string;
  status: string;
  description: string | null;
  consultantCount: number;
}

interface DepartmentSummaryResponse {
  status: number;
  message: string;
  data: DepartmentSummary[];
}

// New interfaces for consultant dashboard
export interface ConsultantDashboardData {
  hoursToday: {
    count: number;
    percentage: number;
  };
  hoursWeek: {
    count: number;
    percentage: number;
  };
  hoursMonth: {
    count: number;
    percentage: number;
  };
  hoursLastMonth: {
    count: number;
    percentage: number;
  };
  weekDistribution: Array<{
    day: number;
    hours: number;
  }>;
  recentLogs: Array<{
    date: string;
    title: string;
    project: string;
    minutes: number;
    status: string;
    id: string;
  }>;
}

interface ConsultantDashboardResponse {
  status: number;
  message: string;
  data: ConsultantDashboardData;
}

// Consultant Invoice Types
export interface ConsultantInvoiceSummaryItem {
  label: string;
  amount: number | null;
  currency?: string;
}

export interface ConsultantInvoiceSummaryResponse {
  status: number;
  message: string;
  data: ConsultantInvoiceSummaryItem[];
}

export interface ConsultantInvoiceListItem {
  id: string;
  invoiceNumber: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  amount: string;
  currency?: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultantInvoiceListResponse {
  status: number;
  message: string;
  data: ConsultantInvoiceListItem[];
}

export interface ConsultantMonthlySummaryItem {
  label: string;
  amount: number;
  currency?: string;
}

export interface ConsultantMonthlySummaryResponse {
  status: number;
  message: string;
  data: ConsultantMonthlySummaryItem[];
}

// Helper functions
export const formatMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const getDayName = (dayIndex: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayIndex] || "Unknown";
};

export const getTrendIndicator = (percentage: number) => {
  if (percentage > 0)
    return { icon: "up", color: "text-green-600", text: `+${percentage}%` };
  if (percentage < 0)
    return { icon: "down", color: "text-red-600", text: `${percentage}%` };
  return { icon: "neutral", color: "text-gray-600", text: "0%" };
};

export const createConsultant = async (
  payload: CreateConsultantPayload
): Promise<CreateConsultantResponse> => {
  return postRequest<CreateConsultantResponse>("/auth/signup", payload);
};

export const getAllConsultants = async (): Promise<ConsultantsResponse> => {
  const companyId = getAuthUser()?.company?.id;
  return getRequest<ConsultantsResponse>(
    `/company/consultants/all/${companyId}`
  );
};

// Paginated consultants with configuration options
export const getConsultantsPaginated = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
}): Promise<PaginatedConsultantsResponse> => {
  const companyId = getAuthUser()?.company?.id;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.departmentId)
    queryParams.append("departmentId", params.departmentId);
  if (params?.status) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const url = `/company/consultants/all/${companyId}${
    queryString ? `?${queryString}` : ""
  }`;

  return getRequest<PaginatedConsultantsResponse>(url);
};

export const getConsultantsSummary =
  async (): Promise<DepartmentSummaryResponse> => {
    const companyId = getAuthUser()?.company?.id;
    return getRequest<DepartmentSummaryResponse>(
      `/company/consultants/summary/${companyId}`
    );
  };

export const getConsultantDashboard = async (
  consultantId: string
): Promise<ConsultantDashboardResponse> => {
  return getRequest<ConsultantDashboardResponse>(
    `/company/consultants/dashboard/${consultantId}`
  );
};

export const updateConsultantStatus = async (
  consultantId: string,
  status: "active" | "inactive" | "on-leave"
): Promise<any> => {
  const companyId = getAuthUser()?.company?.id;
  return putRequest(`/company/consultants/${companyId}/${consultantId}`, {
    status,
  });
};

// Consultant Invoice API functions
export async function fetchConsultantInvoiceSummary(): Promise<
  ConsultantInvoiceSummaryItem[]
> {
  const result: ConsultantInvoiceSummaryResponse = await getRequest(
    "/invoices/consultant/summary"
  );
  return result.data;
}

export async function fetchConsultantInvoices(
  query?: string | undefined,
  status?: "pending" | "paid" | "processing" | "all",
  startDate?: string,
  endDate?: string
): Promise<ConsultantInvoiceListItem[]> {
  let url = "/invoices/consultant/list";
  const params = new URLSearchParams();

  if (query && query?.length > 0) {
    params.append("search", query);
  }

  if (startDate && endDate) {
    params.append("startDate", startDate);
    params.append("endDate", endDate);
  }

  if (status && status.length > 0 && status !== "all") {
    params.append("status", status);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const result: ConsultantInvoiceListResponse = await getRequest(url);
  return result.data;
}

export async function fetchConsultantMonthlySummary(): Promise<
  ConsultantMonthlySummaryItem[]
> {
  const result: ConsultantMonthlySummaryResponse = await getRequest(
    "/invoices/consultant/monthly-summary"
  );
  return result.data;
}

export const getConsultantLogsByRange = async (
  consultantId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  return getRequest<any>(
    `/company/consultants/logs/${consultantId}?startDate=${startDate}&endDate=${endDate}`
  );
};
