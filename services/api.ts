import { getAuthData } from "./auth";
import type { PackagesApiResponse } from "@/app/dashboard/super-admin/packages/page";

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
