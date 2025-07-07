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
    // No authentication check, always allow access
  }, [router])
  return null
}
