import { useState } from "react"
import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react"
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
import { getCompanyProfile, patchCompanyProfile, type BillingInfo } from "@/lib/company-profile"
import { saveOnboarding } from "@/lib/onboarding-storage"

// Per-country states/provinces (full name for display; code stored as value).
interface RegionOption { value: string; label: string }
const COUNTRY_STATES: Record<string, RegionOption[]> = {
  "United States": [
    {value:"AL",label:"Alabama"},{value:"AK",label:"Alaska"},{value:"AZ",label:"Arizona"},{value:"AR",label:"Arkansas"},
    {value:"CA",label:"California"},{value:"CO",label:"Colorado"},{value:"CT",label:"Connecticut"},{value:"DE",label:"Delaware"},
    {value:"FL",label:"Florida"},{value:"GA",label:"Georgia"},{value:"HI",label:"Hawaii"},{value:"ID",label:"Idaho"},
    {value:"IL",label:"Illinois"},{value:"IN",label:"Indiana"},{value:"IA",label:"Iowa"},{value:"KS",label:"Kansas"},
    {value:"KY",label:"Kentucky"},{value:"LA",label:"Louisiana"},{value:"ME",label:"Maine"},{value:"MD",label:"Maryland"},
    {value:"MA",label:"Massachusetts"},{value:"MI",label:"Michigan"},{value:"MN",label:"Minnesota"},{value:"MS",label:"Mississippi"},
    {value:"MO",label:"Missouri"},{value:"MT",label:"Montana"},{value:"NE",label:"Nebraska"},{value:"NV",label:"Nevada"},
    {value:"NH",label:"New Hampshire"},{value:"NJ",label:"New Jersey"},{value:"NM",label:"New Mexico"},{value:"NY",label:"New York"},
    {value:"NC",label:"North Carolina"},{value:"ND",label:"North Dakota"},{value:"OH",label:"Ohio"},{value:"OK",label:"Oklahoma"},
    {value:"OR",label:"Oregon"},{value:"PA",label:"Pennsylvania"},{value:"RI",label:"Rhode Island"},{value:"SC",label:"South Carolina"},
    {value:"SD",label:"South Dakota"},{value:"TN",label:"Tennessee"},{value:"TX",label:"Texas"},{value:"UT",label:"Utah"},
    {value:"VT",label:"Vermont"},{value:"VA",label:"Virginia"},{value:"WA",label:"Washington"},{value:"WV",label:"West Virginia"},
    {value:"WI",label:"Wisconsin"},{value:"WY",label:"Wyoming"},
  ],
  Canada: [
    {value:"AB",label:"Alberta"},{value:"BC",label:"British Columbia"},{value:"MB",label:"Manitoba"},
    {value:"NB",label:"New Brunswick"},{value:"NL",label:"Newfoundland and Labrador"},{value:"NS",label:"Nova Scotia"},
    {value:"NT",label:"Northwest Territories"},{value:"NU",label:"Nunavut"},{value:"ON",label:"Ontario"},
    {value:"PE",label:"Prince Edward Island"},{value:"QC",label:"Quebec"},{value:"SK",label:"Saskatchewan"},{value:"YT",label:"Yukon"},
  ],
  Australia: [
    {value:"ACT",label:"Australian Capital Territory"},{value:"NSW",label:"New South Wales"},{value:"NT",label:"Northern Territory"},
    {value:"QLD",label:"Queensland"},{value:"SA",label:"South Australia"},{value:"TAS",label:"Tasmania"},
    {value:"VIC",label:"Victoria"},{value:"WA",label:"Western Australia"},
  ],
}

interface Props {
  onContinue: () => void
  onBack: () => void
}

export function StepBilling({ onContinue, onBack }: Props) {
  const profile = getCompanyProfile()
  const existing = profile.billing
  const [companyName, setCompanyName] = useState(existing?.companyName ?? profile.companyName ?? "")
  const [country, setCountry] = useState(existing?.country ?? profile.country ?? "United States")
  const [state, setState] = useState(existing?.state ?? "")
  const [address, setAddress] = useState(existing?.address ?? "")
  const [postalCode, setPostalCode] = useState(existing?.postalCode ?? "")
  const [city, setCity] = useState(existing?.city ?? "")
  const [taxId, setTaxId] = useState(existing?.taxId ?? "")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  const statesForCountry = COUNTRY_STATES[country] ?? []
  const requiresState = statesForCountry.length > 0
  const cardDigits = cardNumber.replace(/\D/g, "")
  const expiryValid = /^\d{2}\/\d{2}$/.test(cardExpiry)
  const cvcValid = /^\d{3,4}$/.test(cardCvc)
  const paymentValid = cardDigits.length >= 12 && expiryValid && cvcValid
  const formValid =
    companyName.trim() &&
    country &&
    address.trim() &&
    postalCode.trim() &&
    city.trim() &&
    (!requiresState || state) &&
    paymentValid

  function handleContinue() {
    const billing: BillingInfo = {
      companyName: companyName.trim(),
      country,
      state: requiresState ? state : undefined,
      address: address.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      taxId: taxId.trim() || undefined,
    }
    const last4 = cardDigits.slice(-4)
    const brand = cardDigits.startsWith("4") ? "Visa" : cardDigits.startsWith("5") ? "Mastercard" : "Card"
    billing.paymentMethod = { last4, brand }
    patchCompanyProfile({ billing })
    saveOnboarding({ step: 5 })
    onContinue()
  }

  return (
    <OnboardingShell
      step={4}
      leftTitle="Fill in your billing information"
      leftDescription="This helps us verify your account faster, so you can launch your first campaign in no time. You can update billing details anytime in Settings."
      leftIllustration={
        <div className="flex h-32 items-center justify-center rounded-2xl border bg-card">
          <CreditCard className="h-10 w-10 text-muted-foreground" />
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
          <h2 className="text-2xl font-semibold">Billing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your company billing address and payment method. We won't charge you until you launch your first campaign.
          </p>
        </header>

        <Field label="Company name" required>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="My company name"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Country" required>
            <CountrySelect value={country} onChange={setCountry} />
          </Field>
          <Field label="State / Region" required={requiresState}>
            <Select
              value={state}
              onValueChange={(v) => setState(v ?? "")}
              disabled={!requiresState}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={requiresState ? "Select a state" : "Not applicable"}>
                  {(value) => {
                    if (!value) return null
                    const match = statesForCountry.find((s) => s.value === value)
                    return match?.label ?? String(value)
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statesForCountry.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Billing address" required>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 street name"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Postal code" required>
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="00000" />
          </Field>
          <Field label="City" required>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City name" />
          </Field>
        </div>

        <Field label="Company ID / Tax number">
          <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Optional" />
        </Field>

        {/* Payment method (required) */}
        <section className="space-y-3 rounded-xl border bg-card p-4">
          <div>
            <div className="text-sm font-semibold">Payment method</div>
            <p className="text-xs text-muted-foreground">
              We won't charge you until you launch your first campaign.
            </p>
          </div>
          <Field label="Card number" required>
            <Input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              maxLength={19}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry" required>
              <Input
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                maxLength={5}
              />
            </Field>
            <Field label="CVC" required>
              <Input
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="123"
                inputMode="numeric"
              />
            </Field>
          </div>
        </section>
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

/**
 * Format card expiry input: strip non-digits, insert "/" after the month
 * (so "1225" → "12/25", "12" → "12", "1" → "1"). Allows backspace to
 * naturally remove the slash by re-running the formatter on the cleaned digits.
 */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4)
  if (digits.length === 0) return ""
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Format card number with a space every 4 digits (max 16 digits → 19 chars). */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(.{4})/g, "$1 ").trim()
}
