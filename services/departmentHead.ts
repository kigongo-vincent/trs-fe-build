import { getRequest } from "./api";

// Interface for the consultant data from the department head endpoint
export interface DepartmentHeadConsultant {
  id: string;
  fullName: string;
  email: string;
  status: string;
  jobTitle: string | null;
  employeeId: string | null;
  createdAt: string;
  hourlyRate: number | null;
  role: {
    id: string;
    name: string;
    created_at: string | null;
    updated_at: string;
  };
  department: {
    id: string;
    name: string;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Interface for the pagination data
interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Interface for the API response
export interface DepartmentHeadConsultantsResponse {
  status: number;
  message: string;
  data: {
    consultants: DepartmentHeadConsultant[];
    pagination: PaginationData;
  };
}

/**
 * Fetches the list of consultants for the department head
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with the list of consultants and pagination data
 */
export async function getDepartmentHeadConsultants(
  page: number = 1,
  limit: number = 10
): Promise<DepartmentHeadConsultantsResponse> {
  try {
    const response = await getRequest<DepartmentHeadConsultantsResponse>(
      `/departments/head/consultants?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching department head consultants:', error);
    throw error;
  }
}

/**
 * Fetches a single consultant by ID for the department head
 * @param consultantId - The ID of the consultant to fetch
 * @returns Promise with the consultant data
 */
export async function getDepartmentHeadConsultantById(
  consultantId: string
): Promise<DepartmentHeadConsultant> {
  try {
    const response = await getRequest<{ data: DepartmentHeadConsultant }>(
      `/departments/head/consultants/${consultantId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching consultant ${consultantId}:`, error);
    throw error;
  }
}
