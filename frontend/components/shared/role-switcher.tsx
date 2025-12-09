"use client"

import { useRole, type UserRole } from "@/hooks/use-role"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, ChevronDown } from "lucide-react"

const ROLES: { value: UserRole; label: string }[] = [
  { value: "buyer", label: "Buyer" },
  { value: "organizer", label: "Organizer" },
  { value: "promoter", label: "Promoter" },
  { value: "venue-owner", label: "Venue Owner" },
  { value: "artist", label: "Artist" },
  { value: "reseller", label: "Reseller" },
  { value: "admin", label: "Admin" },
  { value: "inspector", label: "Inspector" },
]

export function RoleSwitcher() {
  const { role, switchRole, user } = useRole()

  const currentRoleLabel = ROLES.find((r) => r.value === role)?.label || "Guest"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{currentRoleLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.value}
            onClick={() => switchRole(r.value)}
            className={role === r.value ? "bg-accent" : ""}
          >
            {r.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
