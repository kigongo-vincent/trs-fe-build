import { getRequest } from "./api"

// Types for Employee Dashboard API Response
export interface HoursData {
  count: number
  percentage: number
}

export interface WeekDistribution {
  day: number
  hours: number
}

export interface RecentLog {
  date: string
  title: string
  project: string
  minutes: number
  status: string
  id: string
}

export interface EmployeeDashboardData {
  hoursToday: HoursData
  hoursWeek: HoursData
  hoursMonth: HoursData
  weekDistribution: WeekDistribution[]
  recentLogs: RecentLog[]
}

export interface EmployeeDashboardResponse {
  status: number
  message: string
  data: EmployeeDashboardData
}

// Types for Time Logs API Response
export interface TimeLogUser {
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

export interface TimeLog {
  id: string
  duration: string
  title: string
  description: string
  status: string
  projectId: string
  createdAt: string
  updatedAt: string
  userId: string
  user: TimeLogUser
  project: string
}

export interface TimeLogsResponse {
  status: number
  message: string
  data: TimeLog[]
}

// Types for Task Completion API Response
export interface CompletionData {
  count: number
  change: number
}

export interface CompletionRateData {
  rate: number
  change: number
}

export interface TaskCompletionData {
  completedToday: CompletionData
  completedThisWeek: CompletionData
  completedThisMonth: CompletionData
  completionRate: CompletionRateData
}

export interface TaskCompletionResponse {
  status: number
  message: string
  data: TaskCompletionData
}

// Types for Completion Trends API Response
export interface CompletionTrend {
  week: number
  completedTasks: number
  startDate: string
  endDate: string
}

export interface CompletionTrendsResponse {
  status: number
  message: string
  data: CompletionTrend[]
}

// Fetch employee dashboard data
export async function fetchEmployeeDashboard(): Promise<EmployeeDashboardData> {
  try {
    const result: EmployeeDashboardResponse = await getRequest("/consultants/dashboard")
    return result.data
  } catch (error) {
    console.error("Error fetching employee dashboard data:", error)
    throw error
  }
}

// Fetch employee time logs
export async function fetchEmployeeTimeLogs(): Promise<TimeLog[]> {
  try {
    const result: TimeLogsResponse = await getRequest("/consultants/time-logs/")
    return result.data
  } catch (error) {
    console.error("Error fetching employee time logs:", error)
    throw error
  }
}

// Fetch employee time logs by date range
export async function fetchEmployeeTimeLogsByRange(startDate: string, endDate: string): Promise<TimeLog[]> {
  try {
    const result: TimeLogsResponse = await getRequest(
      `/consultants/time-logs/range?startDate=${startDate}&endDate=${endDate}`,
    )
    return result.data
  } catch (error) {
    console.error("Error fetching employee time logs by range:", error)
    throw error
  }
}

// Fetch employee task completion data
export async function fetchTaskCompletionData(): Promise<TaskCompletionData> {
  try {
    const result: TaskCompletionResponse = await getRequest("/consultants/dashboard/task-completion")
    return result.data
  } catch (error) {
    console.error("Error fetching task completion data:", error)
    throw error
  }
}

// Fetch completion trends data
export async function fetchCompletionTrends(): Promise<CompletionTrend[]> {
  try {
    const result: CompletionTrendsResponse = await getRequest("/consultants/dashboard/completion-trends")
    return result.data
  } catch (error) {
    console.error("Error fetching completion trends data:", error)
    throw error
  }
}

// Helper function to format minutes to hours and minutes
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}m`
  } else if (remainingMinutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${remainingMinutes}m`
  }
}

// Helper function to format duration from string (minutes) to readable format
export function formatDurationString(durationStr: string): string {
  const minutes = Number.parseFloat(durationStr)
  return formatMinutesToHours(minutes)
}

// Helper function to get day name from day number (0 = Sunday, 1 = Monday, etc.)
export function getDayName(dayNumber: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[dayNumber] || "Unknown"
}

// Helper function to format hours count
export function formatHoursCount(minutes: number): string {
  const hours = minutes / 60
  return hours.toFixed(1)
}

// Helper function to format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Helper function to format date and time for display
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper function to get trend indicator (positive, negative, or neutral)
export function getTrendIndicator(change: number): "positive" | "negative" | "neutral" {
  if (change > 0) return "positive"
  if (change < 0) return "negative"
  return "neutral"
}

// Helper function to format week label for chart
export function formatWeekLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startMonth = start.toLocaleDateString("en-US", { month: "short" })
  const endMonth = end.toLocaleDateString("en-US", { month: "short" })

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`
  } else {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
  }
}

// Helper function to get default date range (30 days)
export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  }
}

// Helper function to format date for API (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0]
}
