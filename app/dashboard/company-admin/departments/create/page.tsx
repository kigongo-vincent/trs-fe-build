"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createDepartment } from "@/services/departments"
import { getAllConsultants, type Consultant } from "@/services/consultants"
import { getAuthData } from "@/services/auth"
import { toast } from "sonner"

export default function CreateDepartmentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [consultants, setConsultants] = useState<Consultant[]>([])
    const [consultantsLoading, setConsultantsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        head: "",
        description: ""
    })

    // Fetch consultants on component mount
    useEffect(() => {
        const fetchConsultants = async () => {
            try {
                setConsultantsLoading(true)
                const authData = getAuthData()
                if (!authData?.user?.company?.id) {
                    toast.error("Company information not found. Please log in again.")
                    return
                }

                const response = await getAllConsultants()

                if (response.status === 200) {
                    setConsultants(response.data || [])
                } else {
                    toast.error("Failed to fetch consultants")
                }
            } catch (error) {
                console.error("Error fetching consultants:", error)
                toast.error("An error occurred while fetching consultants")
            } finally {
                setConsultantsLoading(false)
            }
        }

        fetchConsultants()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleHeadChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            head: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error("Please enter the department name.")
            return
        }

        try {
            setLoading(true)

            // Get company ID from auth data
            const authData = getAuthData()
            if (!authData?.user?.company?.id) {
                toast.error("Company information not found. Please log in again.")
                return
            }

            const payload: any = {
                companyId: authData.user.company.id,
                name: formData.name.trim(),
                description: formData.description.trim()
            }
            if (formData.head.trim()) {
                payload.headId = formData.head.trim()
            }

            const response = await createDepartment(payload)

            if (response.status === 201 || response.status === 200) {
                toast.success("Department created successfully!")
                router.push("/dashboard/company-admin/departments")
            } else {
                toast.error(response.message || "Failed to create department")
            }
        } catch (error: any) {
            console.error("Error creating department:", error)
            toast.error(error?.message || (error?.response?.data?.message) || "An error occurred while creating the department")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="h-8 w-8 p-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="font-medium tracking-tight text-base">Create New Department</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-medium">Department Information</CardTitle>
                    <CardDescription>
                        Add a new department to your organization. Fill in the required information below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Department Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter department name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="head">Department Head</Label>
                            <Select
                                value={formData.head}
                                onValueChange={handleHeadChange}
                                disabled={loading || consultantsLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        consultantsLoading
                                            ? "Loading consultants..."
                                            : consultants.length === 0
                                                ? "No consultants available"
                                                : "Select department head (optional)"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {consultants.map((consultant) => (
                                        <SelectItem key={consultant.id} value={consultant.id}>
                                            {consultant.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter department description (optional)"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || consultantsLoading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Department
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 