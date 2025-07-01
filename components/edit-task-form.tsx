import React, { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateTask } from "@/services/tasks"
import { RichTextEditor } from "@/components/rich-text-editor"
import { FileAttachment, Attachment } from "@/components/file-attachment"
import { getDepartments } from "@/services/departments"
import { getAuthData } from "@/services/auth"
import { toast } from "sonner"

interface TaskUrl {
    name: string;
    url: string;
}

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    duration: z.string().min(1, "Duration is required"),
    status: z.string().min(1, "Status is required"),
    projectId: z.string().min(1, "Project is required"),
    departmentId: z.string().min(1, "Department is required"),
    attachments: z.array(z.any()).optional(),
    urls: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditTaskFormProps {
    task: any
    onClose: () => void
    onUpdated: () => void
    projects: { id: string; name: string }[]
}

export const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onClose, onUpdated, projects }) => {
    const [submitting, setSubmitting] = useState(false)
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
    const [attachments, setAttachments] = useState<Attachment[]>(Array.isArray(task.attachments) ? task.attachments : [])
    const [description, setDescription] = useState(task.description || "")
    const [urls, setUrls] = useState<TaskUrl[]>(Array.isArray(task.urls) ? task.urls : [])
    const [newUrl, setNewUrl] = useState<TaskUrl>({ name: "", url: "" })

    useEffect(() => {
        async function fetchDeps() {
            const authData = getAuthData()
            if (!authData?.user?.company?.id) return
            const depRes = await getDepartments(authData.user.company.id)
            setDepartments(depRes.data.map((d: any) => ({ id: d.id, name: d.name })))
        }
        fetchDeps()
    }, [])

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: task.title || "",
            description: task.description || "",
            duration: task.duration || "",
            status: task.status || "active",
            projectId: task.projectId || (task.project?.id ?? ""),
            departmentId: task.project?.department?.id || "",
            attachments: Array.isArray(task.attachments) ? task.attachments : [],
            urls: Array.isArray(task.urls) ? task.urls : [],
        },
    })

    const handleAddUrl = () => {
        if (newUrl.name && newUrl.url) {
            setUrls([...urls, newUrl])
            setNewUrl({ name: "", url: "" })
        }
    }

    const handleRemoveUrl = (idx: number) => {
        setUrls(urls.filter((_, i) => i !== idx))
    }

    // Helper to format minutes to hours and minutes (always show both)
    const formatDuration = (minutes: string | number) => {
        const min = Number(minutes)
        if (isNaN(min) || min < 0) return ""
        const h = Math.floor(min / 60)
        const m = min % 60
        return `${h}h ${m.toString().padStart(2, '0')}m`
    }

    const onSubmit = async (data: FormData) => {
        setSubmitting(true)
        try {
            await updateTask(task.id, {
                title: data.title,
                description,
                duration: Number(data.duration),
                status: data.status,
                project: Number(data.projectId),
                // department: data.departmentId, // Uncomment if backend supports department
                attachments,
                urls,
            })
            toast.success("Task updated successfully")
            onUpdated()
            onClose()
        } catch (err: any) {
            const errorMsg = err?.message || "Failed to update task"
            toast.error(errorMsg)
            // If error mentions duration, set error on duration, else on title
            if (/duration|minute|hour/i.test(errorMsg)) {
                form.setError("duration", { message: errorMsg })
            } else {
                form.setError("title", { message: errorMsg })
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full h-full bg-background flex flex-col overflow-y-auto !rounded-none border-0 shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between bg-background border-b px-8 py-4">
                    <h2 className="text-2xl font-bold">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="ml-auto rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        ✕
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-xl space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Task title" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                <FormLabel>Description</FormLabel>
                                <RichTextEditor
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="Task description"
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (minutes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} placeholder="Duration in minutes" />
                                        </FormControl>
                                        {field.value && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {formatDuration(field.value)}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projects.map((project) => (
                                                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((dep) => (
                                                        <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                <FormLabel>Attachments & URLs</FormLabel>
                                <FileAttachment
                                    attachments={attachments || []}
                                    onAttachmentsChange={setAttachments}
                                    showUrlInput={true}
                                />
                            </div>
                            <div>
                                <FormLabel>URLs</FormLabel>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        placeholder="Name"
                                        value={newUrl.name}
                                        onChange={e => setNewUrl({ ...newUrl, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="https://example.com"
                                        value={newUrl.url}
                                        onChange={e => setNewUrl({ ...newUrl, url: e.target.value })}
                                    />
                                    <Button type="button" onClick={handleAddUrl}>Add</Button>
                                </div>
                                {urls.length > 0 && (
                                    <ul className="space-y-1">
                                        {urls.map((u, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="font-medium">{u.name}:</span>
                                                <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{u.url}</a>
                                                <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveUrl(idx)}>Remove</Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
} 