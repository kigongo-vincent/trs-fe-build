"use client"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"
import { deleteProject } from "@/services/projects"
import { toast } from "sonner"
import { type Project } from "@/services/projects"

interface DeleteProjectDialogProps {
    isOpen: boolean
    onClose: () => void
    project: Project | null
    onDeleteSuccess: () => void
}

export function DeleteProjectDialog({
    isOpen,
    onClose,
    project,
    onDeleteSuccess,
}: DeleteProjectDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!project) return

        try {
            setLoading(true)

            const response = await deleteProject(project.id)

            if (response.status === 200 || response.status === 204) {
                toast.success("Project deleted successfully!")
                onDeleteSuccess()
                onClose()
            } else {
                toast.error(response.message || "Failed to delete project")
            }
        } catch (error) {
            console.error("Error deleting project:", error)
            toast.error("An error occurred while deleting the project")
        } finally {
            setLoading(false)
        }
    }

    if (!project) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Project
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the project "{project.name}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                        <h4 className="font-medium mb-2">Project Details</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Name:</span> {project.name}</p>
                            <p><span className="font-medium">Department:</span> {project.department.name}</p>
                            <p><span className="font-medium">Lead:</span> {project.lead.fullName}</p>
                            <p><span className="font-medium">Status:</span> {project.status}</p>
                            <p><span className="font-medium">Progress:</span> {project.progress}%</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Warning</h4>
                        <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                            <p>• This project may have associated tasks and time logs.</p>
                            <p>• Deleting this project will remove all associated data.</p>
                            <p className="font-medium mt-2">
                                This action cannot be undone and may affect project reporting.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 