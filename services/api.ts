import { getAuthData } from "./auth";

// Define the PackagesApiResponse interface locally
export interface PackagesApiResponse {
  status: number;
  message: string;
  data: any[];
}

export const BASE_URL = "https://trs-api.tekjuice.xyz/api";
export const IMAGE_BASE_URL = "https://trs-api.tekjuice.xyz/";

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  onUploadProgress?: (progress: UploadProgressEvent) => void;
}

export async function getRequest<T>(route: string): Promise<T> {
  try {
    const authData = getAuthData();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`;
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "GET",
      headers,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("GET request failed:", error);
    throw error;
  }
}

export async function postRequest<T>(
  route: string,
  data: any,
  options: RequestOptions = {}
): Promise<T> {
  try {
    const authData = getAuthData();
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData, let the browser set it
    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`;
    }

    // Merge custom headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const body = data instanceof FormData ? data : JSON.stringify(data);

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "POST",
      headers,
      body,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("POST request failed:", error);
    throw error;
  }
}

export async function putRequest<T>(route: string, data: any): Promise<T> {
  try {
    console.log("[putRequest] route:", route, "data:", data);
    const authData = getAuthData();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`;
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("PUT request failed:", error);
    throw error;
  }
}

export async function deleteRequest<T>(route: string): Promise<T> {
  try {
    const authData = getAuthData();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`;
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("DELETE request failed:", error);
    throw error;
  }
}

export async function patchRequest<T>(route: string, data: any): Promise<T> {
  try {
    const authData = getAuthData();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`;
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("PATCH request failed:", error);
    throw error;
  }
}

// File upload with progress tracking
export async function uploadFileWithProgress<T>(
  route: string,
  formData: FormData,
  onProgress?: (progress: UploadProgressEvent) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const authData = getAuthData();
    const headers: Record<string, string> = {};

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`;
    }

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress: UploadProgressEvent = {
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded * 100) / event.total),
        };
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Invalid JSON response"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("POST", `${BASE_URL}${route}`);

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(formData);
  });
}

export async function getTasksSummary(companyID: string) {
  return getRequest(`/company/tasks/overview/summary/${companyID}`);
}

export async function getCompanySummary(companyID: string) {
  return getRequest(`/company/summary/${companyID}`);
}

export async function getHoursByProject(companyID: string) {
  return getRequest(`/company/hoursByProject/summary/${companyID}`);
}

export async function getCompanyInvoicesSummary(companyID: string) {
  return getRequest(`/company/invoices/summary/${companyID}`);
}

export function getImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return IMAGE_BASE_URL + path.replace(/^\//, "");
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    // Handle validation errors specifically
    if (response.status === 400 && data.errors) {
      const errorMessages = data.errors
        .map(
          (error: any) =>
            `${error.property}: ${Object.values(error.constraints || {}).join(
              ", "
            )}`
        )
        .join("; ");
      throw new Error(errorMessages);
    }

    // Handle server memory errors specifically
    if (data.message && data.message.includes("sort memory")) {
      throw new Error(
        "Server is temporarily overloaded. Please try again later or contact support if the issue persists."
      );
    }

    // Handle other server overload scenarios
    if (
      data.message &&
      (data.message.includes("overload") ||
        data.message.includes("too many requests") ||
        data.message.includes("rate limit") ||
        data.message.includes("server busy"))
    ) {
      throw new Error(
        "Server is temporarily overloaded. Please try again later or contact support if the issue persists."
      );
    }

    const error = data.message || response.statusText;
    throw new Error(error);
  }

  return data;
}

export async function fetchPackages(): Promise<PackagesApiResponse> {
  return getRequest("/super-admin/packages");
}

export async function createPackage(payload: {
  name: string;
  description: string;
  price: number;
  durationType: "monthly" | "yearly";
  no_of_users: number;
  status: string;
}): Promise<any> {
  return postRequest("/super-admin/packages", payload);
}

export async function updatePackage(
  id: string,
  payload: {
    name: string;
    description: string;
    price: number;
    durationType: "monthly" | "yearly";
    no_of_users: number;
    status: string;
  }
): Promise<any> {
  return putRequest(`/super-admin/packages/${id}`, payload);
}

export async function fetchPackageById(id: string): Promise<any> {
  return getRequest(`/super-admin/packages/${id}`);
}

export async function fetchCompanies(): Promise<any> {
  return getRequest("/super-admin/companies");
}

export async function fetchCompanyById(id: string): Promise<any> {
  return getRequest(`/super-admin/companies/${id}`);
}

// Type for a single license key
export interface LicenseKey {
  id: string;
  key: string;
  status: string;
  expiryDate: string;
  company: {
    id: string;
    name: string;
    sector: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  package: {
    id: string;
    name: string;
    description: string;
    price: number;
    durationType: string;
    no_of_users: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Type for the API response
export interface LicenseKeysApiResponse {
  status: number;
  message: string;
  data: LicenseKey[];
}

// Fetch all license keys
export async function fetchLicenseKeys(): Promise<LicenseKeysApiResponse> {
  return getRequest<LicenseKeysApiResponse>("/super-admin/license-keys");
}

// Type for license key summary item
export interface LicenseKeySummaryItem {
  label: string;
  value: number;
}

// Type for the summary API response
export interface LicenseKeySummaryApiResponse {
  status: number;
  message: string;
  data: LicenseKeySummaryItem[];
}

// Fetch license key summary
export async function fetchLicenseKeySummary(): Promise<LicenseKeySummaryApiResponse> {
  return getRequest<LicenseKeySummaryApiResponse>(
    "/super-admin/license-keys/summary"
  );
}

// Create license key payload type
export interface CreateLicenseKeyPayload {
  companyId: string;
  packageId: string;
  expiryDate: string;
  status: string;
}

// Create license key
export async function createLicenseKey(
  payload: CreateLicenseKeyPayload
): Promise<any> {
  return postRequest("/super-admin/license-keys", payload);
}

// Type for super-admin packages summary item
export interface PackagesSummaryItem {
  label: string;
  value: string | number;
}

// Type for the summary API response
export interface PackagesSummaryApiResponse {
  status: number;
  message: string;
  data: PackagesSummaryItem[];
}

// Fetch super-admin packages summary
export async function fetchPackagesSummary(): Promise<PackagesSummaryApiResponse> {
  return getRequest<PackagesSummaryApiResponse>(
    "/super-admin/packages/summary"
  );
}

// Type for companies summary item
export interface CompaniesSummaryItem {
  label: string;
  value: number;
}

// Type for the companies summary API response
export interface CompaniesSummaryApiResponse {
  status: number;
  message: string;
  data: CompaniesSummaryItem[];
}

// Fetch super-admin companies summary
export async function fetchCompaniesSummary(): Promise<CompaniesSummaryApiResponse> {
  return getRequest<CompaniesSummaryApiResponse>(
    "/super-admin/companies/summary"
  );
}

export interface CompanyInvoiceStat {
  label: string;
  count: number;
  amount: number;
}

export interface CompanyInvoiceStatsApiResponse {
  status: number;
  message: string;
  data: CompanyInvoiceStat[];
}

export async function fetchCompanyInvoiceStats(): Promise<CompanyInvoiceStatsApiResponse> {
  return getRequest<CompanyInvoiceStatsApiResponse>(
    "/super-admin/company-invoices/stats"
  );
}

export interface CompanyInvoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
  // Add more fields as needed based on actual API response
}

export interface CompanyInvoicesApiResponse {
  status: number;
  message: string;
  data: CompanyInvoice[];
}

export async function fetchCompanyInvoices(): Promise<CompanyInvoicesApiResponse> {
  return getRequest<CompanyInvoicesApiResponse>(
    "/super-admin/company-invoices"
  );
}

// Payload type for creating a company invoice
export interface CreateCompanyInvoicePayload {
  companyId: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
}

// Create company invoice
export async function createCompanyInvoice(
  payload: CreateCompanyInvoicePayload
): Promise<any> {
  return postRequest("/super-admin/company-invoices", payload);
}

// Type for a single billing transaction
export interface BillingTransaction {
  id: string;
  transactionId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    sector: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    currency: string;
    roundOff: boolean;
    licenseKeyId: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  };
}

export interface BillingHistoryApiResponse {
  status: number;
  message: string;
  data: BillingTransaction[];
}

// Fetch billing/transaction history for a company
export async function fetchBillingHistory(
  companyId: string
): Promise<BillingHistoryApiResponse> {
  return getRequest<BillingHistoryApiResponse>(`/billing/list/${companyId}`);
}

// Board Members API
export async function getBoardMembers(companyId: string): Promise<any> {
  return getRequest(`/company/board-members/${companyId}`);
}

export async function createBoardMember(data: {
  fullName: string;
  email: string;
  companyId: string;
  boardMemberRole: "reviewer" | "approver";
}): Promise<any> {
  return postRequest(`/company/board-members`, data);
}

export async function updateBoardMember(data: {
  memberId: string;
  fullName: string;
  email: string;
  status?: string;
  boardMemberRole?: "reviewer" | "approver";
}): Promise<any> {
  return putRequest(`/company/board-members`, data);
}

export async function deleteBoardMember(memberId: string): Promise<any> {
  return deleteRequest(`/company/board-members/${memberId}`);
}

// Update company details (name, logo, etc.)
export async function updateCompany(
  payload: {
    id: string;
    name: string;
    logo?: string;
  },
  companyId: string
): Promise<any> {
  return putRequest(`/company/${companyId}`, payload);
}
