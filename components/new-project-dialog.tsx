"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createProject } from "@/services/projects"
import { getDepartments, type Department } from "@/services/departments"
import { ConsultantSearchableSelect } from "@/components/ui/consultant-searchable-select"
import { getAuthData } from "@/services/auth"

const formSchema = z.object({
  name: z.string().min(1, "Project name is required").min(3, "Project name must be at least 3 characters"),
  departmentId: z.string().min(1, "Department is required"),
  leadId: z.string().min(1, "Project lead is required"),
  deadline: z
    .string()
    .min(1, "Deadline is required")
    .refine((dateString) => {
      const selectedDate = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, "Deadline must be today or in the future"),
})

type FormData = z.infer<typeof formSchema>

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NewProjectDialog({ open, onOpenChange, onSuccess }: NewProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      departmentId: "",
      leadId: "",
      deadline: "",
    },
  })

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Fetch departments when dialog opens
  useEffect(() => {
    if (open) {
      fetchDepartments()
    }
  }, [open])

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const authData = getAuthData()
      if (!authData?.user?.company?.id) {
        toast.error("Company information not found. Please log in again.")
        return
      }

      const response = await getDepartments(authData.user.company.id)
      setDepartments(response.data || [])
    } catch (error) {
      console.error("Failed to fetch departments:", error)
      toast.error("Failed to load departments")
    } finally {
      setLoadingDepartments(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const authData = getAuthData()
      if (!authData?.user?.company?.id) {
        toast.error("Company information not found. Please log in again.")
        return
      }

      const payload = {
        name: data.name,
        departmentId: data.departmentId,
        leadId: data.leadId,
        deadline: data.deadline, // Already in YYYY-MM-DD format
      }

      await createProject(payload)

      toast.success("Project created successfully!")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to create project:", error)
      toast.error(error.message || "Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        form.reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Fill in the details below to create a new project for your company.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || loadingDepartments}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={loadingDepartments ? "Loading departments..." : "Select department"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Lead</FormLabel>
                  <FormControl>
                    <ConsultantSearchableSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Search and select project lead"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" min={getTodayDate()} {...field} disabled={isSubmitting} className="!w-max" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
