"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Loader2, Paperclip, Type } from "lucide-react"
import Link from "next/link"
import { getProjects, type Project } from "@/services/projects"
import { getAuthUser } from "@/services/auth"
import { postRequest } from "@/services/api"
import { toast } from "sonner"
import { FileAttachment, type Attachment } from "@/components/file-attachment"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimeLogPayload {
  duration: number
  title: string
  description: string
  status: string
  project?: string
  attachments?: string[] // base64 strings
  urls?: { url: string; name: string }[]
}

export default function NewTimeLogPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    minutes: "",
    status: "active",
  })

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = getAuthUser()
        if (!user?.company?.id) {
          toast.error("Company information not found")
          return
        }

        const response = await getProjects(user.company.id)
        setProjects(response.data)
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast.error("Failed to load projects")
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a task title")
      return
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a task description")
      return
    }

    if (!formData.minutes || Number(formData.minutes) <= 0) {
      toast.error("Please enter valid time in minutes")
      return
    }

    setIsSubmitting(true)

    try {
      // Separate file and url attachments
      const fileAttachments = attachments.filter(a => a.type === "file" && a.file) as (Attachment & { file: File })[]
      const urlAttachments = attachments.filter(a => a.type === "url" && a.url).map(a => ({ url: a.url!, name: a.name }))

      // Convert files to base64
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // result: data:[mimetype];base64,[data]
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
      const attachmentsBase64 = await Promise.all(fileAttachments.map(a => toBase64(a.file)));

      const payload: TimeLogPayload = {
        duration: Number(formData.minutes),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        ...(formData.project ? { project: formData.project } : {}),
        attachments: attachmentsBase64.length > 0 ? attachmentsBase64 : undefined,
        urls: urlAttachments.length > 0 ? urlAttachments : undefined,
      }
      console.log("payload", payload)
      const response = await postRequest("/consultants/time-logs", payload)
      if (response.status === 201) {
        toast.success("Time log created successfully!")
        router.push("/dashboard/employee")
      } else {
        toast.error("Failed to create time log")
      }
    } catch (error) {
      console.error("Error creating time log:", error)
      if (error instanceof Error && error.message) {
        toast.error(error.message)
      } else {
        toast.error("Failed to create time log. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Log Time</h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>New Time Entry</CardTitle>
          <CardDescription>Log your time for a specific task with rich descriptions and attachments</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project (optional)</Label>
              <Select
                value={formData.project}
                onValueChange={(value) => handleInputChange("project", value)}
                disabled={isLoadingProjects}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading projects...
                      </div>
                    </SelectItem>
                  ) : projects.length === 0 ? (
                    <SelectItem value="no-projects" disabled>
                      No projects available
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {project.department.name} • {project.lead.fullName}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes">Time (minutes) *</Label>
              <div className="flex items-center">
                <Input
                  id="minutes"
                  type="number"
                  placeholder="0"
                  min="1"
                  step="1"
                  value={formData.minutes}
                  onChange={(e) => handleInputChange("minutes", e.target.value)}
                  required
                />
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.minutes &&
                  Number(formData.minutes) > 0 &&
                  `${Math.floor(Number(formData.minutes) / 60)}h ${Number(formData.minutes) % 60}m`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Task Description *</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Describe the task you worked on with rich formatting..."
                className="min-h-[200px]"
              />
            </div>

            <FileAttachment
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxFiles={10}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={["image/*", "application/pdf"]}
              showUrlInput={true}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild type="button">
              <Link href="/dashboard/employee/time-logs">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingProjects}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Time Entry"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
