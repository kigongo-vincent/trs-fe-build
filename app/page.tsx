"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/mode-toggle"
import { login, storeAuthData, getUserRole, isAuthenticated } from "@/services/auth"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import LogoLight from "@/assets/logo-light.png"

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuthentication = () => {
      if (typeof window !== "undefined") {
        if (isAuthenticated()) {
          // Check for departmentHeadId in stored user
          const storedUser = localStorage.getItem("user");
          let parsedUser = null;
          try {
            parsedUser = storedUser ? JSON.parse(storedUser) : null;
          } catch (e) {
            parsedUser = null;
          }
          if (parsedUser && parsedUser.departmentHead && parsedUser.departmentHead.name) {
            router.replace("/dashboard/department-head");
          } else if (parsedUser && parsedUser.departmentHeadId) {
            router.replace("/dashboard/department-head");
          } else {
            // fallback to default dashboard
            router.replace("/dashboard/profile?section=personal");
          }
          return;
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await login(formData)

      // Store auth data
      if (response?.data?.user?.departmentHead?.id) {
        response.data.user.role.name = "Department Admin"
      }

      // Override role for specific email to freelancer
      if (response?.data?.user?.email === "kigongovincent625+andrew@gmail.com") {
        response.data.user.role.name = "Freelancer"
      }

      storeAuthData(response.data.token, response.data.user)

      // Redirect based on departmentHeadId or role
      const user = response.data.user;
      if (user.departmentHead && user.departmentHead.name) {
        router.push("/dashboard/department-head");
      } else if (user.departmentHead) {
        router.push("/dashboard/department-head");
      } else {
        const roleName = user.role.name;
        if (roleName === "Super Admin") {
          router.push("/dashboard/super-admin/companies");
        } else if (roleName === "Company Admin") {
          router.push("/dashboard/company-admin");
        } else if (roleName === "Board Member") {
          router.push("/dashboard/company-admin");
        } else if (["Consultant", "Employee", "Consultancy"].includes(roleName)) {
          router.push("/dashboard/employee");
        } else if (roleName === "Freelancer") {
          router.push("/dashboard/freelancer/companies");
        } else {
          router.push("/dashboard/employee");
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      // Show the actual server error message if available, otherwise show generic message
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-pale dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-pale dark:bg-gray-900">
      {/* Split layout */}
      <div className="flex md:w-[80vw] md:min-h-[80vh] w-[90vw] sm:p-0 py-[2rem]  bg-paper dark:bg-card rounded-2xl   overflow-hidden relative z-10">
        {/* Left: Image + testimonial */}
        <div className="hidden md:flex flex-col justify-between w-[50%] bg-black/40 relative">
          <Image
            src="https://images.pexels.com/photos/4050430/pexels-photo-4050430.jpeg"
            alt="Login background"
            fill
            className="object-cover object-center absolute inset-0 -z-10"
            priority
          />
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white drop-shadow">Task Reporting System</span>
            </div>
          </div>
          {/* Testimonial */}

        </div>
        {/* Right: Login form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-md">
            <Image className="h-[5.5vh] mb-[2rem] w-max" style={{
              mixBlendMode: "multiply"
            }} src={LogoLight} alt="TRS" priority />
            <h1 className="text-2xl md:text-2xl font-semibold mb-2">Welcome back to TRS</h1>
            <p className="text-gray-500 mb-8 text-sm">Log in to manage your team and tasks efficiently.</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="mb-1">Email</Label>
                <Input
                  id="email"
                  name="email"
                  autoComplete="off"
                  type="email"
                  placeholder="alex.jordan@gmail.com"
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
                    autoComplete="off"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-primary text-sm font-medium hover:underline">Forgot password?</Link>
              </div>
              <Button className="w-full text-base font-semibold py-2.5" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
            <div className="text-center text-sm mt-6 text-muted-foreground">
              Don't have an account?{' '}
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                <Link href="/signup/company" className="text-primary font-medium hover:underline">Company Signup</Link>
                <span className="hidden sm:inline">or</span>
                <Link href="/signup/freelancer" className="text-primary font-medium hover:underline">Freelancer Signup</Link>
              </div>
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
