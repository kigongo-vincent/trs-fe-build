"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { fetchPackages } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

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

    // Demo usage/expiry (could be dynamic in real app)
    const currentUsage = 2
    const [currentPlanExpiry] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)) // 10 days from now

    useEffect(() => {
        async function loadPackages() {
            setLoading(true)
            setError(null)
            try {
                const res: PackagesApiResponse = await fetchPackages()
                setPackages(res.data || [])
                setSelectedPlan(res.data?.[0] || null) // Use first as current plan for demo
            } catch (err: any) {
                setError("Failed to fetch packages")
            } finally {
                setLoading(false)
            }
        }
        loadPackages()
    }, [])

    const handleUpgradeClick = (pkg: PackageType) => {
        setPendingUpgrade(pkg)
        setUpgradeDialogOpen(true)
    }

    const confirmUpgrade = () => {
        if (pendingUpgrade) {
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

    const usagePercent = selectedPlan ? Math.round((currentUsage / selectedPlan.no_of_users) * 100) : 0

    // Card min height for consistency
    const CARD_MIN_HEIGHT = "min-h-[240px]" // reduced height for a more compact look

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                    <Package className="h-6 w-6" /> Packages
                </h1>
                <p className="text-muted-foreground mb-4">View available packages and upgrade your plan.</p>
            </div>

            {/* Loading/Error State */}
            {loading ? (
                <>
                    {/* Current Plan Skeleton */}
                    <Card className={`border-2 border-primary/60 bg-primary/5 ${CARD_MIN_HEIGHT}`}>
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
                        <Card className={`border-2 border-primary/60 bg-primary/5 ${CARD_MIN_HEIGHT} flex flex-col`}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">Current Plan</Badge>
                                        {selectedPlan.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2">{selectedPlan.description}</CardDescription>
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span>Usage</span>
                                            <span>{currentUsage} / {selectedPlan.no_of_users} users</span>
                                        </div>
                                        <Progress value={usagePercent} className="h-2" />
                                        <div className="text-xs text-muted-foreground mt-2">
                                            Expires: {currentPlanExpiry.toLocaleDateString()} ({Math.ceil((currentPlanExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left)
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
                </>
            )}
        </div>
    )
} 