import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function EditDepartmentLoading() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Skeleton className="h-8 w-48" />
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Department</CardTitle>
                    <CardDescription>
                        Update department information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-24 w-full" />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Skeleton className="h-10 w-20" />
                            <Skeleton className="h-10 w-40" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 