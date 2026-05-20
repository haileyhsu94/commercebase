import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CountrySelect } from "@/components/onboarding/CountrySelect"
import { OnboardingShell } from "@/components/onboarding/OnboardingShell"
import {
  getCompanyProfile,
  patchCompanyProfile,
  type AccountOwnership,
} from "@/lib/company-profile"
import { saveOnboarding } from "@/lib/onboarding-storage"
import { currencyForCountry } from "@/lib/mock-data"
import { SECTOR_FIELDS, SECTORS } from "@/lib/sector-fields"
import { CURRENCY_OPTIONS } from "@/types/campaign-wizard"

const OWNERSHIP_OPTIONS: { value: AccountOwnership; label: string }[] = [
  { value: "own", label: "I will manage this account for my own company" },
  { value: "agency-manages", label: "I am creating my company's account but an agency will manage it" },
  { value: "agency-on-behalf", label: "I am an agency creating an account on behalf of my client" },
  { value: "agency-only", label: "I am an agency and I want to create my agency account" },
]

interface Props {
  onContinue: () => void
  onBack: () => void
}

export function StepBusinessProfile({ onContinue, onBack }: Props) {
  const profile = getCompanyProfile()
  const [country, setCountry] = useState(profile.country ?? "")
  const [currency, setCurrency] = useState(
    profile.currency ?? (profile.country ? currencyForCountry(profile.country) : "USD"),
  )
  // Track whether the user manually overrode the auto-derived currency.
  const [currencyTouched, setCurrencyTouched] = useState(false)
  const [sector, setSector] = useState(profile.sector ?? "")
  const [fieldOfBusiness, setFieldOfBusiness] = useState(profile.fieldOfBusiness ?? "")
  const [ownership, setOwnership] = useState<AccountOwnership | "">(profile.accountOwnership ?? "")
  const [agencyName, setAgencyName] = useState(profile.agencyName ?? "")

  // Cascade country → currency unless the user has touched the currency control.
  useEffect(() => {
    if (currencyTouched || !country) return
    const next = currencyForCountry(country)
    if (next && next !== currency) setCurrency(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country])

  // Cascade sector → field: reset field if it's no longer valid.
  const fields = useMemo(() => (sector ? SECTOR_FIELDS[sector] ?? [] : []), [sector])
  useEffect(() => {
    if (sector && fieldOfBusiness && !fields.includes(fieldOfBusiness)) {
      setFieldOfBusiness("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector])

  const isAgency = ownership && ownership !== "own"
  const formValid =
    country &&
    currency &&
    sector &&
    fieldOfBusiness &&
    ownership &&
    (!isAgency || agencyName.trim())

  function handleContinue() {
    patchCompanyProfile({
      country,
      currency,
      sector,
      fieldOfBusiness,
      accountOwnership: ownership as AccountOwnership,
      agencyName: isAgency ? agencyName.trim() : undefined,
    })
    saveOnboarding({ step: 3 })
    onContinue()
  }

  return (
    <OnboardingShell
      step={2}
      leftTitle="Set up your business profile"
      leftDescription="This lets us localize the experience, choose the right currency and reporting defaults, and route campaigns to the audiences and markets that match your business."
      leftIllustration={
        <div className="flex h-32 items-center justify-center rounded-2xl border bg-card">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button size="sm" onClick={handleContinue} disabled={!formValid} className="gap-1.5">
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </>
      }
    >
      <div className="mx-auto w-full max-w-2xl space-y-6 p-8">
        <header>
          <h2 className="text-2xl font-semibold">Business profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A few details so we can localize the experience.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Country" required>
            <CountrySelect value={country} onChange={setCountry} />
          </Field>
          <Field label="Currency" required>
            <Select
              value={currency}
              onValueChange={(v) => {
                setCurrencyTouched(true)
                setCurrency(v ?? "USD")
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.symbol} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Professional sector" required>
            <Select value={sector} onValueChange={(v) => setSector(v ?? "")}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Field" required>
            <Select
              value={fieldOfBusiness}
              onValueChange={(v) => setFieldOfBusiness(v ?? "")}
              disabled={!sector}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={sector ? "Select your option" : "Pick a sector first"} />
              </SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Who will manage this account?" required>
          <Select value={ownership} onValueChange={(v) => setOwnership((v ?? "") as AccountOwnership)}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select an option…" />
            </SelectTrigger>
            <SelectContent>
              {OWNERSHIP_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {isAgency && (
          <Field label="Agency name" required>
            <Input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Name of your agency"
            />
          </Field>
        )}
      </div>
    </OnboardingShell>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}
