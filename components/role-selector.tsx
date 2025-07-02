"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { getAuthUser, getDashboardPath } from "@/services/auth"
import { useEffect, useState } from "react"

export function RoleSelector() {
  const router = useRouter()
  const [roles, setRoles] = useState<string[]>([])
  const [currentRole, setCurrentRole] = useState<string | null>(null)

  useEffect(() => {
    const user = getAuthUser()
    if (user) {
      // Support for users with multiple roles (if available)
      let userRoles: string[] = []
      if (Array.isArray(user.roles)) {
        userRoles = user.roles.map((r: any) => r.name)
      } else if (user.role?.name) {
        userRoles = [user.role.name]
      }
      setRoles(userRoles)
      setCurrentRole(user.role?.name || null)
    }
  }, [])

  const handleRoleSwitch = (role: string) => {
    // Store in sessionStorage for sidebar
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userRole", role)
      // Optionally, update user in localStorage for consistency
      const user = getAuthUser()
      if (user) {
        user.role = { ...user.role, name: role }
        localStorage.setItem("user", JSON.stringify(user))
      }
    }
    // Navigate to dashboard for that role
    setCurrentRole(role)
    setTimeout(() => {
      router.push(getDashboardPath())
    }, 100)
  }

  if (roles.length <= 1) return null // Hide if only one role

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Switch Role <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            disabled={role === currentRole}
          >
            {role}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
