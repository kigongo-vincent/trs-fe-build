"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAuthUser } from "@/services/auth"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        setUser(getAuthUser())
    }, [])

    if (!isClient) return null

    if (!user) {
        // Hardcoded user data for testing
        const user = {
            fullName: "John Doe",
            email: "john.doe@example.com",
            departmentId: "07d640f3-ffe0-45d6-8919-54a92287519e",
            roleId: "0728a760-9495-4c9b-850b-d1f4ca5gb707",
            companyId: "d995009a-178f-48b9-a8ab-85f171e9b404",
            firstName: "John",
            lastName: "Doe",
            employeeId: "EMP-001",
            jobTitle: "Senior Developer",
            bio: "Experienced fullstack developer",
            phoneNumber: "1234567890",
            grossPay: 75000,
            dateOfBirth: "1990-01-01",
            nextOfKin: {
                name: "Emergency Contact",
                relationship: "Spouse",
                phoneNumber: "1234567891",
                email: "emergency@example.com"
            },
            address: {
                street: "123 Tech Street",
                city: "Tech City",
                state: "Tech State",
                country: "Tech Country",
                postalCode: "12345"
            },
            bankDetails: {
                accountName: "John Doe",
                accountNumber: "1234567890",
                bankName: "Tech Bank",
                swiftCode: "TECH123456",
                routingNumber: "987654321"
            },
            officeDays: ["1", "3", "5"]
        }

        setUser(user)
    }

    const getUserInitials = () => {
        if (!user?.fullName) return "U"
        return user.fullName.split(" ").map((n) => n[0]).join("")
    }

    const weekdayMap = {
        "1": "Monday",
        "2": "Tuesday",
        "3": "Wednesday",
        "4": "Thursday",
        "5": "Friday",
        "6": "Saturday",
        "0": "Sunday"
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-muted/10 p-4">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Full Name</Label>
                            <div className="text-muted-foreground">{user.fullName || "-"}</div>
                        </div>
                        <div>
                            <Label>First Name</Label>
                            <div className="text-muted-foreground">{user.firstName || "-"}</div>
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <div className="text-muted-foreground">{user.lastName || "-"}</div>
                        </div>
                        <div>
                            <Label>Email</Label>
                            <div className="text-muted-foreground">{user.email || "-"}</div>
                        </div>
                        <div>
                            <Label>Employee ID</Label>
                            <div className="text-muted-foreground">{user.employeeId || "-"}</div>
                        </div>
                        <div>
                            <Label>Job Title</Label>
                            <div className="text-muted-foreground">{user.jobTitle || "-"}</div>
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <div className="text-muted-foreground">{user.phoneNumber || "-"}</div>
                        </div>
                        <div>
                            <Label>Date of Birth</Label>
                            <div className="text-muted-foreground">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "-"}</div>
                        </div>
                        <div>
                            <Label>Department ID</Label>
                            <div className="text-muted-foreground">{user.departmentId || "-"}</div>
                        </div>
                        <div>
                            <Label>Role ID</Label>
                            <div className="text-muted-foreground">{user.roleId || "-"}</div>
                        </div>
                        <div>
                            <Label>Company ID</Label>
                            <div className="text-muted-foreground">{user.companyId || "-"}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address & Compensation */}
                <div className="flex flex-col gap-8 h-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <Label>Street</Label>
                                <div className="text-muted-foreground">{user.address?.street || "-"}</div>
                            </div>
                            <div>
                                <Label>City</Label>
                                <div className="text-muted-foreground">{user.address?.city || "-"}</div>
                            </div>
                            <div>
                                <Label>State</Label>
                                <div className="text-muted-foreground">{user.address?.state || "-"}</div>
                            </div>
                            <div>
                                <Label>Country</Label>
                                <div className="text-muted-foreground">{user.address?.country || "-"}</div>
                            </div>
                            <div>
                                <Label>Postal Code</Label>
                                <div className="text-muted-foreground">{user.address?.postalCode || "-"}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Compensation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <Label>Gross Pay</Label>
                                <div className="text-muted-foreground">{user.grossPay ? `$${user.grossPay}` : "-"}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Next of Kin */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Next of Kin</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label>Name</Label>
                            <div className="text-muted-foreground">{user.nextOfKin?.name || "-"}</div>
                        </div>
                        <div>
                            <Label>Relationship</Label>
                            <div className="text-muted-foreground">{user.nextOfKin?.relationship || "-"}</div>
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <div className="text-muted-foreground">{user.nextOfKin?.phoneNumber || "-"}</div>
                        </div>
                        <div>
                            <Label>Email</Label>
                            <div className="text-muted-foreground">{user.nextOfKin?.email || "-"}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Details */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Bank Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label>Account Name</Label>
                            <div className="text-muted-foreground">{user.bankDetails?.accountName || "-"}</div>
                        </div>
                        <div>
                            <Label>Account Number</Label>
                            <div className="text-muted-foreground">{user.bankDetails?.accountNumber || "-"}</div>
                        </div>
                        <div>
                            <Label>Bank Name</Label>
                            <div className="text-muted-foreground">{user.bankDetails?.bankName || "-"}</div>
                        </div>
                        <div>
                            <Label>SWIFT Code</Label>
                            <div className="text-muted-foreground">{user.bankDetails?.swiftCode || "-"}</div>
                        </div>
                        <div>
                            <Label>Routing Number</Label>
                            <div className="text-muted-foreground">{user.bankDetails?.routingNumber || "-"}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Office Days */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Office Days</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label>Days</Label>
                            <div className="text-muted-foreground">{Array.isArray(user.officeDays) && user.officeDays.length > 0 ? user.officeDays.map((d) => weekdayMap[d] || d).join(", ") : "-"}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bio */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Bio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label>Bio</Label>
                            <div className="text-muted-foreground">{user.bio || "-"}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 