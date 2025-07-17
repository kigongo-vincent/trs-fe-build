"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { fetchPackages, fetchLicenseKeys, LicenseKey, fetchBillingHistory, BillingTransaction } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuthUser } from "@/services/auth"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { format } from "date-fns"

// Type for a package (from API)
type PackageType = {
    id: string;
    name: string;
    description: string;
    price: number;
    durationType: string;
    no_of_users: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    url?: string; // Add url property
}

type PackagesApiResponse = {
    status: number;
    message: string;
    data: PackageType[];
}

export default function CompanyAdminPackagesPage() {
    const [packages, setPackages] = useState<PackageType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<PackageType | null>(null)
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
    const [pendingUpgrade, setPendingUpgrade] = useState<PackageType | null>(null)
    const [currentPlanExpiry, setCurrentPlanExpiry] = useState<Date | null>(null)
    const [latestLicenseKey, setLatestLicenseKey] = useState<LicenseKey | null>(null)
    const [customDialogOpen, setCustomDialogOpen] = useState(false)
    const [customUserCount, setCustomUserCount] = useState(1)
    const [customError, setCustomError] = useState<string | null>(null)
    const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>([])
    const [billingLoading, setBillingLoading] = useState(true)
    const [billingError, setBillingError] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            setError(null)
            try {
                const res: PackagesApiResponse = await fetchPackages()
                if (!res || !Array.isArray(res.data)) {
                    throw new Error("Invalid packages response")
                }
                setPackages(res.data)
                // Find current plan by id
                let currentPlan: PackageType | null = null
                const planId = getCurrentPlanId()
                if (planId) {
                    currentPlan = res.data.find(pkg => pkg.id === planId) || null
                }
                setSelectedPlan(currentPlan)

                // Fetch license keys and filter for this company
                const user = getAuthUser()
                if (!user || !user.company || !user.company.id) {
                    console.warn("No user/company info found in getAuthUser()");
                    setLatestLicenseKey(null)
                    setCurrentPlanExpiry(null)
                    return
                }
                const companyId = user.company.id
                const licenseRes = await fetchLicenseKeys()
                if (!licenseRes || !Array.isArray(licenseRes.data)) {
                    throw new Error("Invalid license keys response")
                }
                const companyLicenses = licenseRes.data.filter(
                    (lk: LicenseKey) => lk && lk.company && lk.company.id === companyId
                )
                // Sort by expiryDate (desc), fallback to createdAt
                companyLicenses.sort((a: LicenseKey, b: LicenseKey) => {
                    const aDate = new Date(a.expiryDate || a.createdAt).getTime()
                    const bDate = new Date(b.expiryDate || b.createdAt).getTime()
                    return bDate - aDate
                })
                const latest = companyLicenses[0] || null
                setLatestLicenseKey(latest)
                setCurrentPlanExpiry(latest ? new Date(latest.expiryDate) : null)
                // If the license has a package, use that as the current plan
                if (latest && latest.package) {
                    setSelectedPlan(res.data.find(pkg => pkg.id === latest.package.id) || null)
                }

                // Fetch billing history
                setBillingLoading(true)
                setBillingError(null)
                try {
                    const billingRes = await fetchBillingHistory(companyId)
                    if (billingRes && Array.isArray(billingRes.data)) {
                        setBillingHistory(billingRes.data)
                    } else {
                        setBillingHistory([])
                    }
                } catch (err: any) {
                    setBillingError("Failed to fetch billing history")
                    setBillingHistory([])
                } finally {
                    setBillingLoading(false)
                }
            } catch (err: any) {
                console.error("Packages page error:", err)
                setError("Failed to fetch packages or license keys")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Helper to get current plan name from user/session/localStorage
    function getCurrentPlanName(): string | null {
        if (typeof window === "undefined") return null
        try {
            const user = getAuthUser()
            if (user && user.company && user.company.package && user.company.package.name) {
                return user.company.package.name
            } else {
                const sessionPackage = sessionStorage.getItem("package")
                if (sessionPackage) {
                    const pkg = JSON.parse(sessionPackage)
                    if (pkg && typeof pkg === "object" && pkg.name) {
                        return pkg.name
                    }
                }
            }
        } catch { }
        const storedPlan = localStorage.getItem("companyPlanName")
        if (storedPlan) return storedPlan
        return null
    }

    // Helper to get current plan id from user/session/localStorage
    function getCurrentPlanId(): string | null {
        if (typeof window === "undefined") return null
        try {
            const user = getAuthUser()
            if (user && user.company && user.company.package && user.company.package.id) {
                return user.company.package.id
            } else {
                const sessionPackage = sessionStorage.getItem("package")
                if (sessionPackage) {
                    const pkg = JSON.parse(sessionPackage)
                    if (pkg && typeof pkg === "object" && pkg.id) {
                        return pkg.id
                    }
                }
            }
        } catch { }
        // No id in localStorage fallback
        return null
    }

    // Helper to create a custom package object
    function getCustomPackage(userCount: number): PackageType {
        return {
            id: "custom",
            name: `Custom (${userCount} users)`,
            description: `Custom plan for ${userCount} users`,
            price: userCount,
            durationType: "monthly",
            no_of_users: userCount,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            url: undefined, // No url for custom
        }
    }

    const handleUpgradeClick = (pkg: PackageType) => {
        setPendingUpgrade(pkg)
        setUpgradeDialogOpen(true)
    }

    const confirmUpgrade = () => {
        if (pendingUpgrade) {
            if (pendingUpgrade.url) {
                const user = getAuthUser();
                const email = user && user.email ? user.email : null;
                let url = pendingUpgrade.url;
                if (email) {
                    const urlObj = new URL(url, window.location.origin);
                    urlObj.searchParams.set('prefilled_email', email);
                    url = urlObj.toString();
                }
                window.open(url, '_blank');
                return;
            }
            setSelectedPlan(pendingUpgrade)
            if (typeof window !== "undefined") {
                localStorage.setItem("companyPlanName", pendingUpgrade.name)
                // Dispatch a custom event to notify other tabs/components
                window.dispatchEvent(new Event("companyPlanNameUpdated"))
            }
        }
        setUpgradeDialogOpen(false)
        setPendingUpgrade(null)
    }

    const handleCustomSelect = () => {
        setCustomDialogOpen(true)
        setCustomUserCount(1)
        setCustomError(null)
    }

    const confirmCustom = () => {
        if (customUserCount < 1) {
            setCustomError("Number of users must be at least 1")
            return
        }
        const pkg = getCustomPackage(customUserCount)
        setPendingUpgrade(pkg)
        setCustomDialogOpen(false)
        setUpgradeDialogOpen(true)
    }

    // Remove usage/consumption display

    // Card min height for consistency
    const CARD_MIN_HEIGHT = "min-h-[240px]" // reduced height for a more compact look

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2 text-primary">
                    <Package className="h-6 w-6" /> Packages
                </h1>
                <p className="text-muted-foreground mb-4">View available packages and upgrade your plan.</p>
            </div>

            {/* Loading/Error State */}
            {loading ? (
                <>
                    {/* Current Plan Skeleton */}
                    <Card className={`border-2 border-primary/60 bg-primary/5 `}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-24 rounded" />
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    <Skeleton className="h-4 w-48 rounded mb-2" />
                                </CardDescription>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <Skeleton className="h-3 w-12 rounded" />
                                        <Skeleton className="h-3 w-16 rounded" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded" />
                                    <div className="text-xs text-muted-foreground mt-2">
                                        <Skeleton className="h-3 w-32 rounded" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Skeleton className="h-8 w-16 rounded" />
                                <Skeleton className="h-5 w-16 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-32 rounded mt-2" />
                        </CardContent>
                    </Card>
                    {/* Available Packages Skeletons */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className={`flex flex-col justify-between ${CARD_MIN_HEIGHT}`}>
                                <CardHeader className="flex flex-row items-center gap-4 p-4">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </>
            ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
                <>
                    {/* Current Plan Section */}
                    {selectedPlan && (
                        <Card className={`border-2 border-primary/60 bg-primary/5  flex flex-col`}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">Current Plan</Badge>
                                        {selectedPlan.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2">{selectedPlan.description}</CardDescription>
                                    <div className="mt-4">
                                        {latestLicenseKey && (
                                            <div className="flex items-center gap-2 text-xs mb-1">
                                                <span className="font-semibold">License Key:</span>
                                                <span className="font-mono break-all">{latestLicenseKey.key}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground mt-2">
                                            Expires: {currentPlanExpiry ? currentPlanExpiry.toLocaleDateString() : "-"} {currentPlanExpiry ? `(${Math.ceil((currentPlanExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left)` : ""}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-2xl font-bold">{selectedPlan.price === 0 ? "Free" : `$${selectedPlan.price}/${selectedPlan.durationType === "yearly" ? "yr" : "mo"}`}</span>
                                    <Badge variant="outline" className="capitalize">{selectedPlan.durationType}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                {/* Features not available from API */}
                            </CardContent>
                        </Card>
                    )}

                    {/* Available Packages Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Available Packages</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Custom Package Card */}
                            <Card className="flex items-center gap-4 p-4 border-dashed border-2 border-primary/40 bg-primary/5 shadow-sm">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold truncate">Custom Package</span>
                                        <Badge className="ml-2">Custom</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">Specify your own number of users. $1 per user/month.</div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    <Button variant="default" onClick={handleCustomSelect}>
                                        Select
                                    </Button>
                                </div>
                            </Card>
                            {/* Existing Packages */}
                            {packages.map(pkg => (
                                <Card key={pkg.id} className="flex items-center gap-4 p-4 border-gray-300 shadow-sm">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold truncate">{pkg.name}</span>
                                            <Badge className="ml-2">{pkg.status}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">{pkg.description}</div>
                                        <div className="flex gap-4 mt-2 text-xs">
                                            <span>Price: <span className="font-medium">{pkg.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></span>
                                            <span>Users: <span className="font-medium">{pkg.no_of_users}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        {(!selectedPlan || pkg.id !== selectedPlan.id) && (
                                            <Button variant="default" onClick={() => handleUpgradeClick(pkg)}>
                                                Upgrade
                                            </Button>
                                        )}
                                        {selectedPlan && pkg.id === selectedPlan.id && (
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">Current</Badge>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Upgrade Confirmation Dialog */}
                    <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Upgrade</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to upgrade to the <span className="font-semibold">{pendingUpgrade?.name}</span> plan?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
                                <Button variant="default" onClick={confirmUpgrade}>Upgrade</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Custom Package Modal */}
                    <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Custom Package</DialogTitle>
                                <DialogDescription>
                                    Specify the number of users for your custom package. Price is $1 per user per month.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-4 mt-2">
                                <label className="text-sm font-medium">Number of Users</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={customUserCount}
                                    onChange={e => {
                                        const val = parseInt(e.target.value)
                                        setCustomUserCount(isNaN(val) ? 1 : val)
                                        setCustomError(null)
                                    }}
                                    className="w-full"
                                />
                                <div className="text-sm">Total Price: <span className="font-semibold">${customUserCount.toLocaleString()} USD / month</span></div>
                                {customError && <div className="text-red-500 text-xs">{customError}</div>}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
                                <Button variant="default" onClick={confirmCustom}>Confirm</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Transaction History Section */}
                    <div className="mt-10">
                        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
                        {billingLoading ? (
                            <div className="text-muted-foreground">Loading transaction history...</div>
                        ) : billingError ? (
                            <div className="text-red-500">{billingError}</div>
                        ) : billingHistory.length === 0 ? (
                            <div className="text-muted-foreground">No transactions found.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subscription ID</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Currency</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Expires At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingHistory.map(tx => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-mono break-all">{tx.subscriptionId}</TableCell>
                                            <TableCell className="text-right">{Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="uppercase">{tx.currency}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        tx.status === "paid"
                                                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                                            : tx.status === "pending"
                                                                ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                                                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800"
                                                    }
                                                >
                                                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{tx.createdAt ? format(new Date(tx.createdAt), "MMM d, yyyy") : "-"}</TableCell>
                                            <TableCell>{tx.expiresAt ? format(new Date(tx.expiresAt), "MMM d, yyyy") : "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </>
            )}
        </div>
    )
} 