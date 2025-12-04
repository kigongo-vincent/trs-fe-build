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
import { AlertCircle, Loader2, Menu, X } from "lucide-react"
import { getUserRole, isAuthenticated, isTokenExpired, getAuthUser, getDashboardPath } from "@/services/auth"
import { fetchCurrentFreelancerSubscription } from "@/services/freelancer"
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
          if (user.role?.name) {
            setUserRole(user.role.name)
            // For freelancers, fetch current subscription from API
            if (user.role.name === "Freelancer") {
              try {
                const currentSubscription = await fetchCurrentFreelancerSubscription()
                if (currentSubscription && currentSubscription.plan) {
                  foundPlan = currentSubscription.plan.name
                } else {
                  foundPlan = "Trial"
                }
              } catch (err) {
                console.error("Error fetching freelancer subscription:", err)
                foundPlan = "Trial"
              }
            } else if (user.company?.package?.name) {
              foundPlan = user.company.package.name
            }
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

    // Listen for plan name updates from packages page
    const handlePlanNameUpdate = () => {
      if (typeof window !== "undefined") {
        const updatedPlanName = localStorage.getItem("freelancerPlanName")
        if (updatedPlanName) {
          setPlanName(updatedPlanName)
        } else {
          // Reload from API if localStorage is cleared
          loadDefaults()
        }
      }
    }

    window.addEventListener("freelancerPlanNameUpdated", handlePlanNameUpdate)
    return () => {
      window.removeEventListener("freelancerPlanNameUpdated", handlePlanNameUpdate)
    }
  }, [router])

  // Client-side role guard: read from localStorage via getAuthUser
  const pathname = usePathname()
  useEffect(() => {
    if (typeof window === "undefined") return
    const user = getAuthUser()
    const token = localStorage.getItem("token")

    if (!user || !token) {
      router.replace("/")
      return
    }

    // normalize role per auth.ts logic
    let role = user?.role?.name as string | null
    if (role === "Consultancy") role = "Consultant"

    const requires = (path: string): string | null => {
      if (path.startsWith("/dashboard/super-admin")) return "Super Admin"
      if (path.startsWith("/dashboard/company-admin")) return "Company Admin" // Board Members also have access
      if (path.startsWith("/dashboard/department-head")) return "Department Head"
      if (path.startsWith("/dashboard/employee") || path.startsWith("/dashboard/consultant")) return "Consultant"
      if (path.startsWith("/dashboard/freelancer")) return "Freelancer"
      if (path.startsWith("/dashboard")) return null
      return null
    }

    const requiredRole = requires(pathname || "")
    if (requiredRole && role !== requiredRole) {
      // Special case: Board Members should have access to company-admin routes
      if (pathname?.startsWith("/dashboard/company-admin") && role === "Board Member") {
        // Allow Board Members to access company-admin routes
        return
      }
      router.replace(getDashboardPath())
    }
  }, [pathname, router])

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
    } else if (userRole === "Freelancer") {
      router.push("/dashboard/freelancer/packages")
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
          (userRole?.toLowerCase()?.includes("consultan") || userRole === "Freelancer")
            ?
            <motion.header
              animate={{ opacity: 1 }}
              initial={{
                opacity: 0
              }}
              className="fixed shadow-custom w-full top-0 z-40  bg-paper">
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
          {loaded && showPlanAlert && (
            (userRole === "Company Admin" && ["trial", "free"].includes(planName.toLowerCase())) ||
            (userRole === "Freelancer" && planName.toLowerCase() === "trial")
          ) && (
              <div className="flex bg-primary/10 font-[13.5px] p-4 text-primary items-center justify-between rounded mb-4">
                <span className="flex items-center space-x-3">
                  <AlertCircle />
                  <span className="font-[13.5px]">You are on the <b>{planName}</b> plan, <button className="rounded-full text-primary underline font-[13.5px]" onClick={handleUpgradeClick}>upgrade</button></span>
                </span>
                <X size={20} className="cursor-pointer" onClick={handleDismissAlert} />
              </div>
            )}

          <Suspense fallback={<div className=" h-full flex items-center justify-center w-full">
            <div className="bg-paper flex flex-col items-center justify-center rounded p-10">
              <Loader2 className="animate-spin text-primary" size={30} />
              <p className="text-2xl mt-4">Getting things ready</p>
              <p className="text-[13.5px] mt-1 opacity-50">Pleas stand by....</p>
            </div>
          </div>}>
            {children}
          </Suspense>

        </main>
      </div>
    </div>
  )
}
