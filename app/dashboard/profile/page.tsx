"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAuthData, getAuthUser } from "@/services/auth"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Contact, Mail, Map, MapPin, Pen, Phone, User as UserIcon, Heart, CreditCard, Building2, Hash, Mail as MailIcon, Phone as PhoneIcon } from "lucide-react"
import { formatCurrency, textCropper } from "@/lib/utils"
import { useRouter } from "next/router"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [isClient, setIsClient] = useState(false)
    const searchParams = useSearchParams();
    const section = searchParams?.get('section') || 'personal';
    const userRole = getAuthData()?.user?.role?.name

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
        return user.fullName.split(" ").map((n: any) => n[0]).join("")
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
    const PersonalSectionOld = () => (
        <>
            {/* Header Row: Profile Card + Address Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
                {/* Profile Header Card */}
                <Card className="w-full">
                    <CardContent className="flex flex-col items-center gap-4 py-8 w-full">
                        <Avatar className="h-24 w-24 mb-2 bg-primary/10">
                            <AvatarImage src={user.profileImage || undefined} alt={user.fullName || "User"} />
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
                            <div className=" gap-2 text-sm text-muted-foreground mb-2">
                                <span>Email: {user.email || "-"}</span> <br />
                                <span>Phone: {user.phoneNumber ? `+${user.phoneNumber}` : "-"}</span>
                            </div>
                            {/* <Button variant="outline" size="sm">Edit Profile</Button> */}
                        </div>
                    </CardContent>
                </Card>
                {/* Address Card */}
                {userRole == "Consultancy" && <Card className="w-full">
                    <CardHeader><CardTitle>Address</CardTitle></CardHeader>
                    <CardContent className="space-y-2 w-full">
                        <div><Label>Street</Label><div className="text-muted-foreground">{user.address?.street || "-"}</div></div>
                        <div><Label>City</Label><div className="text-muted-foreground">{user.address?.city || "-"}</div></div>
                        <div><Label>State</Label><div className="text-muted-foreground">{user.address?.state || "-"}</div></div>
                        <div><Label>Country</Label><div className="text-muted-foreground">{user.address?.country || "-"}</div></div>
                        <div><Label>Postal Code</Label><div className="text-muted-foreground">{user.address?.postalCode || "-"}</div></div>
                    </CardContent>
                </Card>}
            </div>
            {/* Info Grid: Bio, Compensation, Office Days */}
            {userRole == "Consultancy" && <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-8">
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
                        <div><Label>Gross Pay</Label><div className="text-muted-foreground">{user.grossPay ? `${formatCurrency(user.grossPay, user?.currency)}` : "-"}</div></div>
                    </CardContent>
                </Card>
                {/* Office Days Card */}
                <Card className="w-full">
                    <CardHeader><CardTitle>Office Days</CardTitle></CardHeader>
                    <CardContent className="space-y-2 w-full">
                        <div><Label>Days</Label><div className="text-muted-foreground">{Array.isArray(user.officeDays) && user.officeDays.length > 0 ? user.officeDays.map((d: string) => weekdayMap[d as keyof typeof weekdayMap] || d).join(", ") : "-"}</div></div>
                    </CardContent>
                </Card>
            </div>}
        </>
    );

    const PersonalSectionOld2 = () => (
        <>

            <div className="bg-center   bg-paper bg-cover rounded relative   min-h-[10vh] md:min-h-[25vh]">

                <Link href={"/dashboard/settings"}>
                    <Button className="absolute right-4 bottom-4"><Pen size={15} /> edit your profile</Button></Link>

                {/* proflie pic  */}
                <div className="p-2 rounded-full  left-8 bottom-[-25%] md:bottom-[-40%]  bg-paper shadow absolute mb-2"><Avatar className="md:h-40 md:w-40 h-20 w-20  bg-primary/10">
                    <AvatarImage src={user.profileImage || undefined} alt={user.fullName || "User"} />
                    <AvatarFallback className="flex flex-col items-center justify-center h-full w-full text-4xl text-primary">
                        {user.fullName ? (
                            <span>{getUserInitials()}</span>
                        ) : (
                            <UserIcon className="h-12 w-12 text-primary/60" />
                        )}
                    </AvatarFallback>
                </Avatar></div>
            </div>
            <div className="mt-[8rem] flex justify-between">
                <div className="leading-8 w-full">

                    <div className="text-2xl font-bold mb-1">{user.fullName || "-"}</div>
                    <div className="text-muted-foreground mb-1">{user.jobTitle || "-"}</div>

                    <div className="bg-paper mt-4 rounded p-4">
                        <div className="text-muted-foreground my-4">{user.bio || "-"}</div>
                        <div className="flex-col md:flex-row gap-2 hidden md:flex items-stretch justify-stretch">
                            <div className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground mb-2 bg-pale rounded p-6 ">
                                <span className="flex items-center gap-2"><Mail size={15} /> {user.email || "-"}</span>
                                <span className="flex items-center gap-2"><Phone size={15} /> {user.phoneNumber ? `+${user.phoneNumber}` : "-"}</span>
                                <span className="flex items-center gap-2"><MapPin size={15} />
                                    {userRole == "Consultancy" && <span>
                                        {user.address?.street + " " || "-"},
                                        {user.address?.city + " " || "-"},
                                        {user.address?.state + " " || "-"},
                                        {user.address?.country + " " || "-"},
                                        {user.address?.postalCode || "-"}
                                    </span>}
                                </span>
                            </div>
                            <div className="flex-1  md:border-r">

                                <CardContent className="space-y-2 w-full">
                                    <div><Label>Gross Pay</Label><div className="text-muted-foreground">{user.grossPay ? `${formatCurrency(user.grossPay, user?.currency)}` : "-"}</div></div>
                                </CardContent>
                            </div>
                            <div className="flex-1">

                                <CardContent className="space-y-2 w-full">
                                    <div><Label>Days in office</Label><div className="text-muted-foreground flex gap-2">
                                        {user?.officeDays?.map((day: string) => <div key={day} className="border rounded-full px-6 text-sm py-1">{weekdayMap[day as keyof typeof weekdayMap] || day}</div>)}
                                    </div>
                                    </div>
                                </CardContent>
                            </div>
                        </div>
                    </div>
                    {/* <Button variant="outline" size="sm">Edit Profile</Button> */}
                </div>

            </div>
        </>
    );

    const PersonalSection = () => (
        <>
            {/* Profile Header - Mobile Responsive */}
            <div className="bg-center flex items-start justify-between bg-paper p-4 sm:p-6 md:p-8 bg-cover rounded relative">
                <div className="flex items-center gap-3">
                    <div className="rounded-full mb-2">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 bg-primary/10">
                            <AvatarImage src={user.profileImage || undefined} alt={user.fullName || "User"} />
                            <AvatarFallback className="flex flex-col items-center justify-center h-full w-full text-2xl sm:text-4xl text-primary">
                                {user.fullName ? (
                                    <span>{getUserInitials()}</span>
                                ) : (
                                    <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary/60" />
                                )}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <div className="md:text-2xl text-xl font-bold mb-1">
                            <span className="md:hidden">{textCropper(user.fullName, 20) || "-"}</span>
                            <span className="hidden md:inline">{user.fullName || "-"}</span>
                        </div>
                        <div className="text-muted-foreground mb-1 sm:text-base text-sm">{user.jobTitle || "-"}</div>
                    </div>
                </div>
                <Link href={"/dashboard/settings"} className="">
                    <Button className="">
                        <Pen size={15} />
                        <span className="hidden">edit your profile</span>
                    </Button>
                </Link>
            </div>

            {/* Profile Content - Mobile Responsive */}
            <div className="flex justify-between">
                <div className="leading-6 sm:leading-8 w-full">
                    <div className="bg-paper mt-4 rounded p-4 sm:p-6">
                        <div className="text-sm sm:text-base text-muted-foreground my-4">{user.bio || "-"}</div>

                        {/* Mobile Layout */}
                        <div className="flex flex-col gap-4 md:hidden">
                            <div className="flex flex-col gap-3 text-sm text-muted-foreground bg-pale rounded p-4">
                                <span className="flex items-center gap-2">
                                    <Mail size={15} /> {user.email || "-"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Phone size={15} /> {user.phoneNumber ? `+${user.phoneNumber}` : "-"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin size={15} />
                                    {userRole == "Consultancy" && (
                                        <span>
                                            {user.address?.street + " " || "-"},
                                            {user.address?.city + " " || "-"},
                                            {user.address?.state + " " || "-"},
                                            {user.address?.country + " " || "-"},
                                            {user.address?.postalCode || "-"}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-pale rounded p-4">
                                    <Label className="text-sm font-medium">Gross Pay</Label>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {user.grossPay ? `${formatCurrency(user.grossPay, user?.currency)}` : "-"}
                                    </div>
                                </div>

                                <div className="bg-pale rounded p-4">
                                    <Label className="text-sm font-medium">Days in office</Label>
                                    <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-2">
                                        {user?.officeDays?.map((day: string) => (
                                            <div key={day} className="border rounded-full px-3 py-1 text-xs">
                                                {weekdayMap[day as keyof typeof weekdayMap] || day}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:flex flex-col md:flex-row gap-2 items-stretch justify-stretch">
                            <div className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground mb-2 bg-pale rounded p-6">
                                <span className="flex items-center gap-2">
                                    <Mail size={15} /> {user.email || "-"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Phone size={15} /> {user.phoneNumber ? `+${user.phoneNumber}` : "-"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin size={15} />
                                    {userRole == "Consultancy" && (
                                        <span>
                                            {user.address?.street + " " || "-"},
                                            {user.address?.city + " " || "-"},
                                            {user.address?.state + " " || "-"},
                                            {user.address?.country + " " || "-"},
                                            {user.address?.postalCode || "-"}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex-1 md:border-r">
                                <CardContent className="space-y-2 w-full">
                                    <div>
                                        <Label>Gross Pay</Label>
                                        <div className="text-muted-foreground">
                                            {user.grossPay ? `${formatCurrency(user.grossPay, user?.currency)}` : "-"}
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                            <div className="flex-1">
                                <CardContent className="space-y-2 w-full">
                                    <div>
                                        <Label>Days in office</Label>
                                        <div className="text-muted-foreground flex gap-2 flex-wrap">
                                            {user?.officeDays?.map((day: string) => (
                                                <div key={day} className="border rounded-full px-6 text-sm py-1">
                                                    {weekdayMap[day as keyof typeof weekdayMap] || day}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );


    // Only Next of Kin and Bank Details remain as separate sections
    const NextOfKinSection = () => (
        <div className="flex flex-col gap-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl font-medium">Next of Kin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-6 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Name</Label><div className="text-muted-foreground">{user.nextOfKin?.name || '-'}</div></div>
                        <div><Label>Relationship</Label><div className="text-muted-foreground">{user.nextOfKin?.relationship || '-'}</div></div>
                        <div><Label>Phone</Label><div className="text-muted-foreground">{user.nextOfKin?.phoneNumber ? `+${user.nextOfKin.phoneNumber}` : '-'}</div></div>
                        <div><Label>Email</Label><div className="text-muted-foreground">{user.nextOfKin?.email || '-'}</div></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
    const BankSection = () => (
        <div className="flex flex-col gap-8">
            {/* Bank Card Design */}
            <div className="relative">
                <div className="relative overflow-hidden rounded-xl shadow-lg max-w-lg w-full">
                    {/* Card Background with gradient */}
                    <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4 sm:p-6 min-h-[200px] sm:min-h-[220px]">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-12 sm:translate-x-12"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full translate-y-8 -translate-x-8 sm:translate-y-10 sm:-translate-x-10"></div>

                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-full bg-white/20">
                                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm sm:text-base">Bank Card</h3>
                                    <p className="text-white/70 text-xs sm:text-sm">Payment Information</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white/60 text-xs uppercase tracking-wider">Bank</div>
                                <div className="text-white font-bold text-sm sm:text-base">{user.bankDetails?.bankName || "BANK"}</div>
                            </div>
                        </div>

                        {/* Card Number */}
                        <div className="mb-4 sm:mb-6">
                            <div className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">Account Number</div>
                            <div className="text-white font-mono text-lg sm:text-xl tracking-wider">
                                {user.bankDetails?.accountNumber ?
                                    user.bankDetails.accountNumber.replace(/(.{4})/g, '$1 ').trim() :
                                    "•••• •••• •••• ••••"
                                }
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-white/60 text-xs sm:text-sm mb-1">Account Holder</div>
                                <div className="text-white font-semibold text-sm sm:text-base">
                                    {user.bankDetails?.accountName || "ACCOUNT HOLDER"}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white/60 text-xs sm:text-sm mb-1">SWIFT</div>
                                <div className="text-white font-mono text-xs sm:text-sm">
                                    {user.bankDetails?.swiftCode || "••••••"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
            {/* <h1 className="text-2xl font-bold tracking-tight mb-4 text-primary">Profile</h1> */}
            <div className="w-full">
                {SectionComponent}
            </div>
        </div>
    )
} 