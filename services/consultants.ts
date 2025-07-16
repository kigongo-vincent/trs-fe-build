import { postRequest, getRequest, putRequest } from "./api";

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

export const getAllConsultants = async (
  companyId: string
): Promise<ConsultantsResponse> => {
  return getRequest<ConsultantsResponse>(
    `/company/consultants/all/${companyId}`
  );
};

export const getConsultantsSummary = async (
  companyId: string
): Promise<DepartmentSummaryResponse> => {
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
  companyId: string,
  consultantId: string,
  status: "active" | "inactive" | "on-leave"
): Promise<any> => {
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

export async function fetchConsultantInvoices(): Promise<
  ConsultantInvoiceListItem[]
> {
  const result: ConsultantInvoiceListResponse = await getRequest(
    "/invoices/consultant/list"
  );
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
