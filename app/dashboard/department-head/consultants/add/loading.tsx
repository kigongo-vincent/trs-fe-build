import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function AddConsultantLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </CardFooter>
      </Card>
    </div>
  )
}
