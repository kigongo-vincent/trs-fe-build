"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { getAuthUser, clearAuth } from "@/services/auth"

interface UserNavProps {
  role: string
}

export function UserNav({ role }: UserNavProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  const refreshUserData = () => {
    const currentUser = getAuthUser()
    setUser(currentUser)
  }

  useEffect(() => {
    setIsClient(true)
    refreshUserData()
  }, [])

  // Listen for storage changes to refresh user data when profile is updated
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue) {
        refreshUserData()
      }
    }

    // Listen for storage events (when profile is updated from another tab/window)
    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom events (when profile is updated in the same tab)
    const handleCustomStorageChange = () => {
      refreshUserData()
    }
    window.addEventListener("userDataUpdated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataUpdated", handleCustomStorageChange)
    }
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.push("/")
  }

  // Update role display for consultant
  const displayRole = role === "Employee" ? "Consultant" : role

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.fullName) return "U"
    return user.fullName.split(" ").map((n: string) => n[0]).join("")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={isClient && user?.avatarUrl ? user.avatarUrl : "/placeholder.svg?height=32&width=32"}
              alt={isClient && user?.fullName ? user.fullName : "User avatar"}
            />
            <AvatarFallback>{isClient ? getUserInitials() : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {isClient && user?.fullName ? user.fullName : "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {isClient && user?.email ? user.email : "user@example.com"}
            </p>
            <p className="text-xs font-medium text-primary mt-1">{displayRole}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="/dashboard/profile" className="flex items-center w-full">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/dashboard/settings" className="flex items-center w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
