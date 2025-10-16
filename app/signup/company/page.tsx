"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Building2, User, DollarSign, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const STEPS = [
  { id: 1, title: "Company" },
  { id: 2, title: "Admin" },
  { id: 3, title: "Settings" }
]

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
  currency: string
  roundOff?: boolean
}

export default function CompanySignup() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    sector: "",
    fullName: "",
    email: "",
    password: "",
    currency: "USD",
    roundOff: undefined,
  })
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string>("")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD")
  const [showRoundoffDialog, setShowRoundoffDialog] = useState(false)
  const [currencies, setCurrencies] = useState<CurrencyI[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(false)

  const totalSteps = 3

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSectorSelect = (value: string) => {
    const selected = sectors.find((sector) => sector.value === value)
    if (selected) {
      setFormData((prev) => ({ ...prev, sector: selected.label }))
      setSelectedSector(selected.label)
    }
    setOpen(false)
    setError(null)
  }

  const handleCurrencySelect = (value: string) => {
    setFormData((prev) => ({ ...prev, currency: value }))
    setSelectedCurrency(value)
    setError(null)
  }

  const validateStep = (step: number) => {
    setError(null)

    if (step === 1) {
      if (!formData.name.trim()) {
        setError("Please enter your company name")
        return false
      }
      if (!formData.sector) {
        setError("Please select a company sector")
        return false
      }
    }

    if (step === 2) {
      if (!formData.fullName.trim()) {
        setError("Please enter your full name")
        return false
      }
      if (!formData.email.trim()) {
        setError("Please enter your email")
        return false
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address")
        return false
      }
      if (!formData.password) {
        setError("Please enter a password")
        return false
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters")
        return false
      }
    }

    if (step === 3) {
      if (!formData.currency) {
        setError("Please select a currency")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }
    setShowRoundoffDialog(true)
  }

  const handleRoundoffChoice = async (roundoffValue: boolean) => {
    setShowRoundoffDialog(false)
    setIsLoading(true)
    setError(null)
    setFormData((prev) => ({ ...prev, roundOff: roundoffValue }))

    try {
      const response = await signupCompany({ ...formData, roundOff: roundoffValue })
      storeAuthData(response.data.token, response.data.user)

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
      setShowRoundoffDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getCurrencies(setLoadingCurrencies, setCurrencies)
  }, [])

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center mb-4 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold">Company Signup</h2>
              <p className="text-muted-foreground text-base mt-3">Let's start with your company details</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-medium">Company Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your Company Ltd"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="sector" className="text-base font-medium">Company Sector</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-12 text-base", !selectedSector && "text-muted-foreground")}
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
          </div>
        )

      case 2:
        return (
          <div className="space-y-4 md:space-y-5">
            <div className="text-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold">Admin Details</h2>
              <p className="text-muted-foreground text-sm mt-2">Create your admin account</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pr-10"
                  placeholder="At least 8 characters"
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
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 md:space-y-5">
            <div className="text-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-primary">Financial Settings</h2>
              <p className="text-muted-foreground text-sm mt-2">You're almost there! Confirm your financial configuration to determine invoice values.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <Select value={selectedCurrency} onValueChange={handleCurrencySelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }

  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-pale dark:bg-gray-900 bg-card p-4">
      <div className="flex flex-col md:flex-row w-full max-w-7xl min-h-[90vh] md:min-h-[85vh] bg-paper rounded-2xl shadow-lg shadow-gray-100 dark:shadow-gray-900 overflow-hidden relative z-10">
        {/* Left: Image + testimonial - Desktop */}
        <div className="hidden md:flex flex-col justify-between w-full md:w-[45%] lg:w-[50%] bg-black/40 dark:bg-black/60 relative">
          <Image
            src="https://images.pexels.com/photos/3727463/pexels-photo-3727463.jpeg"
            alt="Signup background"
            fill
            className="object-cover object-center absolute inset-0 -z-10"
            priority
          />
          <div className="p-6">
            <span className="text-lg font-bold text-white drop-shadow">Task Reporting System</span>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center py-4 px-6 bg-primary text-primary-foreground rounded-t-2xl">
          <span className="text-lg font-bold">Task Reporting System</span>
        </div>

        {/* Signup form */}
        <div className="flex-1 flex overflow-auto flex-col justify-center items-center p-4 md:p-12 relative z-10">
          <div className="w-full max-w-lg flex flex-col justify-center overflow-auto py-4 md:py-0">


            <div className="space-y-3 md:space-y-8">
              {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

              {renderStepContent()}

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 order-2 sm:order-1 h-12 text-base"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 order-1 sm:order-2 h-12 text-base"
                    disabled={isLoading}
                  >
                    {currentStep === 1 ? "Continue to Admin Details" :
                      currentStep === 2 ? "Continue to Settings" : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 order-1 sm:order-2 h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="text-center text-sm mt-3 md:mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 bottom-4 md:bottom-8 -translate-x-1/2 z-20">
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
            <Button variant="outline" onClick={() => handleRoundoffChoice(false)} disabled={isLoading}>
              No
            </Button>
            <Button onClick={() => handleRoundoffChoice(true)} disabled={isLoading}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
