"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Clock, Download, Filter, Plus, Search, Paperclip, Eye, Type, Trash, Pencil, Loader2, X, Upload, FileText, MoveRight, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { TimeLogsChart } from "@/components/time-logs-chart"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState, useMemo } from "react"
import { fetchEmployeeTimeLogs, fetchEmployeeTimeLogsWithFilters, formatDurationString, formatDate, type TimeLog } from "@/services/employee"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RichTextEditor } from "@/components/rich-text-editor"
import { FileAttachment, type Attachment } from "@/components/file-attachment"
import { useRouter } from "next/navigation"
import { getProjects } from "@/services/projects"
import { getAuthUser } from "@/services/auth"
import { putRequest } from "@/services/api"
import { Label } from "@/components/ui/label"
import TaskDetailModal from "@/components/TaskDetailModal"
import { toast } from "sonner"
import { generatePdf } from "@/utils/GeneratePDF"

export default function TimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTimeLog, setEditTimeLog] = useState<TimeLog | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTimeLogId, setDeleteTimeLogId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [summaryStats, setSummaryStats] = useState(() => {
    // initial value for summaryStats
    return {
      hoursToday: 0,
      hoursWeek: 0,
      hoursMonth: 0,
      billableHours: 0,
      billableRate: 0,
    }
  })
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishLogId, setPublishLogId] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false)
  const [isPublishingAll, setIsPublishingAll] = useState(false)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)

  // Fetch time logs with filters
  const fetchTimeLogsWithFilters = async () => {
    setIsFiltering(true)
    try {
      setError(null)
      const filters = {
        search: searchTerm,
        startDate,
        endDate,
        status: statusFilter,
        projectId: projectFilter !== "all" ? projectFilter : undefined
      }
      const data = await fetchEmployeeTimeLogsWithFilters(filters)
      setTimeLogs(data)
    } catch (err) {
      console.error("Error fetching time logs with filters:", err)
      setError("Failed to fetch time logs. Please try again.")
    } finally {
      setIsFiltering(false)
    }
  }

  // Fetch time logs when projectFilter changes
  useEffect(() => {
    if (projectFilter === "all") {
      (async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchEmployeeTimeLogs()
          setTimeLogs(data)
        } catch (err) {
          setError("Failed to load time logs. Please try again.")
        } finally {
          setLoading(false)
        }
      })()
    } else {
      (async () => {
        setLoading(true)
        setError(null)
        try {
          const filters = {
            projectId: projectFilter
          }
          const data = await fetchEmployeeTimeLogsWithFilters(filters)
          setTimeLogs(data)
        } catch (err) {
          setError("Failed to load time logs. Please try again.")
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [projectFilter])

  // Fetch time logs data
  useEffect(() => {
    const loadTimeLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchEmployeeTimeLogs()
        setTimeLogs(data)
      } catch (err) {
        console.error("Error loading time logs:", err)
        setError("Failed to load time logs. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadTimeLogs()
  }, [])

  // Apply filters function
  const handleApplyFilters = async () => {
    await fetchTimeLogsWithFilters()
  }

  // Reset filters function
  const handleResetFilters = async () => {
    setSearchTerm("")
    setStatusFilter("all")
    setProjectFilter("all")
    setStartDate("")
    setEndDate("")

    try {
      setLoading(true)
      setError(null)
      const data = await fetchEmployeeTimeLogs()
      setTimeLogs(data)
    } catch (err) {
      console.error("Error loading time logs:", err)
      setError("Failed to load time logs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchProjectsList = async () => {
      setIsLoadingProjects(true)
      try {
        const user = getAuthUser()
        if (!user?.company?.id) return
        const response = await getProjects(user.company.id)
        setProjects(response.data)
      } catch (e) {
        // handle error
      } finally {
        setIsLoadingProjects(false)
      }
    }
    fetchProjectsList()
  }, [])

  // Calculate summary statistics
  useEffect(() => {
    // recalculate summaryStats when timeLogs change
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    let hoursToday = 0
    let hoursWeek = 0
    let hoursMonth = 0
    let billableHours = 0

    timeLogs.forEach((log) => {
      const logDate = new Date(log.createdAt)
      const duration = Number.parseFloat(log.duration)

      if (logDate.toDateString() === today.toDateString()) {
        hoursToday += duration
      }
      if (logDate >= startOfWeek) {
        hoursWeek += duration
      }
      if (logDate >= startOfMonth) {
        hoursMonth += duration
      }
      if (log.status === "active") {
        billableHours += duration
      }
    })

    setSummaryStats({
      hoursToday: hoursToday / 60,
      hoursWeek: hoursWeek / 60,
      hoursMonth: hoursMonth / 60,
      billableHours: billableHours / 60,
      billableRate: hoursMonth > 0 ? (billableHours / (hoursMonth * 60)) * 100 : 0,
    })
  }, [timeLogs])

  // Get unique projects for filter - this will be populated from API
  const uniqueProjects = useMemo(() => {
    return projects && Array.isArray(projects)
      ? projects.filter((p) => p && p.id)
      : []
  }, [projects])

  // No client-side filtering needed - all filtering is now handled by the API
  const filteredTimeLogs = timeLogs

  // Generate PDF for all filtered time logs
  const generateFilteredTimeLogsPdf = async () => {
    if (filteredTimeLogs.length === 0) {
      toast.error('No time logs to generate PDF for.')
      return
    }

    setIsGeneratingPdf(true)
    try {
      const timeLogsHtml = generateTimeLogsSummaryHtml()
      await generatePdf(timeLogsHtml)
      toast.success(`Generated PDF for ${filteredTimeLogs.length} time logs!`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Generate PDF for a single time log
  const generateTimeLogPdf = async (timeLog: TimeLog) => {
    setIsGeneratingPdf(true)
    try {
      const timeLogHtml = generateTimeLogHtml(timeLog)
      await generatePdf(timeLogHtml)
      toast.success(`Time log "${timeLog.title}" generated successfully!`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Generate HTML for a single time log
  const generateTimeLogHtml = (timeLog: TimeLog) => {
    const user = getAuthUser()
    const statusColor = timeLog.status === "active"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-yellow-50 text-yellow-700 border-yellow-200"
    const statusText = timeLog.status.charAt(0).toUpperCase() + timeLog.status.slice(1)

    return `
      <div class="bg-white p-8 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="border-b-2 border-gray-300 pb-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">TIME LOG</h1>
              <p class="text-lg text-gray-600">${timeLog.title}</p>
            </div>
            <div class="text-right">
              <div class="inline-block px-4 py-2 rounded-full text-sm font-medium border ${statusColor}">
                ${statusText}
              </div>
            </div>
          </div>
        </div>

        <!-- Company Info -->
        <div class="bg-primary text-white p-6 rounded-lg mb-6">
          <h2 class="text-xl font-bold mb-1">${user?.company?.name || 'Company Name'}</h2>
          <p class="text-blue-100 text-sm">${user?.company?.sector || 'Sector'}</p>
        </div>

        <!-- Time Log Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Time Log Details
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Date:</span>
                <span class="font-medium">${formatDate(timeLog.createdAt)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-medium">${formatDurationString(timeLog.duration)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Project:</span>
                <span class="font-medium">${timeLog.project}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium">${statusText}</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Employee Information
            </h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="font-semibold text-gray-900">${user?.fullName || 'Employee Name'}</span>
                <p class="text-gray-600 capitalize">${user?.jobTitle || 'Employee'}</p>
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>${user?.email || 'email@example.com'}</span>
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>${user?.phoneNumber || 'Phone Number'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Description -->
        <div class="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Task Description</h3>
          <div class="text-gray-700 prose prose-sm max-w-none">
            ${timeLog.description.replace(/<[^>]*>/g, '')}
          </div>
        </div>

        <!-- Time Summary -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Time Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-3 rounded border">
              <div class="text-sm text-gray-600">Duration</div>
              <div class="text-lg font-bold text-gray-900">${formatDurationString(timeLog.duration)}</div>
            </div>
            <div class="bg-white p-3 rounded border">
              <div class="text-sm text-gray-600">Project</div>
              <div class="text-lg font-bold text-gray-900">${timeLog.project}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-gray-500 text-xs border-t pt-4">
          <p>This time log was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p class="mt-1">For any questions, please contact ${user?.email || 'support@company.com'}</p>
        </div>
      </div>
    `
  }

  // Generate HTML for time logs summary
  const generateTimeLogsSummaryHtml = () => {
    const user = getAuthUser()
    const totalDuration = filteredTimeLogs.reduce((sum, log) => sum + Number(log.duration), 0)
    const activeLogs = filteredTimeLogs.filter(log => log.status === 'active')
    const draftLogs = filteredTimeLogs.filter(log => log.status === 'draft')
    const uniqueProjects = [...new Set(filteredTimeLogs.map(log => log.project))]

    return `
      <div class="bg-white p-8 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="border-b-2 border-gray-300 pb-6 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">TIME LOGS SUMMARY</h1>
              <p class="text-lg text-gray-600">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">
                <p>Total Time Logs: ${filteredTimeLogs.length}</p>
                <p>Total Duration: ${formatDurationString(String(totalDuration))}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Info -->
        <div class="bg-primary text-white p-6 rounded-lg mb-6">
          <h2 class="text-xl font-bold mb-1">${user?.company?.name || 'Company Name'}</h2>
          <p class="text-blue-100 text-sm">${user?.company?.sector || 'Sector'}</p>
        </div>

        <!-- Employee Info -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Employee Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Name:</span>
              <p class="font-medium">${user?.fullName || 'Employee Name'}</p>
            </div>
            <div>
              <span class="text-gray-600">Email:</span>
              <p class="font-medium">${user?.email || 'email@example.com'}</p>
            </div>
            <div>
              <span class="text-gray-600">Phone:</span>
              <p class="font-medium">${user?.phoneNumber || 'Phone Number'}</p>
            </div>
            <div>
              <span class="text-gray-600">Position:</span>
              <p class="font-medium capitalize">${user?.jobTitle || 'Employee'}</p>
            </div>
          </div>
        </div>

       

        <!-- Time Logs Table -->
        <div class="bg-white border border-gray-200 rounded-lg mb-6">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">Time Log Details</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Task Title</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900">Project</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Duration</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${filteredTimeLogs.map(log => `
                  <tr>
                    <td class="px-4 py-3 text-gray-900">
                      ${formatDate(log.createdAt)}
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-medium text-gray-900">${log.title}</span>
                      <p class="text-xs text-gray-500 mt-1">
                        ${log.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                        ${log.description.length > 100 ? '...' : ''}
                      </p>
                    </td>
                    <td class="px-4 py-3 text-gray-900">
                      ${log.project}
                    </td>
                    <td class="px-4 py-3 text-center text-gray-900">
                      ${formatDurationString(log.duration)}
                    </td>
                    <td class="">
                        ${log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

       

        <!-- Footer -->
        <div class="text-center text-gray-500 text-xs border-t pt-4">
          <p>This summary was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    `
  }

  const handleViewDetails = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog)
    setIsDetailDialogOpen(true)
  }

  // Convert API attachments to component format
  const getAttachmentsFromTimeLog = (timeLog: TimeLog): Attachment[] => {
    if (!timeLog.attachments || timeLog.attachments.length === 0) {
      return []
    }

    return timeLog.attachments.map((attachment, index) => ({
      id: `attachment-${index}`,
      name: attachment.name,
      type: 'file' as const,
      url: attachment.url,
      size: 0, // Size not provided by API
    }))
  }

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    duration: "",
    status: "active",
    project: ""
  })
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([])
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  useEffect(() => {
    if (editTimeLog) {
      setEditForm({
        title: editTimeLog.title,
        description: editTimeLog.description,
        duration: editTimeLog.duration,
        status: editTimeLog.status,
        project: editTimeLog.projectId || ""
      })
      // Load real attachments if available
      if (editTimeLog.attachments && editTimeLog.attachments.length > 0) {
        const existingAttachments: Attachment[] = editTimeLog.attachments.map((attachment, index) => ({
          id: `existing-${index}`,
          name: attachment.name,
          type: 'file' as const,
          url: attachment.url,
          size: 0, // Size not provided by API
        }))
        setEditAttachments(existingAttachments)
      } else {
        setEditAttachments([])
      }
    }
  }, [editTimeLog])

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTimeLog) return
    // Validation (same as add form)
    if (!editForm.title.trim()) {
      toast.error("Please enter a task title")
      return
    }
    if (!editForm.description.trim()) {
      toast.error("Please enter a task description")
      return
    }
    if (!editForm.duration || Number(editForm.duration) <= 0) {
      toast.error("Please enter valid time in minutes")
      return
    }
    setIsEditSubmitting(true)
    try {
      // Separate new file attachments and existing attachments
      const newFileAttachments = editAttachments.filter(a => a.type === "file" && a.file) as (Attachment & { file: File })[]
      const existingAttachments = editAttachments.filter(a => a.type === "file" && a.url && !a.file)
      const urlAttachments = editAttachments.filter(a => a.type === "url" && a.url).map(a => ({ url: a.url!, name: a.name }))

      // Convert new files to base64
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const match = result.match(/^data:([^;]+);base64,(.*)$/);
            if (match) {
              const mimetype = match[1];
              const data = match[2];
              resolve(`data:${mimetype};name=${file.name};base64,${data}`);
            } else {
              reject(new Error("Invalid base64 format"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const newAttachmentsBase64 = await Promise.all(newFileAttachments.map(a => toBase64(a.file)));

      // Combine existing and new attachments
      const allAttachments = [
        ...existingAttachments.map(a => ({ url: a.url!, name: a.name })),
        ...newAttachmentsBase64.map(base64 => ({ url: base64, name: 'new-file' }))
      ];

      await putRequest(`/consultants/time-logs/${editTimeLog.id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        duration: Number(editForm.duration),
        status: editForm.status,
        project: editForm.project,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
        urls: urlAttachments.length > 0 ? urlAttachments : undefined,
      })
      toast.success("Time log updated successfully!")
      setLoading(true)
      const data = await fetchEmployeeTimeLogs()
      setTimeLogs(data)
      setIsEditDialogOpen(false)
      setEditTimeLog(null)
    } catch (err) {
      toast.error((err as Error)?.message || "Failed to update time log")
    } finally {
      setIsEditSubmitting(false)
      setLoading(false)
    }
  }

  // Add publish single draft handler
  const handlePublishDraft = async (logId: string) => {
    setIsPublishing(true)
    try {
      await putRequest(`/consultants/time-logs/${logId}`, { status: 'active' })
      toast.success('Draft published successfully!')
      setLoading(true)
      const data = await fetchEmployeeTimeLogs()
      setTimeLogs(data)
      setPublishDialogOpen(false)
      setPublishLogId(null)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to publish draft')
    } finally {
      setIsPublishing(false)
      setLoading(false)
    }
  }

  // Add publish all drafts handler
  const handlePublishAllDrafts = async () => {
    setIsPublishingAll(true)
    try {
      const draftLogs = timeLogs.filter(log => log.status === 'draft')
      await Promise.all(draftLogs.map(log => putRequest(`/consultants/time-logs/${log.id}`, { status: 'active' })))
      toast.success('All drafts published successfully!')
      setLoading(true)
      const data = await fetchEmployeeTimeLogs()
      setTimeLogs(data)
      setPublishAllDialogOpen(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to publish all drafts')
    } finally {
      setIsPublishingAll(false)
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Time Logs</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex  bg-paper p-4 rounded-lg items-center justify-between">

        <div className="p-2  bg-pale gap-3 md:min-w-[20vw] rounded flex items-center ">
          <div />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyFilters()
              }
            }}
            placeholder="Search for your tasks..." type="text" className="bg-none bg-transparent flex-1 text-sm outline-none border-none" />
          <Button className=" bg-gray-900 hover:bg-gray-600" onClick={handleApplyFilters}>
            {isFiltering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="sr-only md:not-sr-only md:ml-2">Filtering...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />

              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="gradient">
            <Link href="/dashboard/employee/time-logs/new">
              <Plus className="h-4 w-4" /> Log Time
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">{summaryStats.hoursToday.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  of 8 hours ({Math.round((summaryStats.hoursToday / 8) * 100)}%)
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">{summaryStats.hoursWeek.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  of 40 hours ({Math.round((summaryStats.hoursWeek / 40) * 100)}%)
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal ">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">{summaryStats.hoursMonth.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  of 160 hours ({Math.round((summaryStats.hoursMonth / 160) * 100)}%)
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">Billable Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">{summaryStats.billableHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">{Math.round(summaryStats.billableRate)}% billable rate</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Row */}

      {/* <div className="flex items-center gap-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search logs..."
              className="h-9 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters()
                }
              }}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-6 p-0"
                onClick={() => setSearchTerm("")}
                disabled={isFiltering}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 lg:px-3"
            onClick={handleApplyFilters}
            disabled={isFiltering}
          >
            {isFiltering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="sr-only md:not-sr-only md:ml-2">Filtering...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Search</span>
              </>
            )}
          </Button>
        </div>
      </div> */}

      {/* Filters Row */}
      <div className=" max-w-[92vw]  bg-paper p-4 rounded flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-row items-center rounded bg-pale overflow-auto p-4 gap-2">
          <div className="flex items-center gap-2">

            <Input
              id="start-date"
              type="date"
              className="h-9 min-w-max bg-transparent"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />

            <div className="flex items-center">
              <MoveRight size={15} className="opacity-40" />
            </div>

            <Input
              id="end-date"
              type="date"
              className="h-9 w-min-max bg-transparent"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />

            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-transparent"
              onClick={handleApplyFilters}
              disabled={isFiltering}
            >
              {isFiltering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </>
              )}
            </Button>
          </div>

        </div>
        <div className="flex items-center bg-pale p-4 rounded gap-2">

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {uniqueProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div>
                    <div className="font-semibold">{project.name}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 bg-transparent"
            onClick={handleResetFilters}
            disabled={isFiltering}
          >
            <RefreshCcw />
            Reset
          </Button>
        </div>
      </div>

      <Card >
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-primary justify-between">
            <span className="text-gradient">
              Time Logs
            </span>

            <span className="flex items-center space-x-3">
              <Button

                size="sm"
                className="h-9 gradient"
                onClick={generateFilteredTimeLogsPdf}
                disabled={isGeneratingPdf || filteredTimeLogs.length === 0}
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Export ({filteredTimeLogs.length})
                  </>
                )}
              </Button>
              {timeLogs.some(log => log.status === 'draft') && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setPublishAllDialogOpen(true)}
                  disabled={isPublishingAll || loading}
                  className="flex items-center gap-2"
                >
                  {isPublishingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Publish All Drafts
                </Button>
              )}
            </span>
          </CardTitle>
          <CardDescription>
            {searchTerm || statusFilter !== 'all' || projectFilter !== 'all' || startDate || endDate ? (
              <>
                Showing {filteredTimeLogs.length} filtered time logs
                {searchTerm && ` for "${searchTerm}"`}
                {(startDate || endDate) && ` (${startDate || 'any'} to ${endDate || 'any'})`}
              </>
            ) : (
              <>
                Showing {filteredTimeLogs.length} time logs
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className=" overflow-auto max-w-[90vw]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-stretch space-x-4">

                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px] flex-1" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />

                </div>
              ))}
            </div>
          ) : filteredTimeLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {timeLogs.length === 0
                  ? "No time logs found. Start logging your time!"
                  : "No time logs match your current filters."}
              </p>
            </div>
          ) : (
            <Table className="">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeLogs.map((log) => {
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell className="">
                        <div>
                          <div className="">{log.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {log.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                            {log.description.length > 100 && '...'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="min-w-max">{log.project}</Badge>
                      </TableCell>
                      <TableCell>{formatDurationString(log.duration)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                          }
                        >
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end">
                        <Button
                          variant="ghost"
                          className="hover:bg-gray-200/50"

                          size="icon"
                          onClick={() => handleViewDetails(log)}
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {log.status === "draft" && (
                          <>
                            <Button
                              className="hover:bg-gray-200/50"
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditTimeLog(log); setIsEditDialogOpen(true); }}
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => { setDeleteDialogOpen(true); setDeleteTimeLogId(log.id); }}
                              aria-label="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-gray-200/50"

                              onClick={() => { setPublishDialogOpen(true); setPublishLogId(log.id); }}
                              aria-label="Publish"
                              disabled={isPublishing || loading}
                            >
                              {isPublishing && publishLogId === log.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Time Log Details Dialog */}
      <TaskDetailModal
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        task={selectedTimeLog}
        attachments={selectedTimeLog ? getAttachmentsFromTimeLog(selectedTimeLog) : []}
        urls={[]}
      />



      {/* Edit Time Log Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className=" backdrop-blur-sm">
            <div className="flex items-center  justify-between">
              <DialogTitle className="text-xl text-gradient">Edit Time Log</DialogTitle>
              <Button type="button" variant="ghost" className="hover:bg-gray-100" onClick={() => setIsEditDialogOpen(false)} aria-label="Close">
                <X className="h-10 w-10" />
              </Button>
            </div>
            <DialogDescription>Update your time log entry</DialogDescription>

          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Task Title *</Label>
              <Input
                id="editTitle"
                value={editForm.title}
                onChange={e => handleEditInputChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editProject">Project (optional)</Label>
              <Select
                value={editForm.project}
                onValueChange={value => handleEditInputChange("project", value)}
                disabled={isLoadingProjects}
              >
                <SelectTrigger id="editProject">
                  <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading" disabled>
                      Loading projects...
                    </SelectItem>
                  ) : projects.length === 0 ? (
                    <SelectItem value="no-projects" disabled>
                      No projects available
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div>
                          <div className="font-semibold">{project.name}</div>

                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDuration">Time (minutes) *</Label>
              <div className="flex items-center">
                <Input
                  id="editDuration"
                  type="number"
                  min={1}
                  value={editForm.duration}
                  onChange={e => handleEditInputChange("duration", e.target.value)}
                  required
                />
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {editForm.duration && Number(editForm.duration) > 0 && `${Math.floor(Number(editForm.duration) / 60)}h ${Number(editForm.duration) % 60}m`}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={value => handleEditInputChange("status", value)}
              >
                <SelectTrigger id="editStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Task Description *</Label>
              <RichTextEditor
                value={editForm.description}
                onChange={val => handleEditInputChange("description", val)}
                placeholder="Describe the task you worked on with rich formatting..."
                className="min-h-[200px]"
              />
            </div>
            <FileAttachment
              attachments={editAttachments}
              onAttachmentsChange={setEditAttachments}
              maxFiles={10}
              maxSize={10 * 1024 * 1024}

              acceptedFileTypes={["image/*", "application/pdf"]}
              showUrlInput={true}
            />
            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isEditSubmitting || isLoadingProjects}>
                {isEditSubmitting ? (
                  <>
                    <Loader2 className=" h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Time Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time log? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTimeLogId) return
                setIsDeleting(true)
                try {
                  const { deleteRequest } = await import("@/services/api")
                  await deleteRequest(`/consultants/time-logs/${deleteTimeLogId}`)
                  toast.success("Time log deleted successfully")
                  // Refresh time logs
                  const data = await fetchEmployeeTimeLogs()
                  setTimeLogs(data)
                  setDeleteDialogOpen(false)
                  setDeleteTimeLogId(null)
                } catch (err: any) {
                  toast.error(err?.message || "Failed to delete time log")
                } finally {
                  setIsDeleting(false)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Draft Confirmation Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish this draft? This will make the time log active.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => publishLogId && handlePublishDraft(publishLogId)}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish All Drafts Confirmation Dialog */}
      <Dialog open={publishAllDialogOpen} onOpenChange={setPublishAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish All Drafts</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish all draft time logs? This will make all drafts active.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPublishAllDialogOpen(false)}
              disabled={isPublishingAll}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handlePublishAllDrafts}
              disabled={isPublishingAll}
            >
              {isPublishingAll ? 'Publishing...' : 'Publish All'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
