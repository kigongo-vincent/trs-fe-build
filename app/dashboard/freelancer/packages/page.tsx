"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAuthUser } from "@/services/auth"
import { fetchFreelancerPlans, fetchFreelancerSubscriptions, fetchCurrentFreelancerSubscription, FreelancerPlan, FreelancerPlansResponse, FreelancerSubscription } from "@/services/freelancer"

// Type for a package (from API) - using FreelancerPlan from service
type PackageType = FreelancerPlan

export default function FreelancerPackagesPage() {
    const [packages, setPackages] = useState<PackageType[]>([])
    const [subscriptions, setSubscriptions] = useState<FreelancerSubscription[]>([])
    const [loading, setLoading] = useState(true)
    const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<PackageType | null>(null)
    const [currentSubscription, setCurrentSubscription] = useState<FreelancerSubscription | null>(null)
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
    const [pendingUpgrade, setPendingUpgrade] = useState<PackageType | null>(null)

    // Hardcoded current plan for freelancer (Trial)
    const currentPlan: PackageType = {
        id: "trial",
        name: "Trial",
        description: "Free trial plan for freelancers",
        price: "0",
        currency: "usd",
        durationType: "monthly",
        isActive: true,
        maxProjects: 0,
        maxTimeLogsPerMonth: 0,
        stripePriceId: null,
        url: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            setError(null)
            try {
                const res: FreelancerPlansResponse = await fetchFreelancerPlans()
                if (!res || !Array.isArray(res.data)) {
                    throw new Error("Invalid plans response")
                }
                setPackages(res.data)
            } catch (err: any) {
                console.error("Packages page error:", err)
                setError("Failed to fetch plans")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    useEffect(() => {
        async function loadSubscriptions() {
            setSubscriptionsLoading(true)
            try {
                const user = getAuthUser()
                if (!user || !user.id) {
                    console.error("User not found")
                    return
                }
                // Fetch subscriptions list for the table
                const res = await fetchFreelancerSubscriptions(user.id)
                if (res && Array.isArray(res.data)) {
                    setSubscriptions(res.data)
                }
            } catch (err: any) {
                console.error("Subscriptions page error:", err)
                // Don't set error state for subscriptions, just log it
            } finally {
                setSubscriptionsLoading(false)
            }
        }
        loadSubscriptions()
    }, [])

    useEffect(() => {
        async function loadCurrentSubscription() {
            try {
                const subscription = await fetchCurrentFreelancerSubscription()
                if (subscription && subscription.plan) {
                    // Set current plan from active subscription
                    setCurrentSubscription(subscription)
                    setSelectedPlan(subscription.plan)
                    // Update localStorage for banner
                    if (typeof window !== "undefined") {
                        localStorage.setItem("freelancerPlanName", subscription.plan.name)
                        window.dispatchEvent(new Event("freelancerPlanNameUpdated"))
                    }
                } else {
                    // Default to trial plan if no subscription found
                    setCurrentSubscription(null)
                    setSelectedPlan(currentPlan)
                    // Update localStorage for banner
                    if (typeof window !== "undefined") {
                        localStorage.setItem("freelancerPlanName", currentPlan.name)
                        window.dispatchEvent(new Event("freelancerPlanNameUpdated"))
                    }
                }
            } catch (err: any) {
                console.error("Current subscription error:", err)
                // Default to trial plan on error
                setCurrentSubscription(null)
                setSelectedPlan(currentPlan)
                // Update localStorage for banner
                if (typeof window !== "undefined") {
                    localStorage.setItem("freelancerPlanName", currentPlan.name)
                    window.dispatchEvent(new Event("freelancerPlanNameUpdated"))
                }
            }
        }
        loadCurrentSubscription()
    }, [])

    // Calculate days remaining until expiry
    const getDaysRemaining = (expiresAt: string): number => {
        const expiryDate = new Date(expiresAt)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        expiryDate.setHours(0, 0, 0, 0)
        const diffTime = expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
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
                localStorage.setItem("freelancerPlanName", pendingUpgrade.name)
                window.dispatchEvent(new Event("freelancerPlanNameUpdated"))
            }
        }
        setUpgradeDialogOpen(false)
        setPendingUpgrade(null)
    }

    // Card min height for consistency
    const CARD_MIN_HEIGHT = "min-h-[240px]"

    return (
        <div className="flex p-4 sm:p-6 md:p-8 bg-white rounded-lg flex-col gap-4 sm:gap-6 md:gap-8">
            <div>
                <h1 className="text-lg sm:text-xl font-medium tracking-tight mb-2 flex items-center gap-2">
                    Packages
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">View available packages and upgrade your plan.</p>
            </div>

            {/* Loading/Error State */}
            {loading ? (
                <>
                    {/* Current Plan Skeleton */}
                    <Card className={`border border-primary/60 bg-primary/5 `}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-24 rounded" />
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    <Skeleton className="h-4 w-48 rounded mb-2" />
                                </CardDescription>
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
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                        <Card className={`border border-primary/60 bg-primary/5 flex flex-col`}>
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-1 w-full sm:w-auto">
                                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                                            Current Plan
                                        </Badge>
                                        <span>{selectedPlan.name}</span>
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-xs sm:text-sm">
                                        {selectedPlan.description}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-xl sm:text-2xl font-bold">{selectedPlan.price === "0" ? "Free" : `${selectedPlan.currency.toUpperCase() === "USD" ? "$" : ""}${selectedPlan.price}/${selectedPlan.durationType === "yearly" ? "yr" : "mo"}`}</span>
                                    <Badge variant="outline" className="capitalize">{selectedPlan.durationType}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Max Projects</p>
                                        <p className="text-base font-semibold">{selectedPlan.maxProjects}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Max Time Logs Per Month</p>
                                        <p className="text-base font-semibold">{selectedPlan.maxTimeLogsPerMonth}</p>
                                    </div>
                                </div>
                                {currentSubscription ? (
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Expiry Date</p>
                                                <p className="text-base font-semibold">
                                                    {new Date(currentSubscription.expiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Days Remaining</p>
                                                <p className="text-base font-semibold">
                                                    {getDaysRemaining(currentSubscription.expiresAt) > 0
                                                        ? `${getDaysRemaining(currentSubscription.expiresAt)} days`
                                                        : "Expired"
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t pt-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Expiry Date</p>
                                            <p className="text-base font-semibold">No expiry (Trial)</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}



                    {/* Available Packages Section */}
                    <div className="mt-8">
                        <h2 className="text-base sm:text-lg font-semibold mb-4">Available Packages</h2>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {/* Existing Packages */}
                            {packages.filter(pkg => {
                                const name = pkg.name?.toLowerCase() || "";
                                return name !== "trial" && name !== "free" && pkg.isActive;
                            }).map(pkg => (
                                <Card key={pkg.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-gray-300 shadow-sm">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <span className="text-base sm:text-lg font-semibold truncate">{pkg.name}</span>
                                            <Badge className="w-fit">{pkg.isActive ? "Active" : "Inactive"}</Badge>
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground truncate mt-1">{pkg.description}</div>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs">
                                            <span>Price: <span className="font-medium">{pkg.currency.toUpperCase() === "USD" ? "$" : ""}{pkg.price}</span></span>
                                            <span>Max Projects: <span className="font-medium">{pkg.maxProjects}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto sm:ml-4">
                                        {(!selectedPlan || pkg.id !== currentPlan.id) && (
                                            <Button variant="default" onClick={() => handleUpgradeClick(pkg)} className="flex-1 sm:flex-none">
                                                Pay
                                            </Button>
                                        )}
                                        {selectedPlan && pkg.id === currentPlan.id && (
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800 w-full sm:w-auto text-center">Current</Badge>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Subscriptions Section */}
                    <div className="mt-8">
                        <h2 className="text-base sm:text-lg font-semibold mb-4">My Subscriptions</h2>
                        {subscriptionsLoading ? (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="h-12 w-12 rounded" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : subscriptions.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No subscriptions found
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Plan Name</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Start Date</TableHead>
                                                <TableHead>Expiry Date</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Stripe Subscription ID</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subscriptions.map((subscription) => (
                                                <TableRow key={subscription.id}>
                                                    <TableCell className="font-medium">
                                                        {subscription.plan.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                subscription.status === "active"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className={
                                                                subscription.status === "active"
                                                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                                                    : ""
                                                            }
                                                        >
                                                            {subscription.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(subscription.startsAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(subscription.expiresAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {subscription.plan.currency.toUpperCase() === "USD" ? "$" : ""}
                                                        {subscription.plan.price}
                                                        {subscription.plan.durationType === "yearly" ? "/yr" : "/mo"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {subscription.stripeSubscriptionId || "N/A"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
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
                                <Button variant="default" onClick={confirmUpgrade}>Proceed to payment</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    )
}

