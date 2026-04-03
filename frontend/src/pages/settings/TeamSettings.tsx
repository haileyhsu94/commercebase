import { useMemo, useState } from "react"
import { Mail, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  defaultOrganization,
  generateMemberId,
  loadTeamMembers,
  saveTeamMembers,
  type TeamMemberRow,
  type TeamRole,
} from "@/lib/team-mock"
import { cn } from "@/lib/utils"
import { SettingsTabNav } from "@/pages/settings/SettingsTabNav"
import { Tabs, TabsContent } from "@/components/ui/tabs"

function roleLabel(role: TeamRole): string {
  switch (role) {
    case "owner":
      return "Owner"
    case "admin":
      return "Admin"
    case "member":
      return "Member"
    default:
      return role
  }
}

export function TeamSettings() {
  const [members, setMembers] = useState<TeamMemberRow[]>(() => loadTeamMembers())
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamRole>("member")

  const orgName = defaultOrganization.name

  const persist = (next: TeamMemberRow[]) => {
    setMembers(next)
    saveTeamMembers(next)
  }

  const handleInvite = () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !email.includes("@")) return
    if (members.some((m) => m.email.toLowerCase() === email)) {
      setInviteOpen(false)
      setInviteEmail("")
      return
    }
    const row: TeamMemberRow = {
      id: generateMemberId(),
      name: email.split("@")[0] ?? "Invited user",
      email,
      role: inviteRole,
      status: "pending",
    }
    persist([...members, row])
    setInviteOpen(false)
    setInviteEmail("")
    setInviteRole("member")
  }

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const order = (r: TeamRole) =>
          r === "owner" ? 0 : r === "admin" ? 1 : 2
        return order(a.role) - order(b.role) || a.name.localeCompare(b.name)
      }),
    [members]
  )

  return (
    <>
      <div className="py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, billing, API keys, and integrations.
        </p>
      </div>

      <Tabs value="team" orientation="vertical" className="w-full gap-4 md:gap-8">
        <SettingsTabNav />
        <TabsContent value="team" className="mt-0 min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Team</h2>
              <p className="text-sm text-muted-foreground">
                Invite members and manage roles for {orgName}.
              </p>
            </div>
            <Button onClick={() => setInviteOpen(true)} className="shrink-0 gap-2">
              <UserPlus className="size-4" />
              Invite member
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace</CardTitle>
              <CardDescription>Organization name as shown across CommerceBase.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{orgName}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Members</CardTitle>
                <CardDescription>People who can access this workspace.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMembers.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="pl-6 font-medium">{m.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="size-3.5 shrink-0 opacity-70" aria-hidden />
                          {m.email}
                        </span>
                      </TableCell>
                      <TableCell>{roleLabel(m.role)}</TableCell>
                      <TableCell className="pr-6">
                        <Badge
                          variant={m.status === "active" ? "secondary" : "outline"}
                          className={cn(
                            m.status === "pending" && "border-amber-500/50 text-amber-900 dark:text-amber-100"
                          )}
                        >
                          {m.status === "active" ? "Active" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              They will receive an invitation email (simulated in this mock). Pending members appear in
              the table until they accept.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Role</span>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as TeamRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admins can invite members and manage workspace settings. Owners are assigned when the
                workspace is created.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim().includes("@")}>
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
