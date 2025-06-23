"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

export function RoleSelector() {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Switch Role <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/dashboard/super-admin")}>Super Admin</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/company-admin")}>Company Admin</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/department-head")}>Department Head</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/employee")}>Employee/Consultant</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/board")}>Board Member</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
