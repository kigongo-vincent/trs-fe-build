"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, UserPlus, Calendar as CalendarIcon, Banknote } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getRequest, postRequest } from "@/services/api"
import { getAuthData } from "@/services/auth"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import "react-phone-input-2/lib/style.css"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FileAttachment, type Attachment } from "@/components/file-attachment"
import { uploadFile } from "@/services/upload"
import { toast } from "sonner"
import { CurrencyI, getCurrencies } from "@/services/getCurrencies"

// Interface for department data
interface Department {
  id: string
  name: string
  head: string
  createdAt: string | null
  updatedAt: string
  users: any[]
}

// Interface for API response
interface DepartmentsResponse {
  status: number
  message: string
  data: Department[]
}

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false })

export default function AddConsultantPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    departmentId: "",
    jobTitle: "",
    grossPay: "",
    dateOfBirth: "",
    daysToCome: [] as string[],
    // Next of kin
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinPhone: "",
    nextOfKinEmail: "",
    // Address
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressCountry: "",
    addressPostalCode: "",
    // Bank details
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankSwiftCode: "",
    bankBranch: "",
    phoneNumber: "",
    currency: "USD",
    nin: "",
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [currencies, setCurrencies] = useState<CurrencyI[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(false)
  // Consultant role ID
  const consultantRoleId = "0728a760-9495-4c9b-850b-d1f4ca5gb707"

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const [daysInput, setDaysInput] = useState("")
  const [daysDropdownOpen, setDaysDropdownOpen] = useState(false)
  const daysInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      try {
        const authData = getAuthData()
        if (!authData || !authData.user || !authData.user.company) {
          throw new Error("Authentication data not found. Please log in again.")
        }

        const companyId = authData.user.company.id
        console.log(":: companyId ::", companyId)
        const response = await getRequest<DepartmentsResponse>(`/departments/company/${companyId}`)
        setDepartments(response.data)
      } catch (err: any) {
        console.error("Error fetching departments:", err)
        toast.error(err.message || "Failed to fetch departments. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, departmentId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.fullName.trim()) {
      toast.error("Full name is required")
      return
    }
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }
    if (!formData.jobTitle.trim()) {
      toast.error("Job title is required")
      return
    }
    if (!formData.grossPay.trim() || isNaN(Number(formData.grossPay))) {
      toast.error("Gross pay is required and must be a number")
      return
    }
    if (!formData.dateOfBirth.trim()) {
      toast.error("Date of birth is required")
      return
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Phone number is required")
      return
    }
    // Basic phone number validation - should have at least 10 digits
    const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      toast.error("Please enter a valid phone number with at least 10 digits")
      return
    }
    if (formData.daysToCome.length === 0) {
      toast.error("Please select at least one day")
      return
    }
    if (!formData.addressStreet.trim()) {
      toast.error("Street address is required")
      return
    }
    if (!formData.addressCity.trim()) {
      toast.error("City is required")
      return
    }
    if (!formData.addressCountry.trim()) {
      toast.error("Country is required")
      return
    }
    if (!formData.addressState.trim()) {
      toast.error("State is required")
      return
    }
    if (!formData.addressPostalCode.trim()) {
      toast.error("Postal code is required")
      return
    }
    if (!formData.departmentId) {
      toast.error("Department is required")
      return
    }
    if (!formData.nextOfKinName.trim() || !formData.nextOfKinPhone.trim() || !formData.nextOfKinRelationship.trim()) {
      toast.error("Next of Kin details are required")
      return
    }
    if (!formData.bankAccountName.trim() || !formData.bankAccountNumber.trim() || !formData.bankName.trim() || !formData.bankBranch.trim()) {
      toast.error("Bank details are required")
      return
    }

    setSubmitting(true)

    try {
      const authData = getAuthData()
      if (!authData || !authData.user || !authData.user.company) {
        throw new Error("Authentication data not found. Please log in again.")
      }

      const companyId = authData.user.company.id

      // Separate file and url attachments
      const fileAttachments = attachments.filter(a => a.type === "file" && a.file) as (Attachment & { file: File })[]

      // Convert files to base64
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const match = result.match(/^data:([^;]+);base64,(.*)$/);
            if (match) {
              const mimetype = match[1];
              const data = match[2];
              resolve(`data:${mimetype};name=${file.name};base64,${data}`);
            } else {
              reject(new Error("Invalid base64 format"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      const attachmentsBase64 = await Promise.all(fileAttachments.map(a => toBase64(a.file)));

      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        departmentId: formData.departmentId,
        roleId: consultantRoleId,
        companyId: companyId,
        job_title: formData.jobTitle,
        gross_pay: formData.grossPay,
        phoneNumber: formData.phoneNumber.trim(),
        currency: formData.currency,
        attachments: attachmentsBase64.length > 0 ? attachmentsBase64 : undefined,
      }

      // Only add date_of_birth if it has a value
      if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
        payload.date_of_birth = new Date(formData.dateOfBirth).toISOString()
      }

      // Only add days_to_come if it has values
      if (formData.daysToCome.length > 0) {
        payload.days_to_come = JSON.stringify(formData.daysToCome)
      }

      // Only add next_of_kin if any field has a value
      if (formData.nextOfKinName.trim() || formData.nextOfKinRelationship.trim() || formData.nextOfKinPhone.trim() || formData.nextOfKinEmail.trim()) {
        payload.next_of_kin = {}
        if (formData.nextOfKinName.trim()) payload.next_of_kin.name = formData.nextOfKinName.trim()
        if (formData.nextOfKinRelationship.trim()) payload.next_of_kin.relationship = formData.nextOfKinRelationship.trim()
        if (formData.nextOfKinPhone.trim()) payload.next_of_kin.phoneNumber = formData.nextOfKinPhone.trim()
        if (formData.nextOfKinEmail.trim()) payload.next_of_kin.email = formData.nextOfKinEmail.trim()
      }

      // Only add address if required fields have values
      if (formData.addressStreet.trim() || formData.addressCity.trim() || formData.addressState.trim() || formData.addressCountry.trim() || formData.addressPostalCode.trim()) {
        payload.address = {}
        if (formData.addressStreet.trim()) payload.address.street = formData.addressStreet.trim()
        if (formData.addressCity.trim()) payload.address.city = formData.addressCity.trim()
        if (formData.addressState.trim()) payload.address.state = formData.addressState.trim()
        if (formData.addressCountry.trim()) payload.address.country = formData.addressCountry.trim()
        if (formData.addressPostalCode.trim()) payload.address.postalCode = formData.addressPostalCode.trim()
      }

      // Only add bank_details if any field has a value
      if (formData.bankAccountName.trim() || formData.bankAccountNumber.trim() || formData.bankName.trim() || formData.bankSwiftCode.trim() || formData.bankBranch.trim()) {
        payload.bank_details = {}
        if (formData.bankAccountName.trim()) payload.bank_details.accountName = formData.bankAccountName.trim()
        if (formData.bankAccountNumber.trim()) payload.bank_details.accountNumber = formData.bankAccountNumber.trim()
        if (formData.bankName.trim()) payload.bank_details.bankName = formData.bankName.trim()
        if (formData.bankSwiftCode.trim()) payload.bank_details.swiftCode = formData.bankSwiftCode.trim()
        if (formData.bankBranch.trim()) payload.bank_details.branch = formData.bankBranch.trim()
      }

      await postRequest("/auth/signup", payload)
      // Immediately redirect back to the consultants list
      router.push("/dashboard/company-admin/consultants")
    } catch (err: any) {
      console.error("Error creating consultant:", err)
      toast.error(err.message || "Failed to create consultant. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    getCurrencies(setLoadingCurrencies, setCurrencies)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/company-admin/consultants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Add New Consultant</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultant Information</CardTitle>
          <CardDescription>
            Add a new consultant to your company. They will receive an email with instructions to set up their account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input id="fullName" name="fullName" placeholder="Enter consultant's full name" value={formData.fullName} onChange={handleInputChange} required />
                <p className="text-sm text-muted-foreground">Enter the consultant's full name as it should appear in the system.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input id="email" name="email" type="email" required placeholder="consultant@example.com" value={formData.email} onChange={handleInputChange} />
                <p className="text-sm text-muted-foreground">The consultant will use this email to log in to the system.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                <div className="w-full">
                  <PhoneInput country={"us"} value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} inputProps={{ name: "phoneNumber", required: true, autoFocus: false }} inputClass="w-full !w-full h-10 !h-10 !pl-12 !pr-3 !rounded-md !border !border-input !bg-transparent !text-base !focus:outline-none !focus:ring-2 !focus:ring-ring !focus:ring-offset-2 !dark:!text-white !text-[#181c32]" buttonClass="!border-none !bg-transparent" dropdownClass="!bg-background dark:!bg-[#23272f] !text-base custom-phone-dropdown-shadow" enableSearch disableSearchIcon={false} specialLabel="" />
                </div>
                <p className="text-sm text-muted-foreground">Consultant's phone number with country code.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required style={{ width: 'max-content' }} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <Select value={formData.departmentId} onValueChange={handleDepartmentChange}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading departments...</span>
                      </div>
                    ) : departments.length === 0 ? (
                      <div className="py-2 px-2 text-sm">No departments found</div>
                    ) : (
                      departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Assign the consultant to a department within your company.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Role <span className="text-red-500">*</span></Label>
                <Input id="jobTitle" name="jobTitle" placeholder="e.g. Senior Software Engineer" value={formData.jobTitle} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label>Days to Come <span className="text-red-500">*</span></Label>
                <div className="px-2 py-1 flex flex-wrap items-center h-10 min-h-[40px] bg-transparent border border-[#e3e6ed] rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" onClick={() => daysInputRef.current?.focus()} tabIndex={0}>
                  {formData.daysToCome.map((day) => (
                    <span key={day} className="flex items-center gap-2 rounded-md bg-[#f5f7fa] dark:bg-[#23272f] px-3 py-0 h-8 mr-2 text-[#181c32] dark:text-[#f5f7fa] text-sm shadow-none border-none font-normal">
                      {day}
                      <button type="button" className="ml-1 text-lg text-[#181c32] dark:text-[#f5f7fa] hover:text-red-500 focus:outline-none bg-transparent border-none p-0 cursor-pointer font-normal" aria-label={`Remove ${day}`} onClick={(e) => { e.stopPropagation(); setFormData((prev) => ({ ...prev, daysToCome: prev.daysToCome.filter((d) => d !== day) })) }}>×</button>
                    </span>
                  ))}
                  <input ref={daysInputRef} className="flex-1 min-w-[80px] h-8 border-none outline-none bg-transparent py-0 px-2 text-base" placeholder={formData.daysToCome.length === 0 ? "Type or select days..." : ""} value={daysInput} onChange={(e) => { setDaysInput(e.target.value); setDaysDropdownOpen(true); }} onFocus={() => setDaysDropdownOpen(true)} onBlur={() => setTimeout(() => setDaysDropdownOpen(false), 100)} onKeyDown={(e) => { if (e.key === "Backspace" && daysInput === "" && formData.daysToCome.length > 0) { setFormData((prev) => ({ ...prev, daysToCome: prev.daysToCome.slice(0, -1) })); } if ((e.key === "Enter" || e.key === ",") && daysInput.trim()) { e.preventDefault(); const val = daysInput.trim(); if (daysOfWeek.includes(val) && !formData.daysToCome.includes(val)) { setFormData((prev) => ({ ...prev, daysToCome: [...prev.daysToCome, val] })); setDaysInput(""); setDaysDropdownOpen(false); } } }} list="days-suggestions" />
                </div>
                {daysDropdownOpen && daysOfWeek.filter((day) => day.toLowerCase().includes(daysInput.toLowerCase()) && !formData.daysToCome.includes(day)).length > 0 && (
                  <div className="border border-input rounded-md mt-1 bg-background shadow-lg absolute z-10 w-[260px]">
                    {daysOfWeek.filter((day) => day.toLowerCase().includes(daysInput.toLowerCase()) && !formData.daysToCome.includes(day)).map((day) => (
                      <div key={day} className="px-3 py-2 cursor-pointer hover:bg-accent" onMouseDown={() => { setFormData((prev) => ({ ...prev, daysToCome: [...prev.daysToCome, day] })); setDaysInput(""); setDaysDropdownOpen(false); }}>{day}</div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Select the days the consultant is expected to come in.</p>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-2">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input id="addressStreet" name="addressStreet" placeholder="Street" value={formData.addressStreet} onChange={handleInputChange} required />
                <Input id="addressCity" name="addressCity" placeholder="City" value={formData.addressCity} onChange={handleInputChange} required />
                <Input id="addressState" name="addressState" placeholder="State" value={formData.addressState} onChange={handleInputChange} required />
                <Input id="addressCountry" name="addressCountry" placeholder="Country" value={formData.addressCountry} onChange={handleInputChange} required />
                <Input id="addressPostalCode" name="addressPostalCode" placeholder="Postal Code" value={formData.addressPostalCode} onChange={handleInputChange} required />
              </div>
            </div>

            {/* Compensation */}
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-2">Compensation</h2>
              <div className="flex w-full gap-2">
                <Select value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger className="w-28 min-w-[5.5rem] rounded-md border border-input bg-background dark:bg-[#181c32] text-base focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      loadingCurrencies
                        ?
                        <span>Fetching currencies...</span>
                        :
                        currencies.length == 0
                          ?
                          <span>No currencies found</span>
                          :
                          currencies.map((c, i) => <SelectItem key={i} value={c.code}>
                            <div className="flex items-center space-x-3">
                              {c.code != "USD" ? <img src={c.logo} className="h-5 w-5" alt="" /> : <p className="text-2xl">🇱🇷</p>} <span>{c.code}</span>
                            </div>
                          </SelectItem>)
                    }

                  </SelectContent>
                </Select>
                <Input id="grossPay" name="grossPay" type="number" placeholder="e.g. 75000" value={formData.grossPay} onChange={handleInputChange} required className="flex-1 rounded-md border border-input bg-background dark:bg-[#181c32] text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
              </div>
              <p className="text-sm text-muted-foreground">Enter the consultant's salary and select the currency.</p>
            </div>

            {/* ID Documents */}
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-2">ID Documents</h2>
              <FileAttachment attachments={attachments} onAttachmentsChange={setAttachments} maxFiles={5} acceptedFileTypes={["application/pdf"]} autoUpload={false} showUrlInput={false} />
              <p className="text-sm text-muted-foreground">You may upload up to 5 PDF files of the consultant's identification documents (e.g., passport, national ID, driver's license).</p>
            </div>

            {/* Next of Kin (optional) */}
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-2">Next of Kin</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input id="nextOfKinName" name="nextOfKinName" placeholder="Name" value={formData.nextOfKinName} onChange={handleInputChange} />
                <Input id="nextOfKinRelationship" name="nextOfKinRelationship" placeholder="Relationship" value={formData.nextOfKinRelationship} onChange={handleInputChange} />
                <div className="w-full">
                  <PhoneInput country={"us"} value={formData.nextOfKinPhone} onChange={(value) => setFormData((prev) => ({ ...prev, nextOfKinPhone: value }))} inputProps={{ name: "nextOfKinPhone", autoFocus: false }} inputClass="w-full !w-full h-10 !h-10 !pl-12 !pr-3 !rounded-md !border !border-input !bg-transparent !text-base !focus:outline-none !focus:ring-2 !focus:ring-ring !focus:ring-offset-2 !dark:!text-white !text-[#181c32]" buttonClass="!border-none !bg-transparent" dropdownClass="!bg-background dark:!bg-[#23272f] !text-base custom-phone-dropdown-shadow" enableSearch disableSearchIcon={false} specialLabel="" />
                </div>
                <Input id="nextOfKinEmail" name="nextOfKinEmail" placeholder="Email (optional)" value={formData.nextOfKinEmail} onChange={handleInputChange} />
              </div>
            </div>

            {/* Bank Details (optional) */}
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold mb-2">Bank Details </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccountName">Account Name</Label>
                  <Input id="bankAccountName" name="bankAccountName" placeholder="e.g. John Doe" value={formData.bankAccountName} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input id="bankAccountNumber" name="bankAccountNumber" placeholder="e.g. 1234567890" value={formData.bankAccountNumber} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" name="bankName" placeholder="e.g. Tech Bank" value={formData.bankName} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="bankSwiftCode">SWIFT Code</Label>
                  <Input id="bankSwiftCode" name="bankSwiftCode" placeholder="e.g. TECH123456" value={formData.bankSwiftCode} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="bankBranch">Branch</Label>
                  <Input id="bankBranch" name="bankBranch" placeholder="e.g. Kampala Main Branch" value={formData.bankBranch || ""} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/company-admin/consultants">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Consultant
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
