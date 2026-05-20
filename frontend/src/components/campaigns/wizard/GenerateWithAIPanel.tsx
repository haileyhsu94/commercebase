import { useState } from "react"
import { Check, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { defaultCompanyProfile } from "@/lib/mock-data"
import type { CampaignWizardFormData } from "@/types/campaign-wizard"

interface GeneratedVariant {
  id: string
  url: string
  aspect: "1.91:1" | "1:1" | "9:16"
  label: string
}

/**
 * Inline AI-generation panel for Step 4. Shows a "Review brand info" card
 * pre-filled from the company profile + current form, then a Generate
 * button that mocks producing 4 preview images. Users can toggle each
 * variant on/off; selected ones append to formData.assetImageUrls[].
 */
export function GenerateWithAIPanel({
  formData,
  patch,
  onSelectionChange,
}: {
  formData: CampaignWizardFormData
  patch: (p: Partial<CampaignWizardFormData>) => void
  onSelectionChange: (selectedUrls: string[]) => void
}) {
  const [phase, setPhase] = useState<"review" | "generating" | "preview">(
    "review",
  )
  const [variants, setVariants] = useState<GeneratedVariant[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function startGenerate() {
    setPhase("generating")
    setSelected(new Set())
    // Mocked latency
    setTimeout(() => {
      const seed = (formData.businessName || defaultCompanyProfile.companyName)
        .toLowerCase()
        .replace(/\W+/g, "-")
      const next: GeneratedVariant[] = [
        {
          id: "v1",
          aspect: "1.91:1",
          label: "Landscape",
          url: `https://picsum.photos/seed/${seed}-1/600/315`,
        },
        {
          id: "v2",
          aspect: "1:1",
          label: "Square",
          url: `https://picsum.photos/seed/${seed}-2/500/500`,
        },
        {
          id: "v3",
          aspect: "9:16",
          label: "Vertical",
          url: `https://picsum.photos/seed/${seed}-3/360/640`,
        },
        {
          id: "v4",
          aspect: "1.91:1",
          label: "Landscape (alt)",
          url: `https://picsum.photos/seed/${seed}-4/600/315`,
        },
      ]
      setVariants(next)
      // Auto-select all 4 by default so the user gets a preview right away;
      // they can de-select what they don't want.
      const allIds = new Set(next.map((v) => v.id))
      setSelected(allIds)
      onSelectionChange(next.map((v) => v.url))
      setPhase("preview")
    }, 700)
  }

  function toggleVariant(v: GeneratedVariant) {
    const next = new Set(selected)
    if (next.has(v.id)) next.delete(v.id)
    else next.add(v.id)
    setSelected(next)
    onSelectionChange(
      variants.filter((vv) => next.has(vv.id)).map((vv) => vv.url),
    )
  }

  function regenerate() {
    onSelectionChange([])
    setPhase("review")
  }

  return (
    <div
      className="rounded-lg p-px"
      style={{
        backgroundImage:
          "linear-gradient(110deg, rgb(251,146,60) 0%, rgb(244,114,182) 50%, rgb(45,212,191) 100%)",
      }}
    >
    <div className="relative space-y-4 rounded-[7px] bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4" />
        Generate ad images with AI
      </div>
      <p className="text-xs text-muted-foreground">
        Only the ad images are generated here. Your logo, brand colors, and brand fonts stay as
        detected — manage them in the Upload source or under Advanced.
      </p>

      {phase === "review" && (
        <ReviewBrandInfo
          formData={formData}
          patch={patch}
          onGenerate={startGenerate}
        />
      )}

      {phase === "generating" && (
        <div className="flex items-center justify-center gap-2 rounded-md border bg-card p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating 4 on-brand variants…
        </div>
      )}

      {phase === "preview" && (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selected.size} of {variants.length} selected · click a variant to toggle
            </span>
            <Button variant="outline" size="sm" onClick={regenerate}>
              Regenerate
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {variants.map((v) => (
              <VariantCard
                key={v.id}
                variant={v}
                selected={selected.has(v.id)}
                onToggle={() => toggleVariant(v)}
              />
            ))}
          </div>
        </>
      )}
    </div>
    </div>
  )
}

function ReviewBrandInfo({
  formData,
  patch,
  onGenerate,
}: {
  formData: CampaignWizardFormData
  patch: (p: Partial<CampaignWizardFormData>) => void
  onGenerate: () => void
}) {
  const profile = defaultCompanyProfile
  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <p className="text-xs text-muted-foreground">
        Review the brand info we'll feed into the model. We pre-filled it from your onboarding —
        edit anything that's off.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <BrandField
          label="Business name"
          value={formData.businessName || profile.companyName}
          onChange={(v) => patch({ businessName: v })}
          placeholder={profile.companyName}
        />
        <BrandField
          label="Industry"
          value={profile.industry}
          onChange={() => undefined}
          placeholder={profile.industry}
          disabled
        />
        <BrandField
          label="Website"
          value={formData.finalUrl || profile.website}
          onChange={(v) => patch({ finalUrl: v })}
          placeholder={profile.website}
          className="md:col-span-2"
        />
      </div>
      <div className="flex justify-end pt-1">
        <Button onClick={onGenerate} className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Generate images
        </Button>
      </div>
    </div>
  )
}

function BrandField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-[11px] font-medium text-muted-foreground">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-8 text-sm"
      />
    </div>
  )
}

function VariantCard({
  variant,
  selected,
  onToggle,
}: {
  variant: GeneratedVariant
  selected: boolean
  onToggle: () => void
}) {
  const aspectClass =
    variant.aspect === "9:16"
      ? "aspect-[9/16]"
      : variant.aspect === "1:1"
        ? "aspect-square"
        : "aspect-[1.91/1]"

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card text-left transition-all",
        selected
          ? "border-foreground shadow-sm ring-2 ring-foreground/10"
          : "border-border hover:border-foreground/30",
      )}
    >
      <div className={cn("relative w-full bg-muted", aspectClass)}>
        <img
          src={variant.url}
          alt={`Generated ${variant.label}`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {selected && (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px]">
        <span className="font-medium">{variant.label}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 uppercase tracking-wide text-muted-foreground">
          {variant.aspect}
        </span>
      </div>
    </button>
  )
}
