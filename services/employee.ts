import { getRequest } from "./api";

// Types for Employee Dashboard API Response
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

export interface EmployeeDashboardData {
  hoursToday: HoursData;
  hoursWeek: HoursData;
  hoursMonth: HoursData;
  weekDistribution: WeekDistribution[];
  recentLogs: RecentLog[];
}

export interface EmployeeDashboardResponse {
  status: number;
  message: string;
  data: EmployeeDashboardData;
}

// Types for Time Logs API Response
export interface TimeLogUser {
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
  profileImage: string | null;
  resetToken: string | null;
  resetTokenExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  duration: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: TimeLogUser;
  project: string;
}

export interface TimeLogsResponse {
  status: number;
  message: string;
  data: TimeLog[];
}

// Types for Task Completion API Response
export interface CompletionData {
  count: number;
  change: number;
}

export interface CompletionRateData {
  rate: number;
  change: number;
}

export interface TaskCompletionData {
  completedToday: CompletionData;
  completedThisWeek: CompletionData;
  completedThisMonth: CompletionData;
  completionRate: CompletionRateData;
}

export interface TaskCompletionResponse {
  status: number;
  message: string;
  data: TaskCompletionData;
}

// Types for Completion Trends API Response
export interface CompletionTrend {
  week: number;
  completedTasks: number;
  startDate: string;
  endDate: string;
}

export interface CompletionTrendsResponse {
  status: number;
  message: string;
  data: CompletionTrend[];
}

export interface InvoiceSummaryData {
  currentMonth: {
    amount: number;
    hours: number;
  };
  lastMonth: {
    amount: number;
    hours: number;
  };
  yearToDate: {
    amount: number;
    invoiceCount: number;
  };
  hourlyRate?: number;
}

export interface InvoiceSummaryResponse {
  status: number;
  message: string;
  data: InvoiceSummaryData;
}

export interface MonthlySalaryData {
  month: string;
  amount: number;
}

export interface MonthlySalaryResponse {
  status: number;
  message: string;
  data: MonthlySalaryData[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  duration: number;
  unproductiveDays: number;
  dueDate: string;
  description: string;
  comment: string | null;
  date: string;
  isSatisfied: boolean;
  status: "processing" | "pending" | "paid";
  processedAt: string;
  paidAt: string | null;
  reviewerId: string | null;
  approverId: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer: null | {
    id: string;
    name: string;
  };
  approver: null | {
    id: string;
    name: string;
  };
}

export interface InvoicesResponse {
  status: number;
  message: string;
  data: Invoice[];
}

// Fetch employee dashboard data
export async function fetchEmployeeDashboard(): Promise<EmployeeDashboardData> {
  try {
    const result: EmployeeDashboardResponse = await getRequest(
      "/consultants/dashboard"
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching employee dashboard data:", error);
    throw error;
  }
}

// Fetch employee time logs
export async function fetchEmployeeTimeLogs(): Promise<TimeLog[]> {
  try {
    const result: TimeLogsResponse = await getRequest(
      "/consultants/time-logs/"
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching employee time logs:", error);
    throw error;
  }
}

// Fetch employee time logs with search
export async function fetchEmployeeTimeLogsWithSearch(
  query?: string
): Promise<TimeLog[]> {
  try {
    let url = "/consultants/time-logs/";
    if (query && query.trim()) {
      url += `?search=${encodeURIComponent(query.trim())}`;
    }
    const result: TimeLogsResponse = await getRequest(url);
    return result.data;
  } catch (error) {
    console.error("Error fetching employee time logs with search:", error);
    throw error;
  }
}

// Fetch employee time logs with filters
export async function fetchEmployeeTimeLogsWithFilters(filters: {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  project?: string;
}): Promise<TimeLog[]> {
  try {
    let url = "/consultants/time-logs/";
    const params = new URLSearchParams();

    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params.append("endDate", filters.endDate);
    }
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters.project && filters.project !== "all") {
      params.append("project", filters.project);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const result: TimeLogsResponse = await getRequest(url);
    return result.data;
  } catch (error) {
    console.error("Error fetching employee time logs with filters:", error);
    throw error;
  }
}

// Fetch employee time logs by date range
export async function fetchEmployeeTimeLogsByRange(
  startDate: string,
  endDate: string
): Promise<TimeLog[]> {
  try {
    const result: TimeLogsResponse = await getRequest(
      `/consultants/time-logs/range?startDate=${startDate}&endDate=${endDate}`
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching employee time logs by range:", error);
    throw error;
  }
}

// Fetch employee task completion data
export async function fetchTaskCompletionData(): Promise<TaskCompletionData> {
  try {
    const result: TaskCompletionResponse = await getRequest(
      "/consultants/dashboard/task-completion"
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching task completion data:", error);
    throw error;
  }
}

// Fetch completion trends data
export async function fetchCompletionTrends(): Promise<CompletionTrend[]> {
  try {
    const result: CompletionTrendsResponse = await getRequest(
      "/consultants/dashboard/completion-trends"
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching completion trends data:", error);
    throw error;
  }
}

// Fetch invoice summary data
export async function fetchInvoiceSummary(): Promise<InvoiceSummaryData> {
  try {
    const result: InvoiceSummaryResponse = await getRequest(
      "/invoices/summary"
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching invoice summary data:", error);
    throw error;
  }
}

// Fetch monthly salary data
export async function fetchMonthlySalary(): Promise<MonthlySalaryData[]> {
  try {
    const result: MonthlySalaryResponse = await getRequest(
      "/invoices/monthly-salary"
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching monthly salary data:", error);
    throw error;
  }
}

// Fetch invoices list
export async function fetchInvoices(
  startDate?: string,
  endDate?: string
): Promise<Invoice[]> {
  try {
    let url = "/invoices";
    if (startDate && endDate) {
      url = `/invoices/search?startDate=${startDate}&endDate=${endDate}`;
    }
    const result: any = await getRequest(url);
    // Support both { data: [...] } and { data: { invoices: [...] } }
    if (result && result.data) {
      if (Array.isArray(result.data)) {
        return result.data;
      } else if (Array.isArray(result.data.invoices)) {
        return result.data.invoices;
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

// Fetch a single invoice by id
export async function fetchInvoiceById(id: string): Promise<any | null> {
  try {
    const result: any = await getRequest(`/invoices/${id}`);
    if (result && result.data) {
      // If data is the invoice object
      if (result.data.id) {
        return result.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching invoice by id:", error);
    return null;
  }
}

// Helper function to format minutes to hours and minutes
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}

// Helper function to format duration from string (minutes) to readable format
export function formatDurationString(durationStr: string): string {
  const minutes = Number.parseFloat(durationStr);
  return formatMinutesToHours(minutes);
}

// Helper function to get day name from day number (0 = Sunday, 1 = Monday, etc.)
export function getDayName(dayNumber: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayNumber] || "Unknown";
}

// Helper function to format hours count
export function formatHoursCount(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(1);
}

// Helper function to format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper function to format date and time for display
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to get trend indicator (positive, negative, or neutral)
export function getTrendIndicator(
  change: number
): "positive" | "negative" | "neutral" {
  if (change > 0) return "positive";
  if (change < 0) return "negative";
  return "neutral";
}

// Helper function to format week label for chart
export function formatWeekLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`;
  } else {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
  }
}

// Helper function to get default date range (30 days)
export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

// Helper function to format date for API (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}
