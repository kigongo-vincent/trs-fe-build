"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Package as PackageIcon } from "lucide-react"
import { fetchPackageById } from "@/services/api"

export default function PackageDetailsPage() {
    const params = useParams()
    const id = params?.id as string
    const [pkg, setPkg] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError(null)
            try {
                const res = await fetchPackageById(id)
                setPkg(res.data)
            } catch (err: any) {
                setError("Failed to fetch package details.")
            } finally {
                setLoading(false)
            }
        }
        if (id) load()
    }, [id])

    return (
        <div className=" py-10 px-4 md:px-0">
            {loading ? (
                <Card className="border-none shadow-none">
                    <CardContent className="p-0">
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-md overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-gradient-to-br from-primary/5 to-muted/40">
                                <Skeleton className="h-16 w-16 rounded-xl" />
                                <div className="flex-1 w-full space-y-2">
                                    <Skeleton className="h-7 w-40 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>
                            <Separator />
                            <div className="p-8 grid gap-8 md:grid-cols-2">
                                <div className="space-y-4">
                                    <Skeleton className="h-5 w-40 mb-2" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-5 w-24 mb-2" />
                                    <Skeleton className="h-5 w-24 mb-2" />
                                    <Skeleton className="h-5 w-24 mb-2" />
                                </div>
                            </div>
                            <div className="bg-muted/40 px-8 py-4 flex flex-col md:flex-row gap-4 rounded-b-2xl">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
            ) : pkg ? (
                <Card className="border-none shadow-none rounded-sm">
                    <CardContent className="p-0">
                        <div className="rounded-2xl border bg-card text-card-foreground overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-gradient-to-br from-primary/5 to-muted/40">
                                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-primary/10 text-primary">
                                    <PackageIcon className="h-10 w-10" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                        <h1 className="text-3xl font-bold leading-tight tracking-tight mb-1 md:mb-0">{pkg.name}</h1>
                                        {/* <span className="text-xs text-muted-foreground break-all">{pkg.id}</span> */}
                                    </div>
                                    {/* <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{pkg.description}</div> */}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className="text-base px-4 py-1 rounded-full text-center">{pkg.status}</Badge>
                                </div>
                            </div>
                            <div className="p-8 ">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-1">Description</h4>
                                        <div className="whitespace-pre-line mb-6 text-base bg-muted/40 rounded-lg p-3 border min-h-[60px]">{pkg.description}</div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Price</h4>
                                            <div className="font-semibold text-lg">{pkg.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Users</h4>
                                            <div className="font-semibold text-lg">{pkg.no_of_users}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Duration Type</h4>
                                            <div className="font-semibold text-lg capitalize">{pkg.durationType}</div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Status</h4>
                                            <div className="font-semibold text-lg"><Badge>{pkg.status}</Badge></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=" px-8 py-4 flex flex-col md:flex-row gap-4 rounded-b-2xl">
                                <div>
                                    <span className="text-xs text-muted-foreground">Created At</span>
                                    <div className="text-xs">{new Date(pkg.createdAt).toLocaleString()}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Updated At</span>
                                    <div className="text-xs">{new Date(pkg.updatedAt).toLocaleString()}</div>
                                </div>
                            </div>
                            {/* <div className="sticky bottom-0 left-0 w-full bg-background/80 backdrop-blur border-t px-8 py-4 flex justify-end gap-2 z-10 rounded-b-2xl"></div> */}
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    )
} 