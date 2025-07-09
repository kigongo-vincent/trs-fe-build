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
import { BASE_URL, getImage } from "@/services/api"

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

      // Only add departmentId if it has a value
      if (profileForm.departmentId && profileForm.departmentId.trim()) {
        requestData.departmentId = profileForm.departmentId;
      }

      // Only add phoneNumber if it has a value
      if (profileForm.phoneNumber && profileForm.phoneNumber.trim()) {
        requestData.phoneNumber = profileForm.phoneNumber.trim();
      }

      // Only add dateOfBirth if it has a value
      if (profileForm.dateOfBirth && profileForm.dateOfBirth.trim()) {
        requestData.dateOfBirth = new Date(profileForm.dateOfBirth).toISOString();
      }

      // Only add nextOfKin if any field has a value
      if (
        profileForm.nextOfKin.name?.trim() ||
        profileForm.nextOfKin.relationship?.trim() ||
        profileForm.nextOfKin.phoneNumber?.trim() ||
        profileForm.nextOfKin.email?.trim()
      ) {
        requestData.nextOfKin = {};
        if (profileForm.nextOfKin.name?.trim()) requestData.nextOfKin.name = profileForm.nextOfKin.name.trim();
        if (profileForm.nextOfKin.relationship?.trim()) requestData.nextOfKin.relationship = profileForm.nextOfKin.relationship.trim();
        if (profileForm.nextOfKin.phoneNumber?.trim()) requestData.nextOfKin.phoneNumber = profileForm.nextOfKin.phoneNumber.trim();
        if (profileForm.nextOfKin.email?.trim()) requestData.nextOfKin.email = profileForm.nextOfKin.email.trim();
      }

      // Only add address if any field has a value
      if (
        profileForm.address.street.trim() ||
        profileForm.address.city.trim() ||
        profileForm.address.state.trim() ||
        profileForm.address.country.trim() ||
        profileForm.address.postalCode.trim()
      ) {
        requestData.address = {};
        if (profileForm.address.street.trim()) requestData.address.street = profileForm.address.street.trim();
        if (profileForm.address.city.trim()) requestData.address.city = profileForm.address.city.trim();
        if (profileForm.address.state.trim()) requestData.address.state = profileForm.address.state.trim();
        if (profileForm.address.country.trim()) requestData.address.country = profileForm.address.country.trim();
        if (profileForm.address.postalCode.trim()) requestData.address.postalCode = profileForm.address.postalCode.trim();
      }

      // Only add bankDetails if any field has a value
      if (
        profileForm.bankDetails.accountName.trim() ||
        profileForm.bankDetails.accountNumber.trim() ||
        profileForm.bankDetails.bankName.trim() ||
        profileForm.bankDetails.swiftCode.trim() ||
        profileForm.bankDetails.routingNumber.trim()
      ) {
        requestData.bankDetails = {};
        if (profileForm.bankDetails.accountName.trim()) requestData.bankDetails.accountName = profileForm.bankDetails.accountName.trim();
        if (profileForm.bankDetails.accountNumber.trim()) requestData.bankDetails.accountNumber = profileForm.bankDetails.accountNumber.trim();
        if (profileForm.bankDetails.bankName.trim()) requestData.bankDetails.bankName = profileForm.bankDetails.bankName.trim();
        if (profileForm.bankDetails.swiftCode.trim()) requestData.bankDetails.swiftCode = profileForm.bankDetails.swiftCode.trim();
        if (profileForm.bankDetails.routingNumber.trim()) requestData.bankDetails.routingNumber = profileForm.bankDetails.routingNumber.trim();
      }

      // Only add officeDays if it has a value
      if (profileForm.officeDays && profileForm.officeDays.trim()) {
        requestData.officeDays = profileForm.officeDays;
      }

      // If a new avatar is selected, add it as base64 string (profileImage)
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
          employeeId: profileForm.employeeId,
          phoneNumber: profileForm.phoneNumber,
          grossPay: profileForm.grossPay,
          dateOfBirth: profileForm.dateOfBirth,
          nextOfKin: profileForm.nextOfKin,
          address: profileForm.address,
          bankDetails: profileForm.bankDetails,
          officeDays: profileForm.officeDays,
          // avatarUrl will be updated by backend if profileImage is processed
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-4">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
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
                        className={profileErrors.bio ? "border-red-500" : ""}
                      />
                      {profileErrors.bio && <p className="text-red-500 text-sm">{profileErrors.bio}</p>}
                    </div>
                    <div className="col-span-1">
                      <Label>Avatar</Label>
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage src={avatarPreview || getImage(user?.avatarUrl) || ""} alt={user?.fullName || "User Avatar"} />
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
                          <AvatarImage src={avatarPreview || getImage(user?.avatarUrl) || ""} alt={user?.fullName || "User Avatar"} />
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
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
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
