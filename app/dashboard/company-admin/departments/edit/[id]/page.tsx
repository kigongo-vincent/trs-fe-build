"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { updateDepartment } from "@/services/departments"
import { getAllConsultants, type Consultant } from "@/services/consultants"
import { getAuthData } from "@/services/auth"
import { useToast } from "@/hooks/use-toast"

export default function EditDepartmentPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [consultants, setConsultants] = useState<Consultant[]>([])
    const [consultantsLoading, setConsultantsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        head: "",
        description: ""
    })

    const departmentId = params.id as string

    // Get department data from URL search params
    const departmentName = searchParams.get('name')
    const departmentHead = searchParams.get('head')
    const departmentDescription = searchParams.get('description')

    // Fetch consultants on component mount
    useEffect(() => {
        const fetchConsultants = async () => {
            try {
                setConsultantsLoading(true)
                const authData = getAuthData()
                if (!authData?.user?.company?.id) {
                    toast({
                        title: "Error",
                        description: "Company information not found. Please log in again.",
                        variant: "destructive"
                    })
                    return
                }

                const companyId = authData.user.company.id
                const response = await getAllConsultants(companyId)

                if (response.status === 200) {
                    setConsultants(response.data)
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to fetch consultants",
                        variant: "destructive"
                    })
                }
            } catch (error) {
                console.error("Error fetching consultants:", error)
                toast({
                    title: "Error",
                    description: "An error occurred while fetching consultants",
                    variant: "destructive"
                })
            } finally {
                setConsultantsLoading(false)
            }
        }

        fetchConsultants()
    }, [toast])

    // Initialize form data from URL params and consultants
    useEffect(() => {
        if (departmentName && departmentHead && consultants.length > 0) {
            // First, check if departmentHead is already a consultant ID
            const isAlreadyId = consultants.some(consultant => consultant.id === departmentHead)

            let headValue = departmentHead

            if (!isAlreadyId) {
                // Find the consultant whose fullName matches the department head
                const matchingConsultant = consultants.find(
                    consultant => consultant.fullName === departmentHead
                )

                if (matchingConsultant) {
                    headValue = matchingConsultant.id
                }
            }

            setFormData({
                name: departmentName,
                head: headValue,
                description: departmentDescription || ""
            })
        }
    }, [departmentName, departmentHead, departmentDescription, consultants])

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

        if (!formData.name.trim() || !formData.head.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive"
            })
            return
        }

        try {
            setLoading(true)

            // Get company ID from auth data
            const authData = getAuthData()
            if (!authData?.user?.company?.id) {
                toast({
                    title: "Error",
                    description: "Company information not found. Please log in again.",
                    variant: "destructive"
                })
                return
            }

            const payload = {
                companyId: authData.user.company.id,
                name: formData.name.trim(),
                head: formData.head.trim(),
                description: formData.description.trim()
            }

            const response = await updateDepartment(departmentId, payload)

            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Department updated successfully!",
                })
                router.push("/dashboard/company-admin/departments")
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update department",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Error updating department:", error)
            toast({
                title: "Error",
                description: "An error occurred while updating the department",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    // Show loading if department data is not available
    if (!departmentName || !departmentHead) {
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
                    <h1 className="text-2xl font-bold tracking-tight">Edit Department</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Department data not found. Please go back and try again.</p>
                    </CardContent>
                </Card>
            </div>
        )
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
                <h1 className="text-2xl font-bold tracking-tight">Edit Department</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Department Information</CardTitle>
                    <CardDescription>
                        Update department information. Fill in the required information below.
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
                            <Label htmlFor="head">Department Head *</Label>
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
                                                : "Select department head"
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
                                Update Department
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 