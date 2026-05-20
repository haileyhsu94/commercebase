import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Check, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setSession } from "@/lib/session"
import { saveOnboarding } from "@/lib/onboarding-storage"
import { cn } from "@/lib/utils"

type Phase = "form" | "verify"

export function Signup() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>("form")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const pwReqs = [
    { label: "8 characters minimum (max 40)", ok: password.length >= 8 && password.length <= 40 },
    { label: "1 lowercase letter", ok: /[a-z]/.test(password) },
    { label: "1 uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "1 special character", ok: /[^A-Za-z0-9]/.test(password) },
    { label: "1 number", ok: /[0-9]/.test(password) },
  ]
  const pwValid = pwReqs.every((r) => r.ok)
  const formValid = email.includes("@") && firstName.trim() && pwValid

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setPhase("verify")
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) return
    setSubmitting(true)
    setTimeout(() => {
      setSession({
        email,
        name: `${firstName} ${lastName}`.trim(),
        signedUpAt: new Date().toISOString(),
      })
      saveOnboarding({ signupCompletedAt: new Date().toISOString(), step: 1 })
      navigate("/onboarding")
    }, 250)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left rail — branding */}
      <aside className="hidden w-[420px] shrink-0 flex-col justify-between bg-muted/30 p-8 md:flex">
        <div className="flex items-center gap-2">
          <img src="/commercebase-logo.svg" alt="" className="size-6 dark:invert" />
          <span className="text-sm font-semibold">CommerceBase</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Get started with CommerceBase</h1>
          <p className="text-sm text-muted-foreground">
            Create your account to unlock AI-powered campaigns across our publisher network — no
            channel guesswork, no manual reallocation.
          </p>
        </div>
        <div className="text-[11px] text-muted-foreground">© 2026 Realry · CommerceBase</div>
      </aside>

      {/* Right — content */}
      <main className="flex flex-1 items-center justify-center p-6">
        {phase === "form" ? (
          <form onSubmit={submitForm} className="w-full max-w-sm space-y-5">
            <header>
              <h2 className="text-2xl font-semibold">Create your account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll send a verification code to confirm your email.
              </p>
            </header>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium">
                Email address <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbrand.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-xs font-medium">
                  First name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Hailey"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-xs font-medium">
                  Last name
                </label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Hsu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium">
                Password <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <ul className="space-y-1 text-[11px]">
              {pwReqs.map((r) => (
                <li
                  key={r.label}
                  className={cn(
                    "flex items-center gap-1.5",
                    r.ok ? "text-emerald-600" : "text-muted-foreground",
                  )}
                >
                  {r.ok ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="size-3 rounded-full border border-muted-foreground/40" />
                  )}
                  {r.label}
                </li>
              ))}
            </ul>

            <Button type="submit" disabled={!formValid} className="w-full gap-1.5">
              Create account
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              By creating an account you agree to the Terms of Sale and Privacy Policy.
            </p>
          </form>
        ) : (
          <form onSubmit={submitCode} className="w-full max-w-md space-y-5 rounded-2xl border bg-card p-6">
            <header className="text-center">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-foreground/10">
                <Mail className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold">Verify your email</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
              </p>
            </header>

            <div className="space-y-1.5">
              <label htmlFor="code" className="text-xs font-medium">
                Verification code
              </label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoFocus
                className="text-center text-lg tracking-[0.5em] font-mono"
              />
              <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                Demo: any 6 digits will work
              </p>
            </div>

            <Button type="submit" disabled={code.length !== 6 || submitting} className="w-full gap-1.5">
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setPhase("form")}
                className="text-muted-foreground underline-offset-2 hover:underline"
              >
                ← Use a different email
              </button>
              <button
                type="button"
                className="text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setCode("000000")}
              >
                Use 000000
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
