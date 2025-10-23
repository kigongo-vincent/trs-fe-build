"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Building2, User, DollarSign, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signupFreelancer, storeAuthData, getUserRole } from "@/services/auth"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const STEPS = [
    { id: 1, title: "Account Type" },
    { id: 2, title: "Personal" },
    { id: 3, title: "Settings" }
]

interface FormData {
    accountType: string
    fullName: string
    email: string
    password: string
    currency: string
    roundOff?: boolean
    name: string
    sector: string
}

export default function FreelancerSignup() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormData>({
        accountType: "freelancer",
        fullName: "",
        email: "",
        password: "",
        currency: "USD",
        roundOff: undefined,
        name: "",
        sector: "freelancer"
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showRoundoffDialog, setShowRoundoffDialog] = useState(false)

    const totalSteps = 3

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError(null)
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError(null)
    }

    const validateStep = (step: number) => {
        setError(null)

        if (step === 1) {
            if (!formData.accountType) {
                setError("Please select an account type")
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
            const response = await signupFreelancer({
                ...formData,
                name: formData.fullName,
                roundOff: roundoffValue
            })
            storeAuthData(response.data.token, response.data.user)

            const roleName = getUserRole() || ""
            if (roleName === "Freelancer") {
                router.push("/dashboard/freelancer")
            } else {
                router.push("/dashboard/freelancer")
            }
        } catch (err: any) {
            console.error("Signup error:", err)
            setError(err.message || "An error occurred during signup")
            setShowRoundoffDialog(false)
        } finally {
            setIsLoading(false)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4 md:space-y-6">
                        <div className="text-center mb-4 md:mb-8">
                            <h2 className="text-xl md:text-2xl font-semibold">Choose Account Type</h2>
                            <p className="text-muted-foreground text-base mt-3">Select how you want to use the platform</p>
                        </div>

                        <div className="space-y-4">
                            <div
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${formData.accountType === 'freelancer'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => setFormData(prev => ({ ...prev, accountType: 'freelancer' }))}
                            >
                                <div className="flex items-center space-x-3">
                                    <User className="h-6 w-6 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">Freelancer</h3>
                                        <p className="text-sm text-gray-600">Work independently, manage clients and projects</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${formData.accountType === 'company'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => setFormData(prev => ({ ...prev, accountType: 'company' }))}
                            >
                                <div className="flex items-center space-x-3">
                                    <Building2 className="h-6 w-6 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">Company</h3>
                                        <p className="text-sm text-gray-600">Manage employees, departments and projects</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-4 md:space-y-5">
                        <div className="text-center mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl font-semibold">
                                {formData.accountType === 'freelancer' ? 'Personal Details' : 'Admin Details'}
                            </h2>
                            <p className="text-muted-foreground text-sm mt-2">
                                {formData.accountType === 'freelancer' ? 'Create your freelancer account' : 'Create your admin account'}
                            </p>
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
                            <p className="text-muted-foreground text-sm mt-2">
                                {formData.accountType === 'freelancer'
                                    ? 'Configure your billing preferences'
                                    : 'Configure your company\'s financial settings'
                                }
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                            <select
                                id="currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleSelectChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                                <option value="AUD">AUD - Australian Dollar</option>
                                <option value="UGX">UGX - Ugandan Shilling</option>
                                <option value="KES">KES - Kenyan Shilling</option>
                                <option value="TZS">TZS - Tanzanian Shilling</option>
                                <option value="NGN">NGN - Nigerian Naira</option>
                                <option value="ZAR">ZAR - South African Rand</option>
                                <option value="GHS">GHS - Ghanaian Cedi</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                                <option value="CNY">CNY - Chinese Yuan</option>
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="BRL">BRL - Brazilian Real</option>
                            </select>
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
                                        {currentStep === 1 ? "Continue to Personal Details" :
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
                            Would you like to round off figures in your account? This can be changed later in settings.
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
