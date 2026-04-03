import { defaultCompanyProfile } from "@/lib/mock-data"

const STORAGE_KEY = "commercebase_company_profile_v1"

export type CompanyProfile = {
  companyName: string
  website: string
  /** Billing / company contact — may match profile email */
  primaryEmail?: string
  industry?: string
  /** When industry is "Other", user-defined label */
  industryOther?: string
  companySize?: string
  timeZone?: string
  /** HQ or primary market — used for regional defaults and onboarding context */
  country?: string
  city?: string
  catalogSource?: string
}

export function getCompanyProfile(): CompanyProfile {
  if (typeof window === "undefined") {
    return { ...defaultCompanyProfile }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CompanyProfile>
      return {
        companyName: parsed.companyName ?? defaultCompanyProfile.companyName,
        website: parsed.website ?? defaultCompanyProfile.website,
        primaryEmail: parsed.primaryEmail ?? defaultCompanyProfile.primaryEmail,
        industry: parsed.industry ?? defaultCompanyProfile.industry,
        industryOther: parsed.industryOther,
        companySize: parsed.companySize ?? defaultCompanyProfile.companySize,
        timeZone: parsed.timeZone ?? defaultCompanyProfile.timeZone,
        country: parsed.country ?? defaultCompanyProfile.country,
        city: parsed.city ?? defaultCompanyProfile.city,
        catalogSource: parsed.catalogSource ?? defaultCompanyProfile.catalogSource,
      }
    }
  } catch {
    /* ignore */
  }
  return { ...defaultCompanyProfile }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function siteHostname(website: string): string {
  try {
    const u = website.startsWith("http") ? website : `https://${website}`
    return new URL(u).hostname.replace(/^www\./, "")
  } catch {
    return website.replace(/^https?:\/\//, "").replace(/\/$/, "")
  }
}
