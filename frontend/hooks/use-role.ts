"use client"

import { useState, useEffect } from "react"

export type UserRole =
  | "guest"
  | "buyer"
  | "organizer"
  | "promoter"
  | "venue-owner"
  | "artist"
  | "reseller"
  | "admin"
  | "inspector"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

// Mock user data - replace with real auth
const MOCK_USER: User = {
  id: "1",
  name: "Demo User",
  email: "demo@ticketchain.io",
  role: "buyer",
  avatar: "/diverse-user-avatars.png",
}

export function useRole() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      setUser(MOCK_USER)
      setLoading(false)
    }, 100)
  }, [])

  const switchRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole })
    }
  }

  return {
    user,
    role: user?.role || "guest",
    isGuest: !user || user.role === "guest",
    isBuyer: user?.role === "buyer",
    isOrganizer: user?.role === "organizer",
    isPromoter: user?.role === "promoter",
    isVenueOwner: user?.role === "venue-owner",
    isArtist: user?.role === "artist",
    isReseller: user?.role === "reseller",
    isAdmin: user?.role === "admin",
    isInspector: user?.role === "inspector",
    loading,
    switchRole,
  }
}
