import { defaultCompanyProfile } from "@/lib/mock-data"

const STORAGE_KEY = "commercebase_company_profile_v1"
export const COMPANY_PROFILE_UPDATED_EVENT = "commercebase-company-profile-updated"

export interface BrandMemories {
  /** Markdown / rich-text body. */
  companyOverview: string
  icp: string
  messagingPositioning: string
  /** ISO timestamp when these were last generated. */
  generatedAt?: string
}

export interface BillingInfo {
  companyName: string
  country: string
  state?: string
  address: string
  postalCode: string
  city: string
  taxId?: string
  /** Mock payment method — last4 + brand only, no real card storage. */
  paymentMethod?: { last4: string; brand: string }
}

export type AccountOwnership =
  | "own"
  | "agency-manages"
  | "agency-on-behalf"
  | "agency-only"

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

  // Captured/updated during onboarding ↓
  currency?: string
  language?: string
  /** User's role at the company (Marketing Manager / CMO / etc.) */
  role?: string
  /** Top-level industry sector (Fashion & Apparel, Electronics, …) */
  sector?: string
  /** Sub-field within the sector (Apparel, Footwear, …) */
  fieldOfBusiness?: string
  /** Multi-tenant ownership relationship. */
  accountOwnership?: AccountOwnership
  /** Name of the agency, when accountOwnership is any agency variant. */
  agencyName?: string

  /** Brand identity captured at onboarding (URL-derived in production). */
  brandMainColor?: string
  brandAccentColor?: string
  brandFont?: string
  logoUrl?: string

  /** Synthesized AI brand memories — referenced by the agent and the wizard. */
  brandMemories?: BrandMemories

  /** Onboarding-step billing details. */
  billing?: BillingInfo
}

function notifyUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(COMPANY_PROFILE_UPDATED_EVENT))
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
        // Onboarding fields
        currency: parsed.currency ?? defaultCompanyProfile.currency,
        language: parsed.language ?? defaultCompanyProfile.language,
        role: parsed.role,
        sector: parsed.sector,
        fieldOfBusiness: parsed.fieldOfBusiness,
        accountOwnership: parsed.accountOwnership,
        agencyName: parsed.agencyName,
        brandMainColor: parsed.brandMainColor ?? defaultCompanyProfile.brandMainColor,
        brandAccentColor: parsed.brandAccentColor ?? defaultCompanyProfile.brandAccentColor,
        brandFont: parsed.brandFont ?? defaultCompanyProfile.brandFont,
        logoUrl: parsed.logoUrl ?? defaultCompanyProfile.logoUrl,
        brandMemories: parsed.brandMemories,
        billing: parsed.billing,
      }
    }
  } catch {
    /* ignore */
  }
  return { ...defaultCompanyProfile }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  notifyUpdated()
}

/** Merge a partial update into the stored profile. */
export function patchCompanyProfile(patch: Partial<CompanyProfile>): CompanyProfile {
  const current = getCompanyProfile()
  const next: CompanyProfile = { ...current, ...patch }
  saveCompanyProfile(next)
  return next
}

export function siteHostname(website: string): string {
  try {
    const u = website.startsWith("http") ? website : `https://${website}`
    return new URL(u).hostname.replace(/^www\./, "")
  } catch {
    return website.replace(/^https?:\/\//, "").replace(/\/$/, "")
  }
}
