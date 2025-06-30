"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAuthUser } from "@/services/auth"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User as UserIcon } from "lucide-react"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [isClient, setIsClient] = useState(false)
    const searchParams = useSearchParams();
    const section = searchParams?.get('section') || 'personal';

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

    // Section components
    const PersonalSection = () => (
        <>
            {/* Header Row: Profile Card + Address Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
                {/* Profile Header Card */}
                <Card className="w-full">
                    <CardContent className="flex flex-col items-center gap-4 py-8 w-full">
                        <Avatar className="h-24 w-24 mb-2 bg-primary/10">
                            <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || "User"} />
                            <AvatarFallback className="flex flex-col items-center justify-center h-full w-full text-4xl text-primary">
                                {user.fullName ? (
                                    <span>{getUserInitials()}</span>
                                ) : (
                                    <UserIcon className="h-12 w-12 text-primary/60" />
                                )}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center w-full">
                            <div className="text-2xl font-bold mb-1">{user.fullName || "-"}</div>
                            <div className="text-muted-foreground mb-1">{user.jobTitle || "-"}</div>
                            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-1">
                                <span>Employee ID: {user.employeeId || "-"}</span>
                                <span>Department: {user.departmentId || "-"}</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-2">
                                <span>Email: {user.email || "-"}</span>
                                <span>Phone: {user.phoneNumber || "-"}</span>
                            </div>
                            <Button variant="outline" size="sm">Edit Profile</Button>
                        </div>
                    </CardContent>
                </Card>
                {/* Address Card */}
                <Card className="w-full">
                    <CardHeader><CardTitle>Address</CardTitle></CardHeader>
                    <CardContent className="space-y-2 w-full">
                        <div><Label>Street</Label><div className="text-muted-foreground">{user.address?.street || "-"}</div></div>
                        <div><Label>City</Label><div className="text-muted-foreground">{user.address?.city || "-"}</div></div>
                        <div><Label>State</Label><div className="text-muted-foreground">{user.address?.state || "-"}</div></div>
                        <div><Label>Country</Label><div className="text-muted-foreground">{user.address?.country || "-"}</div></div>
                        <div><Label>Postal Code</Label><div className="text-muted-foreground">{user.address?.postalCode || "-"}</div></div>
                    </CardContent>
                </Card>
            </div>
            {/* Info Grid: Bio, Compensation, Office Days */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-8">
                {/* Bio Card */}
                <Card className="w-full">
                    <CardHeader><CardTitle>Bio</CardTitle></CardHeader>
                    <CardContent className="space-y-2 w-full">
                        <div><Label>Bio</Label><div className="text-muted-foreground">{user.bio || "-"}</div></div>
                    </CardContent>
                </Card>
                {/* Compensation Card */}
                <Card className="w-full">
                    <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
                    <CardContent className="space-y-2 w-full">
                        <div><Label>Gross Pay</Label><div className="text-muted-foreground">{user.grossPay ? `$${user.grossPay}` : "-"}</div></div>
                    </CardContent>
                </Card>
                {/* Office Days Card */}
                <Card className="w-full">
                    <CardHeader><CardTitle>Office Days</CardTitle></CardHeader>
                    <CardContent className="space-y-2 w-full">
                        <div><Label>Days</Label><div className="text-muted-foreground">{Array.isArray(user.officeDays) && user.officeDays.length > 0 ? user.officeDays.map((d) => weekdayMap[d] || d).join(", ") : "-"}</div></div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
    // Only Next of Kin and Bank Details remain as separate sections
    const NextOfKinSection = () => (
        <Card className="h-full">
            <CardHeader><CardTitle>Next of Kin</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <div><Label>Name</Label><div className="text-muted-foreground">{user.nextOfKin?.name || "-"}</div></div>
                <div><Label>Relationship</Label><div className="text-muted-foreground">{user.nextOfKin?.relationship || "-"}</div></div>
                <div><Label>Phone</Label><div className="text-muted-foreground">{user.nextOfKin?.phoneNumber || "-"}</div></div>
                <div><Label>Email</Label><div className="text-muted-foreground">{user.nextOfKin?.email || "-"}</div></div>
            </CardContent>
        </Card>
    );
    const BankSection = () => (
        <Card className="h-full">
            <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <div><Label>Account Name</Label><div className="text-muted-foreground">{user.bankDetails?.accountName || "-"}</div></div>
                <div><Label>Account Number</Label><div className="text-muted-foreground">{user.bankDetails?.accountNumber || "-"}</div></div>
                <div><Label>Bank Name</Label><div className="text-muted-foreground">{user.bankDetails?.bankName || "-"}</div></div>
                <div><Label>SWIFT Code</Label><div className="text-muted-foreground">{user.bankDetails?.swiftCode || "-"}</div></div>
                <div><Label>Routing Number</Label><div className="text-muted-foreground">{user.bankDetails?.routingNumber || "-"}</div></div>
            </CardContent>
        </Card>
    );
    // Section rendering logic
    let SectionComponent = null;
    switch (section) {
        case 'personal': SectionComponent = <PersonalSection />; break;
        case 'nextOfKin': SectionComponent = <NextOfKinSection />; break;
        case 'bank': SectionComponent = <BankSection />; break;
        default: SectionComponent = <PersonalSection />;
    }
    return (
        <div className="flex flex-col items-start justify-start min-h-[80vh] w-full bg-muted/10 p-4">
            <h1 className="text-2xl font-bold tracking-tight mb-4">Profile</h1>
            <div className="w-full">
                {SectionComponent}
            </div>
        </div>
    )
} 