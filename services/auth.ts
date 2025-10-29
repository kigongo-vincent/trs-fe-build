import { postRequest, putRequest } from "./api";

interface SignupData {
  name: string;
  sector: string;
  fullName: string;
  email: string;
  password: string;
  currency?: string; // allow currency
  roundOff?: boolean; // allow roundoff
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  status: number;
  message: string;
  data: {
    user: {
      id: string;
      departmentHead?: any;
      fullName: string;
      email: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      role: {
        role_id: string;
        id: number;
        name: string;
        created_at: null | string;
        updated_at: null | string;
      };
      company: {
        id: string;
        name: string;
        sector: string;
        createdAt: string;
        updatedAt: string;
      } | null;
      department: any;
    };
    token: string;
  };
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordUpdateResponse {
  message: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  jobTitle: string;
  departmentId?: string;
  bio: string;
}

export interface ProfileUpdateResponse {
  message: string;
}

export async function signupCompany(data: SignupData): Promise<AuthResponse> {
  return await postRequest<AuthResponse>("/company/signup", data);
}

export async function signupFreelancer(
  data: SignupData
): Promise<AuthResponse> {
  return await postRequest<AuthResponse>("/freelancer/signup", data);
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return await postRequest<AuthResponse>("/auth/login", data);
}

export function storeAuthData(token: string, user: any): void {
  if (typeof window !== "undefined") {
    // Override role for specific email to freelancer
    if (user?.email === "kigongovincent625+andrew@gmail.com") {
      user = {
        ...user,
        role: {
          ...user.role,
          name: "Freelancer",
        },
      };
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Dispatch event to notify components (e.g., confetti) that user data is available
    window.dispatchEvent(new Event("userDataUpdated"));
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function getAuthUser(): any | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function getAuthData(): any | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      return {
        token: token,
        user: JSON.parse(user),
      };
    }
  }
  return null;
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getUserRole(): string | null {
  const user = getAuthUser();
  let role = user?.role?.name || null;

  // Override role for specific email to freelancer
  if (user?.email === "kigongovincent625+andrew@gmail.com") {
    return "Freelancer";
  }

  if (role === "Consultancy") role = "Consultant";
  return role;
}

export function getDashboardPath(): string {
  const role = getUserRole();

  switch (role) {
    case "Super Admin":
      return "/dashboard/super-admin";
    case "Company Admin":
      return "/dashboard/company-admin";
    case "Board Member":
      return "/dashboard/company-admin";
    case "Consultant":
      return "/dashboard/employee";
    case "Freelancer":
      return "/dashboard/freelancer";
    default:
      return "/dashboard";
  }
}

export async function updatePassword(
  data: PasswordUpdateRequest
): Promise<PasswordUpdateResponse> {
  return putRequest<PasswordUpdateResponse>("/profile/password", data);
}

export async function updateProfile(
  data: ProfileUpdateRequest
): Promise<ProfileUpdateResponse> {
  return putRequest<ProfileUpdateResponse>("/profile/profile", data);
}

export function isTokenExpired(): boolean {
  const token = getAuthToken();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      clearAuth();
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

// Forgot Password API
export async function requestPasswordReset(email: string): Promise<any> {
  return postRequest<any>("/auth/request-password-reset", { email });
}

export async function verifyResetToken(token: string): Promise<any> {
  return postRequest<any>("/auth/verify-reset-token", { token });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<any> {
  return postRequest<any>("/auth/reset-password", { token, newPassword });
}
