"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

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
import { updateProject, type Project } from "@/services/projects"
import { getDepartments } from "@/services/departments"
import { getAllConsultants } from "@/services/consultants"
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

interface Department {
    id: string
    name: string
    head: string
    status: string
}

interface User {
    id: string
    fullName: string
    email: string
    status: string
}

interface EditProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    project: Project | null
    onSuccess?: () => void
}

export function EditProjectDialog({ open, onOpenChange, project, onSuccess }: EditProjectDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loadingDepartments, setLoadingDepartments] = useState(false)
    const [loadingUsers, setLoadingUsers] = useState(false)

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

    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toISOString().split("T")[0]
        } catch (error) {
            return ""
        }
    }

    // Fetch departments and users when dialog opens
    useEffect(() => {
        if (open) {
            fetchDepartments()
            fetchUsers()
        }
    }, [open])

    // Update form when project data changes
    useEffect(() => {
        if (project && open) {
            form.reset({
                name: project.name,
                departmentId: project.department.id,
                leadId: project.lead.id,
                deadline: formatDateForInput(project.deadline),
            })
        }
    }, [project, open, form])

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

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const authData = getAuthData()
            if (!authData?.user?.company?.id) {
                toast.error("Company information not found. Please log in again.")
                return
            }

            const response = await getAllConsultants()
            // Handle both paginated and non-paginated responses
            if (response.data && response.data.items) {
                setUsers(response.data.items || [])
            } else {
                setUsers(response.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch users:", error)
            toast.error("Failed to load users")
        } finally {
            setLoadingUsers(false)
        }
    }

    const onSubmit = async (data: FormData) => {
        if (!project) return

        setIsSubmitting(true)
        try {
            const payload = {
                name: data.name,
                departmentId: data.departmentId,
                leadId: data.leadId,
                deadline: data.deadline,
            }

            await updateProject(project.id, payload)

            toast.success("Project updated successfully!")
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            console.error("Failed to update project:", error)
            toast.error(error.message || "Failed to update project")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!isSubmitting) {
            onOpenChange(newOpen)
        }
    }

    if (!project) return null

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="p-0 m-0 !rounded-none border-0 overflow-y-auto flex flex-col" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px' }}>
                <DialogTitle><VisuallyHidden>Edit Project</VisuallyHidden></DialogTitle>
                <div className=" z-20 px-8 py-6 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <DialogTitle className="text-2xl font-semibold">Edit Project</DialogTitle>
                        <DialogDescription>Update the project details below.</DialogDescription>
                    </div>
                    <DialogClose asChild>
                        <button
                            type="button"
                            className="ml-auto rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
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
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting || loadingUsers}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select project lead"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        <div className="flex flex-col ">
                                                            <span>{user.fullName}</span>
                                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                                        </div>
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
                                    Update Project
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
} 