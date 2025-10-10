"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Loader2, Paperclip, Type, ChevronRight, ChevronLeft, CheckCircle2, File, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { getProjects, type Project } from "@/services/projects"
import { getAuthUser } from "@/services/auth"
import { postRequest } from "@/services/api"
import { toast } from "sonner"
import { FileAttachment, type Attachment } from "@/components/file-attachment"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TimeLogPayload {
  duration: number
  title: string
  description: string
  status: string
  project?: string
  attachments?: string[] // base64 strings
  urls?: { url: string; name: string }[]
}

const STEPS = [
  { id: 1, title: "Basic Info", description: "Task title and project" },
  { id: 2, title: "Time & Status", description: "Duration and status" },
  { id: 3, title: "Description", description: "Detailed description" },
  { id: 4, title: "Attachments", description: "Files and links" },
  { id: 5, title: "Review", description: "Review and submit" }
]

export default function NewTimeLogPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [enableSteppers, setEnableSteppers] = useState(false)
  const [showAttachments, setShowAttachments] = useState(true)
  const [showUrls, setShowUrls] = useState(true)
  const [showProjects, setShowProjects] = useState(true)
  const [enableSaveAndAddAnother, setEnableSaveAndAddAnother] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    minutes: "",
    status: "draft",
  })

  // Load preferences and fetch projects on component mount
  useEffect(() => {
    // Load preferences from localStorage
    const savedStepperPreference = localStorage.getItem("enableTimeLogSteppers")
    if (savedStepperPreference !== null) {
      setEnableSteppers(JSON.parse(savedStepperPreference))
    }

    const savedAttachmentsPreference = localStorage.getItem("showTimeLogAttachments")
    if (savedAttachmentsPreference !== null) {
      setShowAttachments(JSON.parse(savedAttachmentsPreference))
    }

    const savedUrlsPreference = localStorage.getItem("showTimeLogUrls")
    if (savedUrlsPreference !== null) {
      setShowUrls(JSON.parse(savedUrlsPreference))
    }

    const savedProjectsPreference = localStorage.getItem("showTimeLogProjects")
    if (savedProjectsPreference !== null) {
      setShowProjects(JSON.parse(savedProjectsPreference))
    }

    const savedSaveAndAddAnotherPreference = localStorage.getItem("enableSaveAndAddAnother")
    if (savedSaveAndAddAnotherPreference !== null) {
      setEnableSaveAndAddAnother(JSON.parse(savedSaveAndAddAnotherPreference))
    }

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim().length > 0
      case 2:
        return formData.minutes.length > 0 && Number(formData.minutes) > 0
      case 3:
        return formData.description.trim().length > 0
      case 4:
        return true // Attachments are optional
      case 5:
        return true // Review step
      default:
        return false
    }
  }

  const getStepError = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) return "Task title is required"
        return null
      case 2:
        if (!formData.minutes) return "Time duration is required"
        if (Number(formData.minutes) <= 0) return "Time must be greater than 0"
        return null
      case 3:
        if (!formData.description.trim()) return "Task description is required"
        return null
      default:
        return null
    }
  }

  const validateFullForm = (): string | null => {
    if (!formData.title.trim()) return "Task title is required"
    if (!formData.minutes) return "Time duration is required"
    if (Number(formData.minutes) <= 0) return "Time must be greater than 0"
    if (!formData.description.trim()) return "Task description is required"
    return null
  }

  const handleNext = () => {
    const error = getStepError(currentStep)
    if (error) {
      toast.error(error)
      return
    }

    const effectiveStepCount = getEffectiveStepCount()
    if (currentStep < effectiveStepCount) {
      // If we're skipping attachments step, go directly to review
      if (currentStep === 3 && !showAttachments && !showUrls) {
        setCurrentStep(currentStep + 1) // This will be the review step
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      project: "",
      minutes: "",
      status: "draft",
    })
    setAttachments([])
    setCurrentStep(1)
  }

  const handleSubmit = async (action: 'create' | 'save-and-add' = 'create') => {
    // Final validation
    for (let step = 1; step <= 4; step++) {
      const error = getStepError(step)
      if (error) {
        toast.error(error)
        setCurrentStep(step)
        return
      }
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
      };

      const response = await postRequest("/consultants/time-logs", payload);
      if ((response as { status: number }).status === 201) {
        if (action === 'create') {
          toast.success("Time log created successfully!");
          router.push("/dashboard/employee");
        } else {
          toast.success("Time log saved! Form cleared for new entry.");
          resetForm();
        }
      } else {
        toast.error("Failed to create time log");
      }
    } catch (error) {
      console.error("Error creating time log:", error);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create time log. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedProject = () => {
    return projects.find(p => p.id === formData.project)
  }

  const getEffectiveSteps = () => {
    // If both attachments and URLs are disabled, skip step 4
    if (!showAttachments && !showUrls) {
      return STEPS.filter(step => step.id !== 4).map((step, index) => ({
        ...step,
        id: index + 1
      }))
    }
    return STEPS
  }

  const getEffectiveStepCount = () => {
    return getEffectiveSteps().length
  }

  const isAttachmentsStep = (step: number) => {
    const effectiveSteps = getEffectiveSteps()
    return effectiveSteps[step - 1]?.title === "Attachments"
  }

  const renderFullForm = () => {
    return (
      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-pale/50">
          <h3 className="text-lg font-semibold text-gradient">Basic Information</h3>
          <div className={`grid grid-cols-1 ${showProjects ? 'md:grid-cols-2' : ''} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            {showProjects && (
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
            )}
          </div>
        </div>

        {/* Time & Status Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-pale/50">
          <h3 className="text-lg font-semibold text-gradient">Time & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minutes">Time Duration *</Label>
              <div className="flex items-center">
                <Input
                  id="minutes"
                  type="number"
                  placeholder="0"
                  min="1"
                  step="1"
                  value={formData.minutes}
                  onChange={(e) => handleInputChange("minutes", e.target.value)}
                />
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              </div>
              {formData.minutes && Number(formData.minutes) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total: {Math.floor(Number(formData.minutes) / 60)}h {Number(formData.minutes) % 60}m
                </p>
              )}
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
              {formData.status === "draft" && (
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ Draft time logs will be automatically published by midnight
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-pale/50">
          <h3 className="text-lg font-semibold text-gradient">Description</h3>
          <div className="space-y-2">
            <Label>Task Description *</Label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Describe the task you worked on with rich formatting..."
              className="min-h-[200px]"
            />
          </div>
        </div>

        {/* Attachments Section */}
        {(showAttachments || showUrls) && (
          <div className="space-y-4 p-4 border rounded-lg bg-pale/50">
            <h3 className="text-lg font-semibold text-gradient">
              {showAttachments && showUrls ? 'Attachments (Optional)' :
                showAttachments ? 'File Attachments (Optional)' :
                  'URL Links (Optional)'}
            </h3>
            <FileAttachment
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxFiles={10}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={["image/*", "application/pdf"]}
              showUrlInput={showUrls}
              showFileInput={showAttachments}
            />
          </div>
        )}
      </div>
    )
  }

  const renderStepContent = () => {
    const effectiveSteps = getEffectiveSteps()
    const currentStepInfo = effectiveSteps[currentStep - 1]

    // Map current step to original step logic based on title
    if (currentStepInfo?.title === "Basic Info") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Task Title *</Label>
            <Input
              id="taskTitle"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>

          {showProjects && (
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
          )}
        </div>
      )
    }

    if (currentStepInfo?.title === "Time & Status") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minutes">Time Duration *</Label>
            <div className="flex items-center">
              <Input
                id="minutes"
                type="number"
                placeholder="0"
                min="1"
                step="1"
                value={formData.minutes}
                onChange={(e) => handleInputChange("minutes", e.target.value)}
                className="text-lg"
              />
              <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
            {formData.minutes && Number(formData.minutes) > 0 && (
              <p className="text-sm text-muted-foreground">
                Total: {Math.floor(Number(formData.minutes) / 60)}h {Number(formData.minutes) % 60}m
              </p>
            )}
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
            {formData.status === "draft" && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ Draft time logs will be automatically published by midnight
              </p>
            )}
          </div>
        </div>
      )
    }

    if (currentStepInfo?.title === "Description") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Task Description *</Label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Describe the task you worked on with rich formatting..."
              className="min-h-[300px]"
            />
          </div>
        </div>
      )
    }

    if (currentStepInfo?.title === "Attachments") {
      return (
        <div className="space-y-4">
          {(showAttachments || showUrls) ? (
            <FileAttachment
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxFiles={10}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={["image/*", "application/pdf"]}
              showUrlInput={showUrls}
              showFileInput={showAttachments}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Attachments and URLs are disabled in your preferences.</p>
              <p className="text-sm mt-2">You can enable them in Settings → Preferences.</p>
            </div>
          )}
        </div>
      )
    }

    if (currentStepInfo?.title === "Review") {
      const selectedProject = getSelectedProject()
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Task Title</Label>
              <p className="font-medium">{formData.title}</p>
            </div>

            {selectedProject && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Project</Label>
                <div>
                  <p className="font-medium">{selectedProject.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.department.name} • {selectedProject.lead.fullName}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Time Duration</Label>
              <p className="font-medium">
                {formData.minutes} minutes ({Math.floor(Number(formData.minutes) / 60)}h {Number(formData.minutes) % 60}m)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <p className="font-medium lowercase text-gradient w-max">{formData.status}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <div className="rounded p-3 bg-pale max-h-32 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: formData.description }} />
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Attachments</Label>
              <div className="space-y-1">
                {attachments.map((attachment, index) => (
                  <p key={index} className="text-sm p-4 bg-pale flex items-center gap-2 rounded-lg">
                    <File size={15} />
                    {attachment.name}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  const effectiveSteps = getEffectiveSteps()
  const progress = (currentStep / effectiveSteps.length) * 100

  return (
    <div className="flex flex-col gap-4">
      <Card className="max-w-4xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-6">
            <CardTitle className="text-base">New Time log</CardTitle>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newValue = !enableSteppers
                  setEnableSteppers(newValue)
                  localStorage.setItem("enableTimeLogSteppers", JSON.stringify(newValue))
                  toast.success(`Switched to ${newValue ? 'stepped' : 'full form'} interface`)
                }}
                className="text-xs"
              >
                {enableSteppers ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                {enableSteppers ? 'Steps' : 'Full Form'}
              </Button>
              {enableSteppers && (
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {effectiveSteps.length}
                </span>
              )}
            </div>
          </div>

          {/* MUI-inspired Stepper - Only show if steppers are enabled */}
          {enableSteppers && (
            <div className="w-full bg-pale rounded p-6">
              {/* Desktop stepper */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between relative">
                  {effectiveSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative">
                      {/* Connector line */}
                      {index < effectiveSteps.length - 1 && (
                        <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                          <div className={cn(
                            "h-full transition-all duration-500 ease-in-out",
                            currentStep > step.id
                              ? "bg-green-500"
                              : "bg-gray-200"
                          )} />
                        </div>
                      )}

                      {/* Step circle */}
                      <div
                        onClick={() => setCurrentStep(index + 1)}
                        className={cn(
                          "flex items-center justify-center cursor-pointer w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300 relative z-10 shadow-sm",
                          currentStep > step.id
                            ? "bg-green-500 text-white shadow-lg scale-105"
                            : currentStep === step.id
                              ? "gradient text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110"
                              : "bg-white text-gray-400 border-2 border-gray-200"
                        )}>
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>

                      {/* Step label */}
                      <div className="mt-3 text-center">
                        <div className={cn(
                          "text-sm font-medium transition-colors duration-300",
                          currentStep >= step.id
                            ? "text-gray-900"
                            : "text-gray-400"
                        )}>
                          {step.title}
                        </div>
                        <div className={cn(
                          "text-xs mt-1 transition-colors duration-300",
                          currentStep >= step.id
                            ? "text-gray-600"
                            : "text-gray-400"
                        )}>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile stepper */}
              <div className="block sm:hidden">
                <div className="flex items-center justify-between mb-4">
                  {effectiveSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300",
                        currentStep > step.id
                          ? "bg-green-500 text-white shadow-md"
                          : currentStep === step.id
                            ? "gradient text-primary-foreground shadow-md ring-2 ring-primary/30"
                            : "bg-gray-200 text-gray-500"
                      )}>
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          step.id
                        )}
                      </div>

                      {/* Connector for mobile */}
                      {index < effectiveSteps.length - 1 && (
                        <div className="flex-1 mx-2 h-0.5">
                          <div className={cn(
                            "h-full transition-all duration-500",
                            currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                          )} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Current step info for mobile */}
                <div className="text-center mt-8">
                  <div className="text-lg font-semibold text-gray-900">
                    {effectiveSteps[currentStep - 1]?.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {effectiveSteps[currentStep - 1]?.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {enableSteppers && (
            <div className="text-center pt-6 ">
              <CardDescription>
                {effectiveSteps[currentStep - 1]?.description}
              </CardDescription>
            </div>
          )}
        </CardHeader>

        <CardContent className="py-6">
          {enableSteppers ? renderStepContent() : renderFullForm()}
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          <div className="flex gap-2">
            <Button variant="outline" asChild type="button" className="bg-transparent">
              <Link href="/dashboard/employee/time-logs">Cancel</Link>
            </Button>
          </div>

          <div className="items-center flex gap-3">
            {enableSteppers ? (
              // Stepped interface navigation
              <>
                {currentStep > 1 && (
                  <Button variant="outline" className="bg-transparent" onClick={handlePrevious} type="button">
                    <ChevronLeft className=" h-4 w-4" />
                    <span className="font-normal">back</span>
                  </Button>
                )}
                {currentStep < effectiveSteps.length ? (
                  <Button
                    onClick={handleNext}
                    type="button"
                    className="gradient"
                    disabled={!validateStep(currentStep)}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSubmit('create')}
                      disabled={isSubmitting}
                      type="button"
                      className="gradient"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                    {enableSaveAndAddAnother && (
                      <Button
                        onClick={() => handleSubmit('save-and-add')}
                        disabled={isSubmitting}
                        type="button"
                        variant="outline"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save and Add Another"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Full form interface - conditional submit buttons
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const error = validateFullForm()
                    if (error) {
                      toast.error(error)
                      return
                    }
                    handleSubmit('create')
                  }}
                  disabled={isSubmitting}
                  type="button"
                  className="gradient"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                {enableSaveAndAddAnother && (
                  <Button
                    onClick={() => {
                      const error = validateFullForm()
                      if (error) {
                        toast.error(error)
                        return
                      }
                      handleSubmit('save-and-add')
                    }}
                    disabled={isSubmitting}
                    type="button"
                    variant="outline"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save and Add Another"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}