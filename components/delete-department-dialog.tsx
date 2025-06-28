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
import { deleteDepartment } from "@/services/departments"
import { useToast } from "@/hooks/use-toast"

interface DeleteDepartmentDialogProps {
    isOpen: boolean
    onClose: () => void
    department: {
        id: string
        name: string
        head: string
        users: any[]
        projects: any[]
    } | null
    onDeleteSuccess: () => void
}

export function DeleteDepartmentDialog({
    isOpen,
    onClose,
    department,
    onDeleteSuccess,
}: DeleteDepartmentDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!department) return

        try {
            setLoading(true)

            const response = await deleteDepartment(department.id)

            if (response.status === 200 || response.status === 204) {
                toast({
                    title: "Success",
                    description: "Department deleted successfully!",
                })
                onDeleteSuccess()
                onClose()
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to delete department",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error deleting department:", error)
            toast({
                title: "Error",
                description: "An error occurred while deleting the department",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!department) return null

    const hasUsers = department.users.length > 0
    const hasProjects = department.projects.length > 0

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Department
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the department "{department.name}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                        <h4 className="font-medium mb-2">Department Details</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Name:</span> {department.name}</p>
                            <p><span className="font-medium">Head:</span> {department.head}</p>
                            <p><span className="font-medium">Employees:</span> {department.users.length}</p>
                            <p><span className="font-medium">Projects:</span> {department.projects.length}</p>
                        </div>
                    </div>

                    {(hasUsers || hasProjects) && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Warning</h4>
                            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                {hasUsers && (
                                    <p>• This department has {department.users.length} employee{department.users.length !== 1 ? 's' : ''} assigned to it.</p>
                                )}
                                {hasProjects && (
                                    <p>• This department has {department.projects.length} project{department.projects.length !== 1 ? 's' : ''} associated with it.</p>
                                )}
                                <p className="font-medium mt-2">
                                    Deleting this department may affect these assignments and project associations.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Department
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 