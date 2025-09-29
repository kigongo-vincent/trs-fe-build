"use client"

import type React from "react"
import { Suspense } from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { MainNav } from "@/components/main-nav"
import DashboardSidebarWithSuspense from "@/components/dashboard-sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertCircle, Menu, X } from "lucide-react"
import { getUserRole, isAuthenticated, isTokenExpired, getAuthUser } from "@/services/auth"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [userRole, setUserRole] = useState("")

  const [planName, setPlanName] = useState<string>("")
  const [showPlanAlert, setShowPlanAlert] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const loadDefaults = async () => {
    if (typeof window !== "undefined") {
      let foundPlan = "Trial"
      try {
        const user = await getAuthUser()
        if (user) {
          if (user.company?.package?.name) {
            foundPlan = user.company.package.name
          }
          if (user.role?.name) {
            setUserRole(user.role.name)
          }
        }
      } catch (err) {
        console.error("Error loading user:", err)
      }

      setPlanName(foundPlan)
      const dismissed = localStorage.getItem("planAlertDismissed")
      setShowPlanAlert(dismissed !== "true")
      setLoaded(true)
    }
  }


  const router = useRouter()
  useEffect(() => {
    loadDefaults()
  }, [router])

  // Handler for dismissing the alert
  const handleDismissAlert = () => {
    setShowPlanAlert(false)
    if (typeof window !== "undefined") {
      localStorage.setItem("planAlertDismissed", "true")
    }
  }

  // Handler for upgrade button
  const handleUpgradeClick = () => {
    if (userRole === "Company Admin") {
      router.push("/dashboard/company-admin/packages")
    }
  }


  return (
    <div className="flex min-h-screen bg-[#f4f4f4] flex-col">

      {/* navbar  */}
      {
        !userRole
          ?
          ""
          :
          userRole?.toLowerCase()?.includes("consultan")
            ?
            <motion.header
              animate={{ opacity: 1 }}
              initial={{
                opacity: 0
              }} className="fixed shadow-custom w-full top-0 z-40  bg-paper">
              <div className="  flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-4">
                  <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                  <MainNav light />
                </div>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                  {userRole === "Company Admin" && (
                    <Link href="/dashboard/company-admin/packages" passHref legacyBehavior>
                      <a className="flex items-center gap-1 text-xs h-8 px-3  rounded-md bg-[#FFB458] hover:opacity-70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ textDecoration: 'none' }}>
                        <Package className="h-4 w-4 mr-1" /> {planName}
                      </a>
                    </Link>
                  )}
                  <UserNav role={userRole || "Consultant"} planName={planName} />
                </div>
              </div>
            </motion.header>
            :
            <motion.header
              animate={{ opacity: 1 }}
              initial={{
                opacity: 0
              }} className="fixed w-full top-0 z-40  bg-primary text-white">
              <div className="  flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-4">
                  <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                  <MainNav />
                </div>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                  {userRole === "Company Admin" && (
                    <Link href="/dashboard/company-admin/packages" passHref legacyBehavior>
                      <a className="flex items-center gap-1 text-xs h-8 px-3  rounded-md bg-[#FFB458] hover:opacity-70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ textDecoration: 'none' }}>
                        <Package className="h-4 w-4 mr-1" /> {planName}
                      </a>
                    </Link>
                  )}
                  {/* {userRole} */}
                  <UserNav role={userRole || "Consultant"} planName={planName} />
                </div>
              </div>
            </motion.header>
      }
      {/* end navbar  */}

      <div className="flex bg-pale flex-1">
        <DashboardSidebarWithSuspense open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className={cn(`flex-1 mt-[4rem] p-4 md:p-6`, "md:ml-64")}>

          {/* alert component for the current plan */}
          {loaded && showPlanAlert && userRole === "Company Admin" && ["trial", "free"].includes(planName.toLowerCase()) && (
            <div className="flex bg-primary/10 font-[13.5px] p-4 text-primary items-center justify-between rounded mb-4">
              <span className="flex items-center space-x-3">
                <AlertCircle />
                <span className="font-[13.5px]">You are on the <b>{planName}</b> plan, <button className="rounded-full text-primary underline font-[13.5px]" onClick={handleUpgradeClick}>upgrade</button></span>
              </span>
              <X size={20} className="cursor-pointer" onClick={handleDismissAlert} />
            </div>
          )}

          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
