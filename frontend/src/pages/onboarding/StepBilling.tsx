import { useState } from "react"
import { ArrowLeft, ArrowRight, CreditCard, Plus } from "lucide-react"
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

// Tiny per-country states map (mockup-grade; expand as needed).
const COUNTRY_STATES: Record<string, string[]> = {
  "United States": [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  ],
  Canada: ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"],
  Australia: ["ACT","NSW","NT","QLD","SA","TAS","VIC","WA"],
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
  const [showPayment, setShowPayment] = useState(!!existing?.paymentMethod)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  const statesForCountry = COUNTRY_STATES[country] ?? []
  const requiresState = statesForCountry.length > 0
  const formValid =
    companyName.trim() &&
    country &&
    address.trim() &&
    postalCode.trim() &&
    city.trim() &&
    (!requiresState || state)

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
    if (showPayment && cardNumber.replace(/\s/g, "").length >= 4) {
      const digits = cardNumber.replace(/\D/g, "")
      const last4 = digits.slice(-4)
      const brand = digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Card"
      billing.paymentMethod = { last4, brand }
    }
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
            Your company billing address. Payment method is optional and can be added later.
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
                <SelectValue placeholder={requiresState ? "All states" : "Not applicable"} />
              </SelectTrigger>
              <SelectContent>
                {statesForCountry.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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

        {/* Payment method (optional) */}
        <section className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Payment method</div>
              <p className="text-xs text-muted-foreground">
                Optional — you can launch your first campaign without one.
              </p>
            </div>
            {!showPayment && (
              <Button variant="outline" size="sm" onClick={() => setShowPayment(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add payment method
              </Button>
            )}
          </div>
          {showPayment && (
            <div className="space-y-3">
              <Field label="Card number">
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry">
                  <Input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                  />
                </Field>
                <Field label="CVC">
                  <Input
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    inputMode="numeric"
                  />
                </Field>
              </div>
            </div>
          )}
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
