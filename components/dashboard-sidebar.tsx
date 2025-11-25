"use client"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  Building2,
  ChevronDown,
  Clock,
  Cog,
  FileText,
  Home,
  Layers,
  Package,
  PieChart,
  Users,
  Receipt,
  User,
  LayoutList,
  MessageSquare,
  Settings,
  Timer,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, Suspense } from "react"
import { getUserRole } from "@/services/auth"

interface DashboardSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileSection = searchParams?.get('section') || ''

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    admin: true,
    management: true,
    consultant: true,
    freelancer: true,
    analytics: true,
    reports: true,
    profile: false,
  })
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(getUserRole())
    }
  }, [])

  const toggleGroup = (group: string) => {
    setExpandedGroups({
      ...expandedGroups,
      [group]: !expandedGroups[group],
    })
  }

  const handleLinkClick = () => {
    // Close sidebar on mobile when clicking navigation links
    setOpen(false)
  }

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(path + "/");
  }


  const shouldShowCompanyAdmin = userRole === "Company Admin" || userRole === "Board Member"
  const shouldShowConsultant = userRole === "Consultant" || userRole === "Employee"
  const shouldShowDepartmentAdmin = userRole === "Department Admin"
  const shouldShowFreelancer = userRole === "Freelancer"


  const isProfileActive = pathname.startsWith("/dashboard/profile")
  const profileSections = [
    { key: "personal", label: "Personal Information" },
    { key: "nextOfKin", label: "Next of Kin" },
    { key: "bank", label: "Bank Details" },
  ]

  const sidebarContent = (
    <div className="bg-gray-900 h-full border-0 text-gray-300 flex-1">
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Dashboard</span>
        </Link>
        <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={() => setOpen(false)}>
          {/* <X className="h-5 w-5" /> */}
          {/* <span className="sr-only">Close sidebar</span> */}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-4">
          {/* Super Admin Section: Only for Super Admin */}
          {userRole === "Super Admin" && (
            <>
              <div className="px-3 py-2">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/super-admin"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                      isActive("/dashboard/super-admin", true) && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </div>
              </div>

              {/* Administration Section: Only for Super Admin */}
              <div className="px-3 py-2">
                <div
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => toggleGroup("admin")}
                >
                  <h3 className="text-sm font-medium">Administration</h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandedGroups.admin && "rotate-180",
                    )}
                  />
                </div>
                {expandedGroups.admin && (
                  <div className="mt-1 space-y-1">
                    <Link
                      href="/dashboard/super-admin/packages"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/super-admin/packages") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Package className="h-4 w-4" />
                      <span>Packages</span>
                    </Link>
                    <Link
                      href="/dashboard/super-admin/companies"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/super-admin/companies") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Companies</span>
                    </Link>
                    <Link
                      href="/dashboard/super-admin/licenses"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/super-admin/licenses") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span>License Keys</span>
                    </Link>
                    <Link
                      href="/dashboard/super-admin/invoices"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/super-admin/invoices") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Invoices</span>
                    </Link>
                    <Link
                      href="/dashboard/super-admin/quotes"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/super-admin/quotes") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Quotes Settings</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Analytics Section: Only for Super Admin */}
              <div className="px-3 py-2">
                <div
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => toggleGroup("analytics")}
                >
                  <h3 className="text-sm font-medium">Analytics</h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandedGroups.analytics && "rotate-180",
                    )}
                  />
                </div>
                {expandedGroups.analytics && (
                  <div className="mt-1 space-y-1">
                    <Link
                      href="/dashboard/super-admin/analytics"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/super-admin/analytics") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Reports</span>
                    </Link>
                    <Link
                      href="/dashboard/super-admin/revenue"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/super-admin/revenue") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <PieChart className="h-4 w-4" />
                      <span>Revenue</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Company Admin Section */}
          {shouldShowCompanyAdmin && (
            <>
              <div className="px-3 py-2">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/company-admin"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                      isActive("/dashboard/company-admin", true) && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </div>
              </div>

              <div className="px-3 py-2">
                <div
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => toggleGroup("management")}
                >
                  <h3 className="text-sm font-medium">Management</h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandedGroups.management && "rotate-180",
                    )}
                  />
                </div>
                {expandedGroups.management && (
                  <div className="mt-1 space-y-1">
                    <Link
                      href="/dashboard/company-admin/departments"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/company-admin/departments") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Layers className="h-4 w-4" />
                      <span>Departments</span>
                    </Link>
                    <Link
                      href="/dashboard/company-admin/projects"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/company-admin/projects") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Projects</span>
                    </Link>
                    <Link
                      href="/dashboard/company-admin/consultants"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/company-admin/consultants") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Users className="h-4 w-4" />
                      <span>Consultants</span>
                    </Link>
                    {userRole !== "Board Member" && (
                      <Link
                        href="/dashboard/company-admin/board-members"
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                          isActive("/dashboard/company-admin/board-members") && "bg-gray-800 text-primary font-semibold",
                        )}
                      >
                        <Users className="h-4 w-4" />
                        <span>Evaluators</span>
                      </Link>
                    )}
                    <Link
                      href="/dashboard/company-admin/tasks"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                        isActive("/dashboard/company-admin/tasks") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Clock className="h-4 w-4" />
                      <span>Tasks</span>
                    </Link>
                    {/* Reports Section - Collapsible */}
                    <div>
                      <div
                        className="flex items-center justify-between py-2 cursor-pointer"
                        onClick={() => toggleGroup("reports")}
                      >
                        <h3 className="text-sm font-medium">Reports</h3>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            expandedGroups.reports && "rotate-180",
                          )}
                        />
                      </div>
                      {expandedGroups.reports && (
                        <div className="ml-6 mt-1 space-y-1">
                          <Link
                            href="/dashboard/company-admin/invoices"
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                              isActive("/dashboard/company-admin/invoices") && "bg-gray-800 text-primary font-semibold",
                            )}
                          >
                            <Receipt className="h-4 w-4" />
                            <span>Invoices</span>
                          </Link>
                          <Link
                            href="/dashboard/company-admin/analytics"
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                              isActive("/dashboard/company-admin/analytics") && "bg-gray-800 text-primary font-semibold",
                            )}
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span>Analytics</span>
                          </Link>
                          {userRole === "Company Admin" && (
                            <Link
                              href="/dashboard/company-admin/packages"
                              onClick={handleLinkClick}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                                isActive("/dashboard/company-admin/packages") && "bg-gray-800 text-primary font-semibold",
                              )}
                            >
                              <Package className="h-4 w-4" />
                              <span>Packages</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Department Admin Section */}
          {shouldShowDepartmentAdmin && (
            <>
              <div className="px-3 py-2">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/department-head"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                      isActive("/dashboard/department-head", true) && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                  <Link
                    href="/dashboard/department-head/consultants"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                      isActive("/dashboard/department-head/consultants") && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Consultants</span>
                  </Link>
                  <Link
                    href="/dashboard/department-head/time-logs"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700",
                      isActive("/dashboard/department-head/time-logs") && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Time Logs</span>
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Consultant Section (but with employee URLs) */}
          {shouldShowConsultant && (
            <>
              <div className="px-3 py-2">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/employee"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                      isActive("/dashboard/employee", true) && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </div>
              </div>
              {/* My Project link for employees */}
              <div className="px-3 py-2">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/employee/projects"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                      isActive("/dashboard/employee/projects") && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Projects</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <div
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => toggleGroup("consultant")}
                >
                  <div className="flex items-center gap-2">
                    <LayoutList size={15} />
                    <h3 className="text-sm font-medium">Tasks</h3>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandedGroups.consultant && "rotate-180",
                    )}
                  />
                </div>
                {expandedGroups.consultant && (
                  <div className="mt-1 space-y-1">
                    <Link
                      href="/dashboard/employee/time-logs"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        isActive("/dashboard/employee/time-logs") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Time Logs</span>
                    </Link>
                    <Link
                      href="/dashboard/employee/completed"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        isActive("/dashboard/employee/completed") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Completed Tasks</span>
                    </Link>
                    <Link
                      href="/dashboard/employee/invoices"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        (isActive("/dashboard/employee/invoices") || pathname.includes("/dashboard/employee/invoices/")) && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Invoices</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Freelancer Section */}
          {shouldShowFreelancer && (
            <>
              <div className="px-3 py-2">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/freelancer"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                      isActive("/dashboard/freelancer", true) && "bg-gray-800 text-primary font-semibold",
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </div>
              </div>

              <div className="px-3 py-2">
                <div
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => toggleGroup("freelancer")}
                >
                  <h3 className="text-sm font-medium">Freelancer</h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandedGroups.freelancer && "rotate-180",
                    )}
                  />
                </div>
                {expandedGroups.freelancer && (
                  <div className="mt-1 space-y-1">
                    <Link
                      href="/dashboard/freelancer/companies"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        isActive("/dashboard/freelancer/companies") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Companies</span>
                    </Link>
                    <Link
                      href="/dashboard/freelancer/projects"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        isActive("/dashboard/freelancer/projects") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Projects</span>
                    </Link>
                    <Link
                      href="/dashboard/freelancer/time-logs"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        isActive("/dashboard/freelancer/time-logs") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Timer className="h-4 w-4" />
                      <span>Time Logs</span>
                    </Link>
                    <Link
                      href="/dashboard/freelancer/invoices"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        isActive("/dashboard/freelancer/invoices") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Invoices</span>
                    </Link>
                    <Link
                      href="/dashboard/freelancer/packages"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                        isActive("/dashboard/freelancer/packages") && "bg-gray-800 text-primary font-semibold",
                      )}
                    >
                      <Package className="h-4 w-4" />
                      <span>Packages</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Settings - Common for all roles */}
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link
                href="/dashboard/settings"
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800",
                  isActive("/dashboard/settings") && "bg-gray-800 text-primary font-semibold",
                )}
              >
                <div className="flex items-center gap-3">
                  <Cog className="h-4 w-4" />
                  <span>Settings</span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                >
                  New
                </Badge>
              </Link>
              {/* Collapsible Profile Menu */}
              <div>
                <div
                  className="flex items-center justify-between py-2 hover:text-primary cursor-pointer"
                  onClick={() => toggleGroup("profile")}
                >
                  <span className={cn("flex items-center  gap-3 text-sm font-medium", isProfileActive && "text-primary")}> <User className="h-4 w-4" /> Profile </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandedGroups.profile && "rotate-180",
                    )}
                  />
                </div>
                {expandedGroups.profile && (
                  <div className="ml-6 mt-1 space-y-1">
                    {profileSections.map((section) => (
                      <button
                        key={section.key}
                        className={cn(
                          "flex w-full text-left items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800  transition",
                          isProfileActive && profileSection === section.key && " text-primary"
                        )}
                        onClick={() => {
                          router.push(`/dashboard/profile?section=${section.key}`)
                          handleLinkClick()
                        }}
                      >
                        <span>{section.label}</span>
                        {isProfileActive && profileSection === section.key && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-64 border-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={cn("fixed inset-y-0 left-0 z-20 hidden w-64 flex-col  bg-background md:flex")}>
        {sidebarContent}
      </div>
    </>
  )
}

export default function DashboardSidebarWithSuspense(props: DashboardSidebarProps) {
  return (
    <Suspense fallback={<div></div>}>
      <DashboardSidebar {...props} />
    </Suspense>
  )
}
