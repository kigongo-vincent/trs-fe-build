"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updatePassword, PasswordUpdateRequest, updateProfile, ProfileUpdateRequest, getAuthUser, getAuthData, storeAuthData, getUserRole } from "@/services/auth"
import { getDepartments } from "@/services/departments"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { BASE_URL, getImage, updateCompany } from "@/services/api"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  departmentId: string;
  bio: string;
  employeeId: string;
  phoneNumber: string | null;
  grossPay: number;
  dateOfBirth: string | null;
  nextOfKin: {
    name: string | null;
    relationship: string | null;
    phoneNumber: string | null;
    email: string | null;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode: string;
    routingNumber: string;
  };
  officeDays: string; // JSON string instead of array
}

interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  jobTitle?: string;
  departmentId?: string;
  bio?: string;
  employeeId?: string;
  phoneNumber?: string;
  grossPay?: string;
  dateOfBirth?: string;
  nextOfKin?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
    email?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    swiftCode?: string;
    routingNumber?: string;
  };
  officeDays?: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  status: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string;
  users: any[];
  projects: any[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    departmentId: "",
    bio: "",
    employeeId: "",
    phoneNumber: null,
    grossPay: 0,
    dateOfBirth: null,
    nextOfKin: {
      name: null,
      relationship: null,
      phoneNumber: null,
      email: null,
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      swiftCode: "",
      routingNumber: "",
    },
    officeDays: "",
  });
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [enableFloatingPoint, setEnableFloatingPoint] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<string>("USD"); // Now read-only, set from session
  const [enableTimeLogSteppers, setEnableTimeLogSteppers] = useState(false);

  // Helper function to get department name by ID
  const getDepartmentNameById = (departmentId: string): string => {
    const department = departments.find(dept => dept.id === departmentId);
    return department?.name || "";
  };

  // Helper to map API departments to local type
  const mapApiDepartments = (apiDepartments: any[]): Department[] => {
    return apiDepartments.map((dept) => ({
      ...dept,
      head: dept.head?.fullName ?? "",
    }));
  };

  // Load user data and departments on component mount
  useEffect(() => {
    setIsClient(true);
    const loadUserDataAndDepartments = async () => {
      try {
        setLoading(true);

        // Get current user data
        const currentUser = getAuthUser();
        const authData = getAuthData();

        if (!currentUser || !authData?.user?.company?.id) {
          toast.error("User data not found", {
            description: "Please log in again to access your settings.",
          });
          router.push("/");
          return;
        }

        setUser(currentUser);
        setUserRole(getUserRole());

        // Initialize profile form with user data
        // Parse fullName to get firstName and lastName
        const nameParts = currentUser.fullName?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setProfileForm({
          firstName,
          lastName,
          email: currentUser.email || "",
          jobTitle: currentUser.jobTitle || "",
          departmentId: currentUser.department?.id || "",
          bio: currentUser.bio || "",
          employeeId: currentUser.employeeId || "",
          phoneNumber: currentUser.phoneNumber || null,
          grossPay: currentUser.grossPay || 0,
          dateOfBirth: currentUser.dateOfBirth || null,
          nextOfKin: {
            name: currentUser.nextOfKin?.name || null,
            relationship: currentUser.nextOfKin?.relationship || null,
            phoneNumber: currentUser.nextOfKin?.phoneNumber || null,
            email: currentUser.nextOfKin?.email || null,
          },
          address: {
            street: currentUser.address?.street || "",
            city: currentUser.address?.city || "",
            state: currentUser.address?.state || "",
            country: currentUser.address?.country || "",
            postalCode: currentUser.address?.postalCode || "",
          },
          bankDetails: {
            accountName: currentUser.bankDetails?.accountName || "",
            accountNumber: currentUser.bankDetails?.accountNumber || "",
            bankName: currentUser.bankDetails?.bankName || "",
            swiftCode: currentUser.bankDetails?.swiftCode || "",
            routingNumber: currentUser.bankDetails?.routingNumber || "",
          },
          officeDays: currentUser.officeDays || "",
        });

        // Fetch departments for the company
        const companyId = authData.user.company.id;
        const departmentsResponse = await getDepartments(companyId);

        if (departmentsResponse.status === 200) {
          setDepartments(mapApiDepartments(departmentsResponse.data));
        } else {
          console.error("Failed to fetch departments:", departmentsResponse.message);
        }

      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load user data", {
          description: "Please refresh the page and try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserDataAndDepartments();
  }, [router]);

  // Load company info for Company Admin and user preferences
  useEffect(() => {
    if (userRole === "Company Admin" && user?.company) {
      setCompanyName(user.company.name || "");
      setCompanyLogo(user.company.logo || null);
      setCompanyCurrency(user.company.currency || "USD"); // set from session
      setEnableFloatingPoint(typeof user.company.roundOff === 'boolean' ? user.company.roundOff : false);
    }

    // Load time log stepper preference from localStorage
    const savedStepperPreference = localStorage.getItem("enableTimeLogSteppers");
    if (savedStepperPreference !== null) {
      setEnableTimeLogSteppers(JSON.parse(savedStepperPreference));
    }
  }, [userRole, user]);

  const validatePasswordForm = (): boolean => {
    const errors: PasswordFormErrors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfileForm = (): boolean => {
    const errors: ProfileFormErrors = {};

    if (!profileForm.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!profileForm.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!profileForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!profileForm.jobTitle.trim()) {
      errors.jobTitle = "Job title is required";
    }

    // Phone number validation (if provided)
    if (profileForm.phoneNumber && profileForm.phoneNumber.trim()) {
      const phoneDigits = profileForm.phoneNumber.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        errors.phoneNumber = "Please enter a valid phone number with at least 10 digits";
      }
    }

    if (!profileForm.bio.trim()) {
      errors.bio = "Bio is required";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Avatar select handler: preview image but don't upload yet
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle logo file select
  const handleCompanyLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCompanyLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async () => {
    if (!validateProfileForm()) {
      // Collect all error messages from profileErrors
      const errorMessages = Object.values(profileErrors)
        .flatMap(err => {
          if (!err) return [];
          if (typeof err === 'string') return [err];
          // For nested error objects (nextOfKin, address, bankDetails)
          return Object.values(err).filter(Boolean);
        })
        .filter(Boolean)
        .join('\n');
      toast.error(errorMessages || "Please fix the errors in the form before submitting.");
      return;
    }

    setIsUpdatingProfile(true);

    try {
      // Format the data properly for the API
      const requestData: any = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        fullName: `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`,
        email: profileForm.email.trim(),
        jobTitle: profileForm.jobTitle.trim(),
        bio: profileForm.bio.trim(),
      };

      // Only add departmentId if it has a value and is visible in the UI
      if (profileForm.departmentId && profileForm.departmentId.trim()) {
        requestData.departmentId = profileForm.departmentId;
      }

      // Only add phoneNumber if it has a value and is visible in the UI
      if (profileForm.phoneNumber && profileForm.phoneNumber.trim()) {
        requestData.phoneNumber = profileForm.phoneNumber.trim();
      }

      // Only add profileImage if a new avatar is selected
      if (selectedAvatarFile && avatarPreview) {
        // avatarPreview is like: data:image/png;base64,iVBORw0KGgo...
        // We need to insert ;name=filename before ;base64
        const [meta, base64Data] = avatarPreview.split(',');
        if (meta && base64Data) {
          // meta: data:image/png;base64
          const match = meta.match(/^data:(.*);base64$/);
          const mimetype = match ? match[1] : 'application/octet-stream';
          const filename = selectedAvatarFile.name;
          const newMeta = `data:${mimetype};name=${filename};base64`;
          requestData.profileImage = `${newMeta},${base64Data}`;
        } else {
          requestData.profileImage = avatarPreview; // fallback
        }
      }

      const response = await updateProfile(requestData);

      // Update the local store with the new profile data
      const currentUser = getAuthUser();
      const authData = getAuthData();

      if (currentUser && authData) {
        // Create updated user object
        const updatedUser = {
          ...currentUser,
          fullName: `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`,
          email: profileForm.email.trim(),
          jobTitle: profileForm.jobTitle.trim(),
          bio: profileForm.bio.trim(),
          department: profileForm.departmentId ? (departments.find(dept => dept.id === profileForm.departmentId) || currentUser.department) : null,
          employeeId: currentUser.employeeId, // Keep existing employeeId
          phoneNumber: profileForm.phoneNumber, // Keep existing phoneNumber
          grossPay: currentUser.grossPay, // Keep existing grossPay
          dateOfBirth: currentUser.dateOfBirth, // Keep existing dateOfBirth
          nextOfKin: currentUser.nextOfKin, // Keep existing nextOfKin
          address: currentUser.address, // Keep existing address
          bankDetails: currentUser.bankDetails, // Keep existing bankDetails
          officeDays: currentUser.officeDays, // Keep existing officeDays
          profileImage: (selectedAvatarFile && avatarPreview) ? avatarPreview : currentUser.profileImage,
        };

        // Update local storage
        storeAuthData(authData.token, updatedUser);

        // Update local state
        setUser(updatedUser);

        // Dispatch custom event to notify other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userDataUpdated"));
        }
      }

      // Redirect to profile page after update
      router.push("/dashboard/profile");
    } catch (error: any) {
      console.error("Profile update error:", error);

      // Handle specific API errors
      if (error.message?.includes("Email already exists")) {
        setProfileErrors(prev => ({ ...prev, email: "This email is already in use" }));
        toast.error("Email already exists", {
          description: "Please use a different email address.",
        });
      } else if (error.message?.includes("Invalid email format")) {
        setProfileErrors(prev => ({ ...prev, email: "Invalid email format" }));
        toast.error("Invalid email format", {
          description: "Please enter a valid email address.",
        });
      } else {
        // Show actual error from server if available
        let serverError = error?.response?.data?.error || error?.error || error?.message;
        toast.error("Failed to update profile", {
          description: serverError || "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const requestData: PasswordUpdateRequest = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };

      const response = await updatePassword(requestData);

      // If we reach here without an error, the password update was successful
      // The API returns { "message": "Password updated successfully" } on success
      toast.success("Password updated successfully", {
        description: response.message || "Your password has been changed.",
      });

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Password update error:", error);

      // Handle specific API errors based on the documented response messages
      if (error.message?.includes("Current password is incorrect")) {
        setPasswordErrors(prev => ({ ...prev, currentPassword: "Current password is incorrect" }));
        toast.error("Current password is incorrect", {
          description: "Please check your current password and try again.",
        });
      } else if (error.message?.includes("Current password and new password are required")) {
        toast.error("Missing required fields", {
          description: "Please fill in all password fields.",
        });
      } else {
        toast.error("Failed to update password", {
          description: error.message || "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle company update
  const handleCompanyUpdate = async () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    setIsUpdatingCompany(true);
    try {
      let logoData: string | undefined = undefined;
      if (companyLogoFile && companyLogo) {
        // companyLogo is a Data URL: data:image/png;base64,xxxxxx
        const matches = companyLogo.match(/^data:(.*);base64,(.*)$/);
        if (matches && matches.length === 3) {
          const mimetype = matches[1];
          const base64Data = matches[2];
          const filename = companyLogoFile.name;
          logoData = `data:${mimetype};name=${filename};base64,${base64Data}`;
        }
      } else if (companyLogo && companyLogo.startsWith('data:')) {
        // If companyLogo is a data URL, but no file object (fallback)
        // Try to extract mimetype and base64, but filename will be generic
        const matches = companyLogo.match(/^data:(.*);base64,(.*)$/);
        if (matches && matches.length === 3) {
          const mimetype = matches[1];
          const base64Data = matches[2];
          logoData = `data:${mimetype};name=logo.${mimetype.split('/')[1]};base64,${base64Data}`;
        }
      } else if (companyLogo && !companyLogo.startsWith('http')) {
        // If it's already a base64 string (not a URL)
        // We cannot determine mimetype or filename, so fallback to SVG
        logoData = `data:image/svg+xml;name=logo.svg;base64,${companyLogo}`;
      }
      const payload = {
        id: user.company.id,
        name: companyName.trim(),
        logo: logoData,
        roundOff: enableFloatingPoint,
        // currency: companyCurrency, // REMOVE currency from payload
      };

      const response = await updateCompany(payload, (JSON.parse(localStorage.getItem("user") ?? "") as { company: { id: number } }).company.id.toString());
      toast.success("Company updated successfully");

      // Update session company info with the response data
      const authData = getAuthData();
      if (authData) {
        const updatedUser = {
          ...authData.user,
          company: {
            ...authData.user.company,
            name: companyName.trim(),
            logo: response?.data?.logo || response?.logo || logoData, // Use response logo URL if available, fallback to logoData
            roundOff: enableFloatingPoint,
            // currency: companyCurrency, // not needed
          },
        };
        storeAuthData(authData.token, updatedUser);
        setUser(updatedUser);

        // Update the local state to show the new logo URL
        if (response?.data?.logo || response?.logo) {
          setCompanyLogo(response.data?.logo || response.logo);
        }
      }
      setCompanyLogoFile(null);
    } catch (error: any) {
      toast.error("Failed to update company", { description: error?.message || "An error occurred." });
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  // Handle time log stepper preference change
  const handleTimeLogStepperChange = (enabled: boolean) => {
    setEnableTimeLogSteppers(enabled);
    localStorage.setItem("enableTimeLogSteppers", JSON.stringify(enabled));
    toast.success(`Time log steppers ${enabled ? 'enabled' : 'disabled'}`, {
      description: `You will now see a ${enabled ? 'stepped' : 'full form'} interface when creating time logs.`,
    });
  };

  // Add handleNestedProfileChange above component return
  const handleNestedProfileChange = (field: string, value: string) => {
    const [parent, child] = field.split(".");
    setProfileForm(prev => {
      const parentValue = prev[parent as keyof ProfileFormData];
      if (typeof parentValue === "object" && parentValue !== null) {
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: value,
          },
        };
      }
      return prev;
    });
    // Clear error when user starts typing
    const parentError = profileErrors[parent as keyof ProfileFormErrors];
    if (parentError && typeof parentError === "object" && parentError !== null && (child in parentError)) {
      setProfileErrors(prev => ({
        ...prev,
        [parent]: {
          ...parentError,
          [child]: undefined,
        },
      }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl p-4">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-60" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-32 mr-2" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="company">
            <div className="flex flex-col gap-6 max-w-[60vw] border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-56 mb-2" />
                  <Skeleton className="h-3 w-80" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
              <Separator />
              <div className="flex block flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex flex-col items-start mt-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex items-center gap-4 mt-1">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-60" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-56 mb-2" />
                      <Skeleton className="h-3 w-80" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-60" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-32 mr-2" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-4">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          {userRole === "Company Admin" && (
            <TabsTrigger value="company">Company</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gradient">Profile Settings</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {userRole === "Consultant" ? (
                  <>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={e => handleProfileChange("firstName", e.target.value)}
                        placeholder="Enter your first name"
                        disabled={isUpdatingProfile}
                        className={profileErrors.firstName ? "border-red-500" : ""}
                      />
                      {profileErrors.firstName && <p className="text-red-500 text-sm">{profileErrors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={e => handleProfileChange("lastName", e.target.value)}
                        placeholder="Enter your last name"
                        disabled={isUpdatingProfile}
                        className={profileErrors.lastName ? "border-red-500" : ""}
                      />
                      {profileErrors.lastName && <p className="text-red-500 text-sm">{profileErrors.lastName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profileForm.phoneNumber || ""}
                        onChange={e => handleProfileChange("phoneNumber", e.target.value)}
                        placeholder="Enter your phone number"
                        disabled={isUpdatingProfile}
                        className={profileErrors.phoneNumber ? "border-red-500" : ""}
                      />
                      {profileErrors.phoneNumber && <p className="text-red-500 text-sm">{profileErrors.phoneNumber}</p>}
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={e => handleProfileChange("bio", e.target.value)}
                        placeholder="Enter your bio"
                        disabled={isUpdatingProfile}
                        className={`${profileErrors.bio ? "border-red-500" : ""} bg-transparent`}
                      />
                      {profileErrors.bio && <p className="text-red-500 text-sm">{profileErrors.bio}</p>}
                    </div>
                    <div className="col-span-1">
                      <Label>Avatar</Label>
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage src={avatarPreview || user?.profileImage || ""} alt={user?.fullName || "User Avatar"} />
                          <AvatarFallback>
                            {user?.fullName
                              ? user.fullName
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                              : "UA"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="outline"
                          className="ml-4"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUpdatingProfile}
                        >
                          {selectedAvatarFile ? "Change Selected" : "Change Avatar"}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleAvatarSelect}
                          className="hidden"
                        />
                        {avatarPreview && (
                          <Button
                            variant="ghost"
                            className="ml-2 text-xs text-red-500"
                            onClick={() => { setAvatarPreview(null); setSelectedAvatarFile(null); }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={e => handleProfileChange("firstName", e.target.value)}
                        placeholder="Enter your first name"
                        disabled={isUpdatingProfile}
                        className={profileErrors.firstName ? "border-red-500" : ""}
                      />
                      {profileErrors.firstName && <p className="text-red-500 text-sm">{profileErrors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={e => handleProfileChange("lastName", e.target.value)}
                        placeholder="Enter your last name"
                        disabled={isUpdatingProfile}
                        className={profileErrors.lastName ? "border-red-500" : ""}
                      />
                      {profileErrors.lastName && <p className="text-red-500 text-sm">{profileErrors.lastName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={e => handleProfileChange("email", e.target.value)}
                        placeholder="Enter your email"
                        disabled={isUpdatingProfile}
                        className={profileErrors.email ? "border-red-500" : ""}
                      />
                      {profileErrors.email && <p className="text-red-500 text-sm">{profileErrors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profileForm.phoneNumber || ""}
                        onChange={e => handleProfileChange("phoneNumber", e.target.value)}
                        placeholder="Enter your phone number"
                        disabled={isUpdatingProfile}
                        className={profileErrors.phoneNumber ? "border-red-500" : ""}
                      />
                      {profileErrors.phoneNumber && <p className="text-red-500 text-sm">{profileErrors.phoneNumber}</p>}
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profileForm.jobTitle}
                        onChange={e => handleProfileChange("jobTitle", e.target.value)}
                        placeholder="Enter your job title"
                        disabled={isUpdatingProfile}
                        className={profileErrors.jobTitle ? "border-red-500" : ""}
                      />
                      {profileErrors.jobTitle && <p className="text-red-500 text-sm">{profileErrors.jobTitle}</p>}
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={e => handleProfileChange("bio", e.target.value)}
                        placeholder="Enter your bio"
                        disabled={isUpdatingProfile}
                        className={profileErrors.bio ? "border-red-500" : ""}
                      />
                      {profileErrors.bio && <p className="text-red-500 text-sm">{profileErrors.bio}</p>}
                    </div>
                    <div className="col-span-1">
                      <Label>Avatar</Label>
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage src={avatarPreview || user?.profileImage || ""} alt={user?.fullName || "User Avatar"} />
                          <AvatarFallback>
                            {user?.fullName
                              ? user.fullName
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                              : "UA"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="outline"
                          className="ml-4"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUpdatingProfile}
                        >
                          {selectedAvatarFile ? "Change Selected" : "Change Avatar"}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleAvatarSelect}
                          className="hidden"
                        />
                        {avatarPreview && (
                          <Button
                            variant="ghost"
                            className="ml-2 text-xs text-red-500"
                            onClick={() => { setAvatarPreview(null); setSelectedAvatarFile(null); }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleProfileUpdate}
                disabled={isUpdatingProfile}
                className="mr-2"
              >
                {isUpdatingProfile ? "Updating..." : "Update Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gradient">User Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="enableTimeLogSteppers" className="text-base font-medium select-none">
                      Enable steppers for time log creation
                    </label>
                    <span className="opacity-60 text-sm block mt-1">
                      When enabled, creating a new time log will use a step-by-step interface. When disabled, you'll see the full form at once.
                    </span>
                  </div>
                  <Switch
                    id="enableTimeLogSteppers"
                    checked={enableTimeLogSteppers}
                    onCheckedChange={handleTimeLogStepperChange}
                    className="ml-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {userRole === "Company Admin" && (
          <TabsContent value="company">
            <div className="flex flex-col gap-6 max-w-[60vw] border  rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="enableFloatingPoint" className="text-base font-medium select-none">Enable floating point on invoices</label>
                  <span className="opacity-40 text-sm block">This affects the amount of money that reflects on the invoice of your consultants e.g 1,000,000.90 ~ 1M</span>
                </div>
                <Switch
                  id="enableFloatingPoint"
                  checked={enableFloatingPoint}
                  onCheckedChange={setEnableFloatingPoint}
                  className="ml-4"
                />
              </div>
              <Separator />
              {/* Currency Dropdown */}
              {/* Company Name and Logo */}
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    disabled={isUpdatingCompany}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="companyCurrency">Currency</Label>
                  <Input
                    id="companyCurrency"
                    value={companyCurrency}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div className="flex flex-col items-start mt-4">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Avatar>
                    <AvatarImage src={companyLogo || undefined} alt={companyName || "Company Logo"} />
                    <AvatarFallback>{companyName ? companyName[0] : "C"}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("companyLogoInput")?.click()}
                    disabled={isUpdatingCompany}
                  >
                    {companyLogoFile ? "Change Selected" : "Change Logo"}
                  </Button>
                  <input
                    id="companyLogoInput"
                    type="file"
                    accept="image/*"
                    onChange={handleCompanyLogoSelect}
                    className="hidden"
                  />
                  {companyLogo && companyLogoFile && (
                    <Button
                      variant="ghost"
                      className="text-xs text-red-500"
                      onClick={() => { setCompanyLogo(null); setCompanyLogoFile(null); }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={handleCompanyUpdate} disabled={isUpdatingCompany}>
                  {isUpdatingCompany ? "Updating..." : "Update Company"}
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gradient">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="Enter your current password"
                    disabled={isUpdatingPassword}
                    className={passwordErrors.currentPassword ? "border-red-500" : ""}
                  />
                  {passwordErrors.currentPassword && <p className="text-red-500 text-sm">{passwordErrors.currentPassword}</p>}
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Enter your new password"
                    disabled={isUpdatingPassword}
                    className={passwordErrors.newPassword ? "border-red-500" : ""}
                  />
                  {passwordErrors.newPassword && <p className="text-red-500 text-sm">{passwordErrors.newPassword}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your new password"
                    disabled={isUpdatingPassword}
                    className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                  />
                  {passwordErrors.confirmPassword && <p className="text-red-500 text-sm">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword}
                className="mr-2"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
