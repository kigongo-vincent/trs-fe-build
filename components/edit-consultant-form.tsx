import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getRequest, putRequest } from "@/services/api"
import { getAuthData } from "@/services/auth"
import dynamic from "next/dynamic"
import { FileAttachment, type Attachment } from "@/components/file-attachment"
import { uploadFile } from "@/services/upload"
import "react-phone-input-2/lib/style.css"
import { toast } from "sonner"
import { CurrencyI, getCurrencies } from "@/services/getCurrencies"

interface Department {
    id: string
    name: string
    head: string
    createdAt: string | null
    updatedAt: string
    users: any[]
}

interface EditConsultantFormProps {
    consultant: any
    onClose: () => void
    onUpdated: () => void
}

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false })

export const EditConsultantForm: React.FC<EditConsultantFormProps> = ({ consultant, onClose, onUpdated }) => {

    const [totalWorkingHours, setTotalWorkingHours] = useState(0)
    useLayoutEffect(() => {
        setTotalWorkingHours(consultant?.totalHoursPerMonth ?? 0)
    }, [])


    const [formData, setFormData] = useState({

        type: consultant?.type,
        fullName: consultant.fullName || consultant.full_name || "",
        email: consultant.email || "",
        departmentId: consultant.departmentId || consultant.department?.id || "",
        jobTitle: consultant.jobTitle || consultant.job_title || "",
        grossPay: consultant.grossPay || consultant.gross_pay || "",
        dateOfBirth: (consultant.dateOfBirth || consultant.date_of_birth) ? (consultant.dateOfBirth || consultant.date_of_birth).split("T")[0] : "",
        daysToCome: Array.isArray(consultant.days_to_come)
            ? consultant.days_to_come
            : consultant.days_to_come
                ? JSON.parse(consultant.days_to_come)
                : Array.isArray(consultant.officeDays)
                    ? consultant.officeDays
                    : consultant.officeDays
                        ? JSON.parse(consultant.officeDays)
                        : consultant.daysToCome || [],
        nextOfKinName: consultant.nextOfKin?.name || (consultant.next_of_kin && consultant.next_of_kin.name) || "",
        nextOfKinRelationship: consultant.nextOfKin?.relationship || (consultant.next_of_kin && consultant.next_of_kin.relationship) || "",
        nextOfKinPhone: consultant.nextOfKin?.phoneNumber || (consultant.next_of_kin && consultant.next_of_kin.phoneNumber) || "",
        nextOfKinEmail: consultant.nextOfKin?.email || (consultant.next_of_kin && consultant.next_of_kin.email) || "",
        addressStreet: consultant.address?.street || "",
        addressCity: consultant.address?.city || "",
        addressState: consultant.address?.state || "",
        addressCountry: consultant.address?.country || "",
        addressPostalCode: consultant.address?.postalCode || "",
        bankAccountName: consultant.bankDetails?.accountName || (consultant.bank_details && consultant.bank_details.accountName) || "",
        bankAccountNumber: consultant.bankDetails?.accountNumber || (consultant.bank_details && consultant.bank_details.accountNumber) || "",
        bankName: consultant.bankDetails?.bankName || (consultant.bank_details && consultant.bank_details.bankName) || "",
        bankSwiftCode: consultant.bankDetails?.swiftCode || (consultant.bank_details && consultant.bank_details.swiftCode) || "",
        bankBranch: consultant.bankDetails?.branch || (consultant.bank_details && consultant.bank_details.branch) || "",
        phoneNumber: consultant.phoneNumber || "",
        currency: consultant.currency || "USD",
        nin: consultant.nin || "",
        totalWorkingHours: consultant
    })
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [attachments, setAttachments] = useState<Attachment[]>([])

    // Days to Come logic
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
                const response = await getRequest(`/departments/company/${companyId}`)
                setDepartments((response as any).data)
            } catch (err: any) {
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
        setSuccess(null)
        // Validation (reuse from add)
        if (!formData.fullName.trim()) {
            toast.error("Full name is required")
            return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(formData.email.trim())) {
            toast.error("Please enter a valid email address")
            return
        }

        if (!formData.email.includes("@")) {
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
        setSubmitting(true)
        try {
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
            // No separate upload, just add base64 strings to payload
            const payload: any = {
                // camelCase fields
                fullName: formData.fullName,
                email: formData.email,
                jobTitle: formData.jobTitle,
                grossPay: formData.grossPay,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
                phoneNumber: formData.phoneNumber.startsWith('+')
                    ? formData.phoneNumber.trim()
                    : `+${formData.phoneNumber.trim()}`,
                currency: formData.currency,
                departmentId: formData.departmentId,
                totalHoursPerMonth: totalWorkingHours,
                // snake_case fields
                job_title: formData.jobTitle,
                gross_pay: formData.grossPay,
                type: formData.type?.toString(),
                date_of_birth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
                days_to_come: formData.daysToCome.length > 0 ? JSON.stringify(formData.daysToCome) : null,
                // nested fields
                address: (formData.addressStreet || formData.addressCity || formData.addressState || formData.addressCountry || formData.addressPostalCode) ? {
                    street: formData.addressStreet,
                    city: formData.addressCity,
                    state: formData.addressState,
                    country: formData.addressCountry,
                    postalCode: formData.addressPostalCode,
                } : null,
                nextOfKin: (formData.nextOfKinName || formData.nextOfKinRelationship || formData.nextOfKinPhone || formData.nextOfKinEmail) ? {
                    name: formData.nextOfKinName,
                    relationship: formData.nextOfKinRelationship,
                    phoneNumber: formData.nextOfKinPhone.startsWith('+')
                        ? formData.nextOfKinPhone
                        : `+${formData.nextOfKinPhone}`,
                    email: formData.nextOfKinEmail,
                } : null,
                bankDetails: (formData.bankAccountName || formData.bankAccountNumber || formData.bankName || formData.bankSwiftCode || formData.bankBranch) ? {
                    accountName: formData.bankAccountName,
                    accountNumber: formData.bankAccountNumber,
                    bankName: formData.bankName,
                    swiftCode: formData.bankSwiftCode,
                    branch: formData.bankBranch,
                } : null,
                // Attachments, officeDays, etc.
                attachments: attachmentsBase64.length > 0 ? attachmentsBase64 : undefined,
                officeDays: formData.daysToCome.length > 0 ? formData.daysToCome : null,
            }
            // Remove empty/null fields
            Object.keys(payload).forEach(key => (payload[key] === null || payload[key] === undefined) && delete payload[key]);
            // Use PUT for update, endpoint: /company/consultants/{companyId}/{consultantId}
            const authData = getAuthData();
            if (!authData || !authData.user || !authData.user.company) {
                throw new Error("Authentication data not found. Please log in again.");
            }
            const companyId = authData.user.company.id;
            await putRequest(`/company/consultants/${companyId}/${consultant.id}`, payload)
            setSuccess("Consultant updated successfully!")
            onUpdated()
        } catch (err: any) {
            toast.error(err.message || "Failed to update consultant. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const [currencies, setCurrencies] = useState<CurrencyI[]>([])
    const [loadingCurrencies, setLoadingCurrencies] = useState(false)

    useEffect(() => {
        getCurrencies(setLoadingCurrencies, setCurrencies)
    }, [])

    return (
        <div className="flex flex-col overflow-hidden gap-6">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-xl text-gradient">Edit Consultant Information</CardTitle>
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
                                <Input id="email" name="email" type="email" placeholder="consultant@example.com" value={formData.email} onChange={handleInputChange} required />
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
                                <Label htmlFor="department">Department <span className="text-muted-foreground">(optional)</span></Label>
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
                                    {formData.daysToCome.map((day: string) => (
                                        <span key={day} className="flex items-center gap-2 rounded-md bg-pale dark:bg-[#23272f] px-3 py-0 h-8 mr-2 text-[#181c32] dark:text-[#f5f7fa] text-sm shadow-none border-none font-normal">
                                            {day}
                                            <button type="button" className="ml-1 text-lg text-[#181c32] dark:text-[#f5f7fa] hover:text-red-500 focus:outline-none bg-transparent border-none p-0 cursor-pointer font-normal" aria-label={`Remove ${day}`} onClick={(e) => { e.stopPropagation(); setFormData((prev) => ({ ...prev, daysToCome: prev.daysToCome.filter((d: string) => d !== day) })) }}>×</button>
                                        </span>
                                    ))}
                                    <input ref={daysInputRef} className="flex-1 min-w-[80px] h-8 border-none outline-none bg-transparent py-0 px-2 text-base" placeholder={formData.daysToCome.length === 0 ? "Type or select days..." : ""} value={daysInput} onChange={(e) => { setDaysInput(e.target.value); setDaysDropdownOpen(true); }} onFocus={() => setDaysDropdownOpen(true)} onBlur={() => setTimeout(() => setDaysDropdownOpen(false), 100)} onKeyDown={(e) => { if (e.key === "Backspace" && daysInput === "" && formData.daysToCome.length > 0) { setFormData((prev) => ({ ...prev, daysToCome: prev.daysToCome.slice(0, -1) })); } if ((e.key === "Enter" || e.key === ",") && daysInput.trim()) { e.preventDefault(); const val = daysInput.trim(); if (daysOfWeek.includes(val) && !formData.daysToCome.includes(val)) { setFormData((prev) => ({ ...prev, daysToCome: [...prev.daysToCome, val] })); setDaysInput(""); setDaysDropdownOpen(false); } } }} list="days-suggestions" />
                                </div>
                                {daysDropdownOpen && daysOfWeek.filter((day) => day.toLowerCase().includes(daysInput.toLowerCase()) && !formData.daysToCome.includes(day)).length > 0 && (
                                    <div className=" rounded-md mt-1 bg-white  absolute z-10 w-[260px]">
                                        {daysOfWeek.filter((day) => day.toLowerCase().includes(daysInput.toLowerCase()) && !formData.daysToCome.includes(day)).map((day) => (
                                            <div key={day} className="px-3 py-2 cursor-pointer hover:bg-gray-100/50" onMouseDown={() => { setFormData((prev) => ({ ...prev, daysToCome: [...prev.daysToCome, day] })); setDaysInput(""); setDaysDropdownOpen(false); }}>{day}</div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">Select the days the consultant is expected to come in.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Total Working Hours<span className="text-red-500">*</span></Label>
                                <div className="flex items-center gap-2">
                                    <Input id="addressCity" name="addressCity" placeholder="E.g 120" value={totalWorkingHours} onChange={(e) => setTotalWorkingHours(+e.target.value)} required />

                                </div>
                                <p className="text-sm text-muted-foreground">Specify the number of hours a consultant is supposed to work for in a month (defualt is 160HRS)</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4 pt-6">
                            <h2 className="text-lg font-semibold mb-2">Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input id="addressStreet" name="addressStreet" placeholder="Street" value={formData.addressStreet} onChange={handleInputChange} required />
                                <Input id="addressCity" name="addressCity" placeholder="City" value={formData.addressCity} onChange={handleInputChange} required />
                                <Input id="addressState" name="addressState" placeholder="State" value={formData.addressState} onChange={handleInputChange} />
                                <Input id="addressCountry" name="addressCountry" placeholder="Country" value={formData.addressCountry} onChange={handleInputChange} required />
                                <Input id="addressPostalCode" name="addressPostalCode" placeholder="Postal Code" value={formData.addressPostalCode} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* Compensation */}
                        <div className="space-y-4 pt-6">
                            <h2 className="text-lg font-semibold mb-2">Compensation</h2>
                            <div className="flex w-full gap-2">
                                <Select value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="w-28 min-w-[5.5rem] rounded-md   bg-transparent dark:bg-[#181c32] text-base ">
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
                                <Input id="grossPay" name="grossPay" type="number" placeholder="e.g. 75000" value={formData.grossPay} onChange={handleInputChange} required className="flex-1 rounded-md border border-input" />
                            </div>
                            <p className="text-sm text-muted-foreground">Enter the consultant's salary and select the currency.</p>
                        </div>

                        <div className="space-y-4 pt-6">
                            <h2 className="text-lg font-semibold mb-2">Invoice Details</h2>
                            <div className="flex w-full gap-2">
                                <Select value={formData.type?.toString()} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: +value }))}>
                                    <SelectTrigger className=" rounded-md border border-input bg-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            [{ label: "Fixed", value: 1 }, { label: "Flexible", value: 2 }].map((c, i) => <SelectItem key={i} value={c?.value?.toString()}>
                                                <div className="flex items-center space-x-3">
                                                    {c?.label}
                                                </div>
                                            </SelectItem>)
                                        }

                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-sm text-muted-foreground">Specify whether the consultant's invoice amount is to be computed based off number of hours logged (flexible) or Fixed with the gross as the total amount to reflect on the invoice</p>
                        </div>

                        {/* ID Documents */}
                        <div className="space-y-4 pt-6">
                            <h2 className="text-lg font-semibold mb-2">ID Documents</h2>
                            <Label>ID Documents <span className="text-muted-foreground"></span></Label>
                            <FileAttachment attachments={attachments} onAttachmentsChange={setAttachments} maxFiles={5} acceptedFileTypes={["application/pdf"]} autoUpload={false} showUrlInput={false} />
                            <p className="text-sm text-muted-foreground">You may upload up to 5 PDF files of the consultant's identification documents (e.g., passport, national ID, driver's license).</p>
                        </div>

                        {/* Next of Kin (optional) */}
                        <div className="space-y-4 pt-6">
                            <h2 className="text-lg font-semibold mb-2">Next of Kin </h2>
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
                        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={submitting || loading}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                    {success && (
                        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </form>
            </Card>
        </div>
    )
} 