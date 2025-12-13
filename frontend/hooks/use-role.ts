"use client"

import { useAuth } from "@/lib/context/AuthContext"

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

export function useRole() {
  const { user: authUser, loading, logout: authLogout, isAuthenticated } = useAuth()

  // Convert auth user to role user format
  const user = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email || '',
    role: (authUser.role?.toLowerCase() || 'buyer') as UserRole,
    walletAddress: authUser.walletAddress,
    avatar: undefined
  } : null

  const switchRole = (newRole: UserRole) => {
    // For demo purposes, allow role switching
    // In production, this would be handled by backend
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('demo-role', newRole)
      window.location.reload()
    }
  }

  // Get demo role from localStorage if exists
  const demoRole = typeof window !== 'undefined' ? localStorage.getItem('demo-role') as UserRole : null
  const currentRole = demoRole || user?.role || 'guest'

  return {
    user,
    role: currentRole,
    isGuest: !isAuthenticated || currentRole === "guest",
    isBuyer: currentRole === "buyer",
    isOrganizer: currentRole === "organizer",
    isPromoter: currentRole === "promoter",
    isVenueOwner: currentRole === "venue-owner",
    isArtist: currentRole === "artist",
    isReseller: currentRole === "reseller",
    isAdmin: currentRole === "admin",
    isInspector: currentRole === "inspector",
    loading,
    switchRole,
    logout: authLogout,
  }
}
