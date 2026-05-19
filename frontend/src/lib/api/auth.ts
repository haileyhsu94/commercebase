import { apiClient, setStoredToken } from "./client"

export interface AuthUser {
  id: string
  name: string
  email: string
  organizationId: string | null
  planId: string
  currency: string
  locale: string
  timezone: string
  advertiserAt: string | null
}

interface LoginResponse {
  token: string
  user: AuthUser
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password })
  setStoredToken(data.token)
  return data.user
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>("/auth/me")
  return data.user
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout")
  } finally {
    setStoredToken(null)
  }
}
