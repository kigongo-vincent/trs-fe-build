"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { signupCompany, storeAuthData, getUserRole } from "@/services/auth"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CurrencyI, getCurrencies } from "@/services/getCurrencies"

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
  currency: string // Added currency
  roundOff?: boolean // Add roundoff field
}

export default function CompanySignup() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    sector: "",
    fullName: "",
    email: "",
    password: "",
    currency: "USD", // Default currency
    roundOff: undefined, // Initially undefined
  })
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track the selected sector value separately for UI display
  const [selectedSector, setSelectedSector] = useState<string>("")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD")
  const [showRoundoffDialog, setShowRoundoffDialog] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const [currencies, setCurrencies] = useState<CurrencyI[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(false)

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

  // Currency select handler
  const handleCurrencySelect = (value: string) => {
    setFormData((prev) => ({ ...prev, currency: value }))
    setSelectedCurrency(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate sector is selected
    if (!formData.sector) {
      setError("Please select a company sector")
      return
    }
    // Validate currency is selected
    if (!formData.currency) {
      setError("Please select a currency")
      return
    }

    // Instead of submitting, show the roundoff dialog
    setShowRoundoffDialog(true)
    setPendingSubmit(true)
  }

  // Handles the user's choice in the roundoff dialog
  const handleRoundoffChoice = async (roundoffValue: boolean) => {
    setShowRoundoffDialog(false)
    setIsLoading(true)
    setError(null)
    setFormData((prev) => ({ ...prev, roundOff: roundoffValue }))
    try {
      const response = await signupCompany({ ...formData, roundOff: roundoffValue })
      storeAuthData(response.data.token, response.data.user)
      // Redirect based on role, benchmarking from login
      const roleName = getUserRole() || ""
      if (roleName === "Super Admin") {
        router.push("/dashboard/super-admin/companies")
      } else if (roleName === "Company Admin") {
        router.push("/dashboard/company-admin")
      } else if (["Consultant", "Employee", "Consultancy"].includes(roleName)) {
        router.push("/dashboard/employee")
      } else {
        router.push("/dashboard/employee")
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "An error occurred during signup")
    } finally {
      setIsLoading(false)
      setPendingSubmit(false)
    }
  }

  useEffect(() => {
    getCurrencies(setLoadingCurrencies, setCurrencies)
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-pale dark:bg-gray-900 bg-card">
      {/* Split layout */}
      <div className="flex sm:w-[90vw] sm:min-h-[80vh] w-[93vw] bg-paper rounded-2xl shadow-lg shadow-gray-100  dark:shadow-gray-900 overflow-hidden relative z-10">
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
        <div className="flex-1 flex  max-h-[80vh] overflow-auto flex-col justify-center items-center">
          <div className="w-full px-[2rem] sm:px-[6rem]  overflow-auto h-full py-[3rem]">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary">Create Company Account</h1>
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
      {/* Roundoff Dialog */}
      <Dialog open={showRoundoffDialog} onOpenChange={setShowRoundoffDialog}>
        <DialogContent>



          <DialogHeader>
            <DialogTitle>Round Off Figures?</DialogTitle>
            <DialogDescription>
              Would you like to round off figures in your company account? This can be changed later in settings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => handleRoundoffChoice(true)} disabled={isLoading || !formData.currency}>
              Yes
            </Button>
            <Button variant="outline" onClick={() => handleRoundoffChoice(false)} disabled={isLoading || !formData.currency}>
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
