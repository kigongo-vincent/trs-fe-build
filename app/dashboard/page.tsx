"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserRole, isAuthenticated, isTokenExpired } from "@/services/auth"

export default function DashboardPage() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isAuthenticated() || isTokenExpired()) {
        router.replace("/")
        return
      }
      const role = getUserRole()
      switch (role) {
        case "Super Admin":
          router.replace("/dashboard/super-admin")
          break
        case "Company Admin":
          router.replace("/dashboard/company-admin")
          break
        case "Consultant":
        case "Employee":
          router.replace("/dashboard/employee")
          break
        default:
          router.replace("/dashboard/employee")
      }
    }
  }, [router])
  return null
}
