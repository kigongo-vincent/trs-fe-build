"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getDashboardPath, isAuthenticated, isTokenExpired } from "@/services/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isAuthenticated() || isTokenExpired()) {
        setLoggedIn(false)
        setAuthChecked(true)
        // Redirect to home after a short delay
        // setTimeout(() => {
        router.replace("/")
        // }, 2000)
      } else {
        setLoggedIn(true)
        setAuthChecked(true)
      }
    }
  }, [router])

  useEffect(() => {
    if (loggedIn) {
      const targetPath = getDashboardPath()
      if (targetPath && targetPath !== "/dashboard") {
        router.replace(targetPath)
      }
    }
  }, [loggedIn, router])

  if (!authChecked) return null

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] py-12 px-4">
        <Card className="w-full max-w-md border-0 shadow bg-card rounded-xl p-8 flex flex-col items-center">
          <ArrowRight className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary mb-2">Login Required</CardTitle>
          <CardDescription className="text-center text-muted-foreground mb-4">
            You must be logged in to access the dashboard.<br />Redirecting to login...
          </CardDescription>
          <Button asChild variant="default" className="px-8 py-6 text-base">
            <Link href="/">Go to Login</Link>
          </Button>
        </Card>
      </div>
    )
  }

  // Authenticated users get redirected; show minimal fallback while redirecting
  return (
    <div className="flex flex-col items-center justify-center h-[100vh] py-12 px-4">
      <Card className="w-full max-w-md border-0 shadow bg-card rounded-xl p-8 flex flex-col items-center">
        <ArrowRight className="h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-2xl font-bold text-primary mb-2">Redirecting</CardTitle>
        <CardDescription className="text-center text-muted-foreground mb-4">
          Taking you to your dashboard overview…
        </CardDescription>
      </Card>
    </div>
  )
}
