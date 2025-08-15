"use client"
import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, InfoIcon, Phone } from "lucide-react"
import Link from "next/link"
import { getRequest } from "@/services/api"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import SuccessCheckIcon from "@/components/SuccessCheckIcon";

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
    const dummyRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (showDeviceAlert && dummyRef.current) {
            dummyRef.current.focus();
        }
    }, [showDeviceAlert]);

    if (loading) return <StripeSkeleton />
    if (error) return <StripeError message={error} />
    if (!data) return null
    const { company, amount, currency, status: paymentStatus, transactionId, subscriptionId, expiresAt, createdAt } = data
    return (
        <div className="flex flex-col items-center justify-center h-[100vh] py-12 px-4">
            <Dialog open={showDeviceAlert} onOpenChange={setShowDeviceAlert}>
                <DialogContent className="p-0 overflow-hidden min-w-[75vw] max-w-2xl min-h-[70vh] max-h-[70vh]">
                    <div
                        tabIndex={0}
                        ref={dummyRef}
                        style={{
                            position: 'absolute',
                            width: 1,
                            height: 1,
                            opacity: 0,
                            pointerEvents: 'none',
                        }}
                        aria-hidden="true"
                    />
                    <div className="flex flex-col items-center md:flex-row w-full h-full">
                        {/* Left: Image */}
                        <div className="hidden h-full w-[50%] md:block md:w-1/2 relative bg-black/40 dark:bg-black/60">
                            <img
                                src="https://images.pexels.com/photos/2528118/pexels-photo-2528118.jpeg"
                                alt="Devices security"
                                className="absolute inset-0 w-full h-full object-cover object-center rounded-l-xl"
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
                            <Button onClick={() => setShowDeviceAlert(false)} className="mt-6 max-w-xs outline-none" tabIndex={-1}>CONFIRM</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="w-full max-w-xl">
                <Card className="border">
                    <CardHeader className="flex flex-col items-center gap-2">
                        <SuccessCheckIcon className="mb-2" size={90} />
                        <CardTitle className="text-2xl font-bold text-green-500 dark:text-green-400">Payment Successful!</CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            {message || "Your payment was processed successfully."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-8 mt-2">
                        {/* Transaction Summary */}
                        <div className="bg-muted/50 rounded-xl p-6 shadow-sm flex flex-col items-center">
                            <div className="mb-4 flex flex-col items-center">
                                {/* <SuccessCheckIcon size={90} className="mb-2" /> */}
                                {/* <div className="text-lg font-semibold text-green-600 mb-1">Payment Successful</div> */}
                                {/* <div className="text-sm text-muted-foreground">{message || "Your payment was processed successfully."}</div> */}
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-md text-sm">
                                <div className="text-muted-foreground">Amount</div>
                                <div className="font-medium">${amount} {currency?.toUpperCase()}</div>
                                <div className="text-muted-foreground">Status</div>
                                <div>
                                    <Badge variant={paymentStatus === "paid" ? "success" : "destructive" as any} className="capitalize">
                                        {paymentStatus}
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground">Date</div>
                                <div>{new Date(createdAt).toLocaleString()}</div>
                                <div className="text-muted-foreground">Subscription ID</div>
                                <div className="truncate">{subscriptionId}</div>
                                <div className="text-muted-foreground">Expires</div>
                                <div>{expiresAt ? new Date(expiresAt).toLocaleString() : "-"}</div>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="bg-card/80 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-base font-semibold text-primary">Company</span>
                                <Badge variant={company.status === "active" ? "success" : "destructive" as any} className="capitalize">
                                    {company.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                <div className="text-muted-foreground">Name</div>
                                <div>{company.name}</div>
                                <div className="text-muted-foreground">Sector</div>
                                <div>{company.sector}</div>
                                <div className="text-muted-foreground">Email</div>
                                <div>{company.email || "-"}</div>
                                <div className="text-muted-foreground">Phone</div>
                                <div>{company.phone || "-"}</div>
                            </div>
                        </div>

                        {/* CTA */}
                        <Button asChild variant="default" className="w-full py-6 text-base mt-2">
                            <Link href="/dashboard/company-admin">Go to Dashboard</Link>
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
