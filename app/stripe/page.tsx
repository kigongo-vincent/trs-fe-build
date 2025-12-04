"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { getRequest } from "@/services/api"
import SuccessCheckIcon from "@/components/SuccessCheckIcon";

type Freelancer = {
    id: string;
    fullName: string;
    email: string;
    password: string;
    status: string;
    type: string;
    jobTitle: string;
    bio: string;
    profileImage: string | null;
    resetToken: string | null;
    resetTokenExpires: string | null;
    phoneNumber: string;
    employeeId: string | null;
    firstName: string;
    lastName: string;
    grossPay: number | null;
    dateOfBirth: string | null;
    nextOfKin: {
        name: string;
        email: string;
        phoneNumber: string | null;
        relationship: string;
    };
    address: string | null;
    bankDetails: {
        bankName: string;
        swiftCode: string;
        accountName: string;
        accountNumber: string;
        routingNumber: string;
    };
    officeDays: string | null;
    createdAt: string;
    updatedAt: string;
    hourlyRate: number | null;
    currency: string | null;
    totalHoursPerMonth: number;
    attachments: string | null;
    boardMemberRole: string | null;
};

type Plan = {
    id: string;
    name: string;
    description: string;
    price: string;
    currency: string;
    durationType: string;
    isActive: boolean;
    maxProjects: number;
    maxTimeLogsPerMonth: number;
    stripePriceId: string | null;
    url: string;
    createdAt: string;
    updatedAt: string;
};

// Skeleton Loader
function StripeSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center h-[100vh] py-12 px-4 animate-pulse">
            <div className="w-full max-w-xl border-0 shadow bg-card rounded-xl p-8">
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex flex-col gap-6 mt-2">
                    <div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="flex gap-4 mt-2">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                    <div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="flex flex-col gap-1">
                            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Error Component
function StripeError({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[100vh] py-12 px-4">
            <div className="w-full max-w-xl border-0 shadow bg-card rounded-xl p-8 flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Error</h2>
                <p className="text-center text-muted-foreground mb-4">{message}</p>
                <Button asChild variant="default" className="px-8 py-6 text-base">
                    <Link href="/dashboard/freelancer/packages">Try Again</Link>
                </Button>
            </div>
        </div>
    )
}

// Update types to match new server response
type StripeSessionData = {
    freelancerId: string;
    planId: string;
    stripeSubscriptionId: string;
    status: string;
    startsAt: string;
    expiresAt: string;
    freelancer: Freelancer;
    plan: Plan;
    canceledAt: string | null;
    id: string;
    createdAt: string;
    updatedAt: string;
};

// Update verifySession to use freelancer subscription endpoint
async function verifySession(session_id: string, planId?: string): Promise<{ status: number; message: string; data: StripeSessionData }> {
    let url = `/freelancer/subscriptions/session/${session_id}`;
    if (planId) {
        url += `?planId=${encodeURIComponent(planId)}`;
    }
    const res = await getRequest<{ status: number; message: string; data: StripeSessionData }>(url)
    return res
}

function StripeSuccessPageInner() {
    const searchParams = useSearchParams()
    const session_id = searchParams.get("session_id")
    const planId = searchParams.get("planId")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<StripeSessionData | null>(null)
    const [message, setMessage] = useState<string>("")

    useEffect(() => {
        if (!session_id) {
            setError("Missing session ID. Please check your link.")
            setLoading(false)
            return
        }
        verifySession(session_id, planId || undefined)
            .then((res) => {
                setData(res.data)
                setMessage(res.message)
                setLoading(false)
                // Update session user info with new subscription info
                try {
                    const user = localStorage.getItem("user")
                    if (user) {
                        const userObj = JSON.parse(user)
                        // Update user subscription info if needed
                        localStorage.setItem("user", JSON.stringify(userObj))
                        // Dispatch custom event for other components
                        window.dispatchEvent(new Event("userDataUpdated"))
                    }
                } catch { }
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [session_id, planId])

    if (loading) return <StripeSkeleton />
    if (error) return <StripeError message={error} />
    if (!data) return null
    const { freelancer, plan, status: subscriptionStatus, stripeSubscriptionId, startsAt, expiresAt, createdAt } = data
    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] py-12 px-4">
            <div className="w-full max-w-4xl">
                <Card className="border">
                    <CardHeader className="flex flex-col items-center gap-2">
                        <SuccessCheckIcon className="mb-2" size={90} />
                        <CardTitle className="text-2xl font-bold text-foreground">Payment Successful!</CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            {message || "Your payment was processed successfully."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 mt-2">
                        {/* Main Content Grid - Responsive layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Transaction Summary */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-primary">Subscription Summary</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div className="text-muted-foreground">Plan</div>
                                    <div className="font-medium">{plan.name}</div>
                                    <div className="text-muted-foreground">Price</div>
                                    <div className="font-medium">${plan.price} {plan.currency?.toUpperCase()}</div>
                                    <div className="text-muted-foreground">Status</div>
                                    <div>
                                        <Badge variant={subscriptionStatus === "active" ? "success" : "destructive" as any} className="capitalize">
                                            {subscriptionStatus}
                                        </Badge>
                                    </div>
                                    <div className="text-muted-foreground">Started</div>
                                    <div>{new Date(startsAt).toLocaleString()}</div>
                                    <div className="text-muted-foreground">Subscription ID</div>
                                    <div className="truncate font-mono text-xs">{stripeSubscriptionId}</div>
                                    <div className="text-muted-foreground">Expires</div>
                                    <div>{expiresAt ? new Date(expiresAt).toLocaleString() : "-"}</div>
                                </div>
                            </div>

                            {/* Plan Info */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg font-semibold text-primary">Plan Details</span>
                                    <Badge variant={plan.isActive ? "success" : "destructive" as any} className="capitalize">
                                        {plan.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div className="text-muted-foreground">Name</div>
                                    <div>{plan.name}</div>
                                    <div className="text-muted-foreground">Description</div>
                                    <div>{plan.description}</div>
                                    <div className="text-muted-foreground">Duration</div>
                                    <div className="capitalize">{plan.durationType}</div>
                                    <div className="text-muted-foreground">Max Projects</div>
                                    <div>{plan.maxProjects}</div>
                                    <div className="text-muted-foreground">Max Time Logs/Month</div>
                                    <div>{plan.maxTimeLogsPerMonth}</div>
                                </div>
                            </div>
                        </div>

                        {/* Freelancer Info - Full width on large screens */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg font-semibold text-primary">Freelancer</span>
                                <Badge variant={freelancer.status === "active" ? "success" : "destructive" as any} className="capitalize">
                                    {freelancer.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground mb-1">Name</div>
                                    <div className="font-medium break-words">{freelancer.fullName}</div>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <div className="text-muted-foreground mb-1">Email</div>
                                    <div className="font-medium break-all word-break break-words">{freelancer.email}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Phone</div>
                                    <div className="font-medium break-words">{freelancer.phoneNumber || "-"}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Job Title</div>
                                    <div className="font-medium break-words">{freelancer.jobTitle || "-"}</div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <Button asChild variant="default" className="w-full py-6 text-base">
                            <Link href="/dashboard/freelancer">Go to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function StripeSuccessPage() {
    return (
        <Suspense fallback={<StripeSkeleton />}>
            <StripeSuccessPageInner />
        </Suspense>
    )
}
