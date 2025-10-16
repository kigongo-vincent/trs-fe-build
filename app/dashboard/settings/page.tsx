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
import dynamic from "next/dynamic"
import "react-phone-input-2/lib/style.css"
import { Camera, Image, Smartphone, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import Cropper from "react-easy-crop"
import { useState as useCropState } from "react"

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false })

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
  const [showTimeLogAttachments, setShowTimeLogAttachments] = useState(true);
  const [showTimeLogUrls, setShowTimeLogUrls] = useState(true);
  const [showTimeLogProjects, setShowTimeLogProjects] = useState(true);
  const [enableStayOnForm, setEnableStayOnForm] = useState(false);

  // Image cropper states
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [cropImage, setCropImage] = useState<string>("");
  const [crop, setCrop] = useCropState({ x: 0, y: 0 });
  const [zoom, setZoom] = useCropState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useCropState(null);

  // Camera/Device selection modal states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

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

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle video element setup when camera stream is available
  useEffect(() => {
    if (cameraStream && videoRef) {
      videoRef.srcObject = cameraStream;
      videoRef.play().catch(console.error);
    }
  }, [cameraStream, videoRef]);

  // Load company info for Company Admin and user preferences
  useEffect(() => {
    if (userRole === "Company Admin" && user?.company) {
      setCompanyName(user.company.name || "");
      setCompanyLogo(user.company.logo || null);
      setCompanyCurrency(user.company.currency || "USD"); // set from session
      setEnableFloatingPoint(typeof user.company.roundOff === 'boolean' ? user.company.roundOff : false);
    }

    // Load time log preferences from localStorage
    const savedStepperPreference = localStorage.getItem("enableTimeLogSteppers");
    if (savedStepperPreference !== null) {
      setEnableTimeLogSteppers(JSON.parse(savedStepperPreference));
    }

    const savedAttachmentsPreference = localStorage.getItem("showTimeLogAttachments");
    if (savedAttachmentsPreference !== null) {
      setShowTimeLogAttachments(JSON.parse(savedAttachmentsPreference));
    }

    const savedUrlsPreference = localStorage.getItem("showTimeLogUrls");
    if (savedUrlsPreference !== null) {
      setShowTimeLogUrls(JSON.parse(savedUrlsPreference));
    }

    const savedProjectsPreference = localStorage.getItem("showTimeLogProjects");
    if (savedProjectsPreference !== null) {
      setShowTimeLogProjects(JSON.parse(savedProjectsPreference));
    }

    const savedStayOnFormPreference = localStorage.getItem("enableStayOnForm");
    if (savedStayOnFormPreference !== null) {
      setEnableStayOnForm(JSON.parse(savedStayOnFormPreference));
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

  // Avatar select handler: show cropper modal
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result as string);
      setShowCropperModal(true);
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

  // Cropper functions
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    return new Promise((resolve) => {
      const image = document.createElement('img');
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx?.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      image.src = imageSrc;
    });
  };

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImageUrl = await createCroppedImage(cropImage, croppedAreaPixels);
      setAvatarPreview(croppedImageUrl);
      setSelectedAvatarFile(null); // We'll create a new file from the cropped image
      setShowCropperModal(false);
      setCropImage("");

      // Convert cropped image to file
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      setSelectedAvatarFile(file);

      toast.success("Avatar cropped successfully!");
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error("Failed to crop image");
    }
  };

  const handleCancelCrop = () => {
    setShowCropperModal(false);
    setCropImage("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  // Camera functionality
  const startCamera = async () => {
    setIsStartingCamera(true);
    try {
      // Request camera with more flexible constraints
      const constraints = {
        video: {
          facingMode: { ideal: 'user' },
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Unable to access camera", {
        description: "Please check your camera permissions or try selecting from device instead."
      });
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef) return;

    setIsCapturing(true);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;

    context?.drawImage(videoRef, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCropImage(imageDataUrl);
    setShowCameraModal(false);
    setShowCropperModal(true);
    stopCamera();
    setIsCapturing(false);
  };

  const handleDeviceSelection = () => {
    setShowCameraModal(false);
    fileInputRef.current?.click();
  };

  const handleCloseCameraModal = () => {
    setShowCameraModal(false);
    stopCamera();
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
        requestData.phoneNumber = profileForm.phoneNumber.startsWith('+')
          ? profileForm.phoneNumber.trim()
          : `+${profileForm.phoneNumber.trim()}`;
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

  // Handle time log field visibility preferences
  const handleTimeLogFieldChange = (field: string, enabled: boolean) => {
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

    switch (field) {
      case 'attachments':
        setShowTimeLogAttachments(enabled);
        localStorage.setItem("showTimeLogAttachments", JSON.stringify(enabled));
        break;
      case 'urls':
        setShowTimeLogUrls(enabled);
        localStorage.setItem("showTimeLogUrls", JSON.stringify(enabled));
        break;
      case 'projects':
        setShowTimeLogProjects(enabled);
        localStorage.setItem("showTimeLogProjects", JSON.stringify(enabled));
        break;
    }

    toast.success(`${fieldName} field ${enabled ? 'shown' : 'hidden'}`, {
      description: `The ${field} field will now be ${enabled ? 'visible' : 'hidden'} in time log creation.`,
    });
  };

  // Handle stay on form preference
  const handleStayOnFormChange = (enabled: boolean) => {
    setEnableStayOnForm(enabled);
    localStorage.setItem("enableStayOnForm", JSON.stringify(enabled));
    toast.success(`Stay on form ${enabled ? 'enabled' : 'disabled'}`, {
      description: enabled
        ? "After creating a time log, the form will clear and stay open for logging more entries."
        : "After creating a time log, you'll be redirected to the Time Logs list.",
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
            {userRole === "Company Admin" && (
              <TabsTrigger value="company">Company</TabsTrigger>
            )}
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
                {/* WhatsApp-style Avatar Skeleton */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="absolute bottom-0 right-0 h-10 w-10 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
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
              <div className="flex flex-col md:flex-row gap-6 items-center">
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
              {/* WhatsApp-style Avatar Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={avatarPreview || user?.profileImage || ""} alt={user?.fullName || "User Avatar"} />
                    <AvatarFallback className="text-2xl">
                      {user?.fullName
                        ? user.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                        : "UA"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 p-0"
                    onClick={() => setShowCameraModal(true)}
                    disabled={isUpdatingProfile}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
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
                      <div className="w-full">
                        <PhoneInput
                          country={"us"}
                          value={profileForm.phoneNumber || ""}
                          onChange={(value) => handleProfileChange("phoneNumber", value)}
                          inputProps={{ name: "phoneNumber", required: false, autoFocus: false }}
                          inputClass="w-full !w-full h-10 !h-10 !pl-12 !pr-3 !rounded-md !border !border-input !bg-transparent !text-base !focus:outline-none !focus:ring-2 !focus:ring-ring !focus:ring-offset-2 !dark:!text-white !text-[#181c32]"
                          buttonClass="!border-none !bg-transparent"
                          dropdownClass="!bg-background dark:!bg-[#23272f] !text-base custom-phone-dropdown-shadow"
                          enableSearch
                          disableSearchIcon={false}
                          specialLabel=""
                        />
                      </div>
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
                      <div className="w-full">
                        <PhoneInput
                          country={"us"}
                          value={profileForm.phoneNumber || ""}
                          onChange={(value) => handleProfileChange("phoneNumber", value)}
                          inputProps={{ name: "phoneNumber", required: false, autoFocus: false }}
                          inputClass="w-full !w-full h-10 !h-10 !pl-12 !pr-3 !rounded-md !border !border-input !bg-transparent !text-base !focus:outline-none !focus:ring-2 !focus:ring-ring !focus:ring-offset-2 !dark:!text-white !text-[#181c32]"
                          buttonClass="!border-none !bg-transparent"
                          dropdownClass="!bg-background dark:!bg-[#23272f] !text-base custom-phone-dropdown-shadow"
                          enableSearch
                          disableSearchIcon={false}
                          specialLabel=""
                        />
                      </div>
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
                {/* Time Log Interface Preference */}
                <div className="flex items-center justify-between">
                  <div className="md:max-w-[90%] max-w-[70%]">
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

                <Separator />

                {/* Stay on Form After Creating Time Log */}
                <div className="flex items-center justify-between">
                  <div className="md:max-w-[90%] max-w-[70%]">
                    <label htmlFor="enableStayOnForm" className="text-base font-medium select-none">
                      Stay on form to log more entries
                    </label>
                    <span className="opacity-60 text-sm block mt-1">
                      When enabled, the form will clear and stay open after creating a time log, allowing you to quickly log multiple entries. When disabled, you'll be redirected to the Time Logs list (default).
                    </span>
                  </div>
                  <Switch
                    id="enableStayOnForm"
                    checked={enableStayOnForm}
                    onCheckedChange={handleStayOnFormChange}
                    className="ml-4"
                  />
                </div>

                <Separator />

                {/* Time Log Field Visibility Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Time Log Field Visibility</h3>
                    <p className="text-sm text-muted-foreground">
                      Control which optional fields are shown when creating time logs
                    </p>
                  </div>

                  {/* Projects Field */}
                  <div className="flex items-center justify-between">
                    <div className="md:max-w-[90%] max-w-[70%]">
                      <label htmlFor="showTimeLogProjects" className="text-base font-medium select-none">
                        Show Projects field
                      </label>
                      <span className="opacity-60 text-sm block mt-1">
                        When enabled, you can select a project when creating time logs.
                      </span>
                    </div>
                    <Switch
                      id="showTimeLogProjects"
                      checked={showTimeLogProjects}
                      onCheckedChange={(enabled) => handleTimeLogFieldChange('projects', enabled)}
                      className="ml-4"
                    />
                  </div>

                  {/* Attachments Field */}
                  <div className="flex items-center justify-between">
                    <div className="md:max-w-[90%] max-w-[70%]">
                      <label htmlFor="showTimeLogAttachments" className="text-base font-medium select-none">
                        Show Attachments field
                      </label>
                      <span className="opacity-60 text-sm block mt-1">
                        When enabled, you can upload files and documents to your time logs.
                      </span>
                    </div>
                    <Switch
                      id="showTimeLogAttachments"
                      checked={showTimeLogAttachments}
                      onCheckedChange={(enabled) => handleTimeLogFieldChange('attachments', enabled)}
                      className="ml-4"
                    />
                  </div>

                  {/* URLs Field */}
                  <div className="flex items-center justify-between">
                    <div className="md:max-w-[90%] max-w-[70%]">
                      <label htmlFor="showTimeLogUrls" className="text-base font-medium select-none">
                        Show URLs field
                      </label>
                      <span className="opacity-60 text-sm block mt-1">
                        When enabled, you can add reference links and URLs to your time logs.
                      </span>
                    </div>
                    <Switch
                      id="showTimeLogUrls"
                      checked={showTimeLogUrls}
                      onCheckedChange={(enabled) => handleTimeLogFieldChange('urls', enabled)}
                      className="ml-4"
                    />
                  </div>
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

      {/* Camera/Device Selection Modal */}
      <Dialog open={showCameraModal} onOpenChange={handleCloseCameraModal}>
        <DialogContent className="sm:max-w-md  max-w-[90vw] m-auto">
          <DialogHeader>
            <DialogTitle>Choose Photo Source</DialogTitle>
          </DialogHeader>

          {!cameraStream ? (
            <div className="flex flex-col  gap-4 py-4">
              <Button
                onClick={startCamera}
                className="flex items-center justify-center gap-3 h-12 text-base"
                variant="outline"
                disabled={isStartingCamera}
              >
                <Camera className="w-5 h-5" />
                {isStartingCamera ? "Starting Camera..." : "Take Photo with Camera"}
              </Button>
              <Button
                onClick={handleDeviceSelection}
                className="flex items-center justify-center gap-3 h-12 text-base"
                variant="outline"
              >
                <Image className="w-5 h-5" />
                Choose from Device
              </Button>
              <Button
                onClick={handleCloseCameraModal}
                className="flex items-center justify-center gap-3 h-12 text-base"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={setVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                  onLoadedMetadata={() => {
                    if (videoRef) {
                      videoRef.play().catch(console.error);
                    }
                  }}
                  onCanPlay={() => {
                    if (videoRef) {
                      videoRef.play().catch(console.error);
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white border-dashed rounded-full opacity-50"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="flex-1"
                >
                  {isCapturing ? "Capturing..." : "Capture Photo"}
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Cropper Modal */}
      <Dialog open={showCropperModal} onOpenChange={setShowCropperModal}>
        <DialogContent className="sm:max-w-2xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Crop Your Avatar</DialogTitle>
          </DialogHeader>
          <div className="relative h-96 w-full">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  position: "relative",
                },
              }}
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium min-w-[60px]">Zoom:</label>
            <div className="flex-1">
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground min-w-[40px] text-right">
              {zoom.toFixed(1)}x
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropperModal(false);
                  setCropImage("");
                  // Trigger file input again
                  setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 100);
                }}
                className="w-full sm:w-auto"
              >
                Select Another
              </Button>
              <Button
                onClick={handleCropComplete}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Confirm
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleCancelCrop}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
