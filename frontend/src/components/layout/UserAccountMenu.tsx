import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Globe, HelpCircle, LogOut, Settings, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearSession } from "@/lib/session"
import { currentUser } from "@/lib/mock-data"

const LANGUAGES = ["English", "한국어"] as const

/**
 * User account dropdown — used in both the dashboard and agent-mode sidebars.
 * Opens above the trigger button with: email, Settings, Language submenu,
 * Get help, View all plans, Invite users, Log out.
 */
export function UserAccountMenu() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English")

  function handleLogout() {
    clearSession()
    navigate("/login")
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group/menu-button peer/menu-button flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-muted text-sm font-semibold">
              {currentUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight group-data-[collapsible=icon]:hidden">
            {currentUser.name}
          </span>
          <Settings className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-64 p-1.5">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
          {currentUser.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2">
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Globe className="size-4" />
            <span className="flex-1">Language</span>
            <span className="text-xs text-muted-foreground">{language}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-40">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
                className="gap-2"
              >
                {lang}
                {language === lang && (
                  <span className="ml-auto text-xs text-muted-foreground">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => navigate("/help")} className="gap-2">
          <HelpCircle className="size-4" />
          Help Center
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings?tab=billing")} className="gap-2">
          <CreditCard className="size-4" />
          View all plans
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings/team")} className="gap-2">
          <UserPlus className="size-4" />
          Invite users
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2">
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
