/** Mock organization and team members — Team settings page */

export type TeamRole = "owner" | "admin" | "member"

export type MemberStatus = "active" | "pending"

export interface TeamMemberRow {
  id: string
  name: string
  email: string
  role: TeamRole
  status: MemberStatus
}

export interface OrganizationSummary {
  name: string
}

export const defaultOrganization: OrganizationSummary = {
  name: "Realry Inc.",
}

export const seedTeamMembers: TeamMemberRow[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@realry.com",
    role: "owner",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@realry.com",
    role: "admin",
    status: "active",
  },
  {
    id: "3",
    name: "Alex Rivera",
    email: "alex@realry.com",
    role: "member",
    status: "active",
  },
]

const STORAGE_KEY = "commercebase_team_members_v1"

export function loadTeamMembers(): TeamMemberRow[] {
  if (typeof window === "undefined") return [...seedTeamMembers]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as TeamMemberRow[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return [...seedTeamMembers]
}

export function saveTeamMembers(members: TeamMemberRow[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
}

export function generateMemberId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}
