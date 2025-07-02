"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { postRequest } from "@/services/api"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"

// Expanded list of company sectors
const sectors = [
  { value: "technology", label: "Technology & IT" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare & Pharmaceuticals" },
  { value: "education", label: "Education & Training" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing & Production" },
  { value: "agriculture", label: "Agriculture & Farming" },
  { value: "construction", label: "Construction & Real Estate" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "media", label: "Media & Entertainment" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "consulting", label: "Consulting & Professional Services" },
  { value: "legal", label: "Legal Services" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "nonprofit", label: "Non-profit & NGO" },
  { value: "government", label: "Government & Public Sector" },
]

interface FormData {
  name: string
  sector: string
  fullName: string
  email: string
  password: string
}

export default function CompanySignup() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    sector: "",
    fullName: "",
    email: "",
    password: "",
  })
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track the selected sector value separately for UI display
  const [selectedSector, setSelectedSector] = useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSectorSelect = (value: string) => {
    const selected = sectors.find((sector) => sector.value === value)
    if (selected) {
      setFormData((prev) => ({ ...prev, sector: selected.label }))
      setSelectedSector(selected.label)
    }
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate sector is selected
    if (!formData.sector) {
      setError("Please select a company sector")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await postRequest<{
        status: number
        message: string
        data: {
          user: any
          token: string
        }
      }>("/company/signup", formData)

      // Store token in localStorage
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      // Redirect to company admin dashboard
      router.push("/dashboard/company-admin")
    } catch (err) {
      console.error("Signup error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 bg-card">
      {/* Split layout */}
      <div className="flex w-[90vw] min-h-[80vh] bg-card rounded-2xl shadow-lg shadow-gray-100 overflow-hidden relative z-10">
        {/* Left: Image + testimonial */}
        <div className="hidden md:flex flex-col justify-between w-[50%] bg-black/40 dark:bg-black/60 relative">
          <Image
            src="https://images.pexels.com/photos/3727463/pexels-photo-3727463.jpeg"
            alt="Signup background"
            fill
            className="object-cover object-center absolute inset-0 -z-10"
            priority
          />
          {/* Logo */}
          <div className="p-6">
            <span className="text-lg font-bold text-white drop-shadow">Task Reporting System</span>
          </div>
          {/* Testimonial */}
          <div className="p-6 text-white">
            <p className="text-lg font-semibold mb-2">“Simply all the tools that my team and I need.”</p>
            <div className="text-sm opacity-80">
              <div className="font-bold">Wensi Nuwagaba</div>
              <div>Chief Executive Officer</div>
            </div>
          </div>
        </div>
        {/* Right: Signup form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-md">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Create Company Account</h1>
            <p className="text-muted-foreground mb-8">Enter your company and admin details to get started.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}
              <div>
                <Label htmlFor="name" className="mb-1">Company Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your Company Ltd"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sector" className="mb-1">Company Sector</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn("w-full justify-between", !selectedSector && "text-muted-foreground")}
                    >
                      {selectedSector || "Select company sector..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search sectors..." />
                      <CommandList>
                        <CommandEmpty>No sector found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {sectors.map((sector) => (
                            <CommandItem key={sector.value} value={sector.value} onSelect={handleSectorSelect}>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedSector === sector.label ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {sector.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="fullName" className="mb-1">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password" className="mb-1">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button className="w-full text-base font-semibold py-2.5" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <div className="text-center text-sm mt-6 text-muted-foreground">
              Already have an account?{' '}
              <Link href="/" className="text-primary font-medium hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
      {/* Theme selector at bottom center */}
      <div className="absolute left-1/2 bottom-8 -translate-x-1/2 z-20">
        <ModeToggle />
      </div>
    </div>
  )
}
