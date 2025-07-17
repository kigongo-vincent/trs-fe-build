"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, InfoIcon, Phone } from "lucide-react"
import Link from "next/link"
import { getRequest } from "@/services/api"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"

type Company = {
    id: string;
    name: string;
    sector: string;
    address: string;
    phone: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

type Package = {
    id: string;
    name: string;
    description: string;
    price: number;
    durationType: string;
    no_of_users: number;
    status: string;
    createdAt: string;
    updatedAt: string;
};

// Hardcoded data (from LicenseKey interface fields)
const company: Company = {
    id: "c1",
    name: "Acme Corp",
    sector: "Technology",
    address: "123 Main St, Springfield",
    phone: "+1 555-1234",
    email: "info@acme.com",
    status: "active",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
}
const pkg: Package = {
    id: "p1",
    name: "Pro Plan",
    description: "Full access to all features, priority support, and advanced analytics.",
    price: 99,
    durationType: "monthly",
    no_of_users: 50,
    status: "active",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
}

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
                <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-2">Payment Error</h2>
                <p className="text-center text-muted-foreground mb-4">{message}</p>
                <Button asChild variant="destructive" className="px-8 py-6 text-base">
                    <Link href="/dashboard/company-admin/packages">Try Again</Link>
                </Button>
            </div>
        </div>
    )
}

// Update types to match new server response

type StripeSessionData = {
    transactionId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    status: string;
    expiresAt: string;
    company: Company;
    id: string;
    createdAt: string;
    updatedAt: string;
};

// Update verifySession to accept planId
async function verifySession(session_id: string, planId?: string): Promise<{ status: number; message: string; data: StripeSessionData }> {
    let url = `/billing/session/${session_id}`;
    if (planId) {
        url += `?planId=${encodeURIComponent(planId)}`;
    }
    const res = await getRequest<{ status: number; message: string; data: StripeSessionData }>(url)
    console.log("Stripe session response:", res)
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
    const [showDeviceAlert, setShowDeviceAlert] = useState(false)

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
                // Update session user info with new company info
                try {
                    const user = localStorage.getItem("user")
                    if (user) {
                        const userObj = JSON.parse(user)
                        userObj.company = res.data.company
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
        // Show modal after 2 seconds
        const timer = setTimeout(() => setShowDeviceAlert(true), 2000)
        return () => clearTimeout(timer)
    }, [session_id, planId])

    if (loading) return <StripeSkeleton />
    if (error) return <StripeError message={error} />
    if (!data) return null
    const { company, amount, currency, status: paymentStatus, transactionId, subscriptionId, expiresAt, createdAt } = data
    return (
        <div className="flex flex-col items-center justify-center h-[100vh] py-12 px-4">
            <Dialog open={showDeviceAlert} onOpenChange={setShowDeviceAlert}>
                <DialogContent className="p-0 overflow-hidden min-w-[75vw] max-w-2xl min-h-[75vh] max-h-[75vh]">
                    <div className="flex flex-col items-center md:flex-row w-full h-full">
                        {/* Left: Image */}
                        <div className="hidden md:block md:w-1/2 relative bg-black/40 dark:bg-black/60">
                            <img
                                src="https://images.pexels.com/photos/2528118/pexels-photo-2528118.jpeg"
                                alt="Devices security"
                                className="object-cover object-center w-full h-full min-h-[220px]"
                                style={{ minHeight: 220 }}
                            />
                        </div>
                        {/* Right: Content */}
                        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-card h-full">
                            <div className="flex flex-col items-center p-0 border-0 shadow-none relative bg-transparent text-center">
                                <h2 className="text-primary text-lg md:text-xl font-bold mb-2">Re-login Required on Other Devices</h2>
                                <p className="text-base md:text-base text-muted-foreground mb-4">
                                    For security, you must re-login on your other devices (such as your phone or tablet) to continue using your account with the updated company subscription. This device is already updated.
                                </p>
                            </div>
                            <Button onClick={() => setShowDeviceAlert(false)} className="mt-6 self-end w-[max-content] max-w-xs" autoFocus>OK</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="w-full max-w-xl">
                <Card className="border-0 shadow">
                    <CardHeader className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                        <CardTitle className="text-2xl font-bold text-green-500 dark:text-green-400">Payment Successful!</CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            {message || "Your payment was processed successfully."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 mt-2">
                        {/* Transaction Details */}
                        <div>
                            <h3 className="text-lg text-primary font-semibold mb-2 flex items-center gap-2">
                                Transaction Details <Badge variant={paymentStatus === "paid" ? "success" : "destructive" as any} className="capitalize ml-2">{paymentStatus}</Badge>
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm mt-2">

                                <span><span className="font-medium">Subscription ID:</span> {subscriptionId}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm mt-2">
                                <span><span className="font-medium">Amount:</span> ${amount} {currency?.toUpperCase()}</span>
                                <span><span className="font-medium">Created:</span> {new Date(createdAt).toLocaleString()}</span>
                                <span><span className="font-medium">Expires At:</span> {expiresAt ? new Date(expiresAt).toLocaleString() : "-"}</span>
                            </div>
                        </div>
                        {/* Company Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary">
                                Company Details <Badge variant={company.status === "active" ? "success" : "destructive" as any} className="capitalize ml-2">{company.status}</Badge>
                            </h3>
                            <div className="flex flex-col gap-1 text-sm">
                                <span><span className="font-medium">Name:</span> {company.name}</span>
                                <span><span className="font-medium">Sector:</span> {company.sector}</span>
                                <span><span className="font-medium">Address:</span> {company.address || "-"}</span>
                                <span><span className="font-medium">Email:</span> {company.email || "-"}</span>
                                <span><span className="font-medium">Phone:</span> {company.phone || "-"}</span>
                                <span><span className="font-medium">Created:</span> {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "-"}</span>
                            </div>
                        </div>
                        <div className="flex justify-center mt-4">
                            <Button asChild variant="default" className="px-8 w-full py-6 text-base">
                                <Link href="/dashboard/company-admin">Go to Dashboard</Link>
                            </Button>
                        </div>
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
