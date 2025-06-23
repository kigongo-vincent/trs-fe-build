import { getAuthData } from "./auth"

const BASE_URL = "https://trs-api.tekjuice.xyz/api"

export async function getRequest<T>(route: string): Promise<T> {
  try {
    const authData = getAuthData()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "GET",
      headers,
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error("GET request failed:", error)
    throw error
  }
}

export async function postRequest<T>(route: string, data: any): Promise<T> {
  try {
    const authData = getAuthData()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error("POST request failed:", error)
    throw error
  }
}

export async function putRequest<T>(route: string, data: any): Promise<T> {
  try {
    const authData = getAuthData()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error("PUT request failed:", error)
    throw error
  }
}

export async function deleteRequest<T>(route: string): Promise<T> {
  try {
    const authData = getAuthData()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (authData && authData.token) {
      headers["Authorization"] = `Bearer ${authData.token}`
    }

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "DELETE",
      headers,
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error("DELETE request failed:", error)
    throw error
  }
}

export async function getTasksSummary(companyID: string) {
  return getRequest(`/company/tasks/overview/summary/${companyID}`)
}

export async function getCompanySummary(companyID: string) {
  return getRequest(`/company/summary/${companyID}`)
}

export async function getHoursByProject(companyID: string) {
  return getRequest(`/company/hoursByProject/summary/${companyID}`)
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    const error = data.message || response.statusText
    throw new Error(error)
  }

  return data
}
