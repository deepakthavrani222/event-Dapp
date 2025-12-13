"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRole, type UserRole } from "@/hooks/use-role"
import { useAuth } from "@/lib/context/AuthContext"
import {
  Menu,
  X,
  Ticket,
  User,
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  Building,
  Music,
  ShoppingBag,
  Shield,
  ScanLine,
  Wallet,
  MessageCircle,
  Crown,
  Award,
} from "lucide-react"
import { NotificationBell } from "./notification-bell"
import { motion, AnimatePresence } from "framer-motion"

interface DashboardHeaderProps {
  role: UserRole
}

const roleNavigation: Record<Exclude<UserRole, 'guest'>, Array<{ label: string; href: string; icon: React.ElementType }>> = {
  buyer: [
    { label: "Browse Events", href: "/buyer", icon: Calendar },
    { label: "My Tickets", href: "/buyer/tickets", icon: Ticket },
    { label: "Resale Market", href: "/buyer/resale", icon: ShoppingBag },
  ],
  organizer: [
    { label: "Dashboard", href: "/organizer", icon: LayoutDashboard },
    { label: "Create Event", href: "/organizer/create", icon: Calendar },
    { label: "My Events", href: "/organizer/events", icon: Music },
    { label: "Earnings", href: "/organizer/earnings", icon: TrendingUp },
    { label: "Settings", href: "/organizer/settings", icon: Shield },
  ],
  promoter: [
    { label: "Dashboard", href: "/promoter", icon: LayoutDashboard },
    { label: "Links", href: "/promoter/links", icon: TrendingUp },
    { label: "Earnings", href: "/promoter/earnings", icon: TrendingUp },
  ],
  "venue-owner": [
    { label: "Dashboard", href: "/venue-owner", icon: LayoutDashboard },
    { label: "Venues", href: "/venue-owner/venues", icon: Building },
  ],
  artist: [
    { label: "Dashboard", href: "/artist", icon: LayoutDashboard },
    { label: "Analytics", href: "/artist?tab=analytics", icon: TrendingUp },
    { label: "Fan Messages", href: "/artist?tab=messaging", icon: MessageCircle },
    { label: "Golden Tickets", href: "/artist?tab=golden-tickets", icon: Crown },
    { label: "Verification", href: "/artist?tab=verification", icon: Award },
  ],
  reseller: [
    { label: "Dashboard", href: "/reseller", icon: LayoutDashboard },
    { label: "Bulk Buy", href: "/reseller/bulk", icon: ShoppingBag },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Events", href: "/admin?tab=approvals", icon: Calendar },
    { label: "Users", href: "/admin?tab=users", icon: Users },
  ],
  inspector: [
    { label: "Scanner", href: "/inspector", icon: ScanLine },
    { label: "History", href: "/inspector/history", icon: Calendar },
  ],
}

const roleTitles: Record<Exclude<UserRole, 'guest'>, string> = {
  buyer: "Buyer",
  organizer: "Organizer",
  promoter: "Promoter",
  "venue-owner": "Venue Owner",
  artist: "Artist",
  reseller: "Reseller",
  admin: "Admin",
  inspector: "Inspector",
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user: authUser } = useAuth()
  const navigation = roleNavigation[role] || []

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Ticket className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-primary/50 transition-all" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TicketChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* User Info */}
          <div className="hidden md:flex items-center gap-3">
            {authUser?.walletAddress && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <Wallet className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-300">
                  {authUser.walletAddress.slice(0, 6)}...{authUser.walletAddress.slice(-4)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <User className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-gray-300">
                {authUser?.name || authUser?.email?.split('@')[0] || 'Guest User'}
              </span>
            </div>
          </div>
          
          <NotificationBell />

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-card"
          >
            <nav className="container py-4 space-y-2">
              {/* User Info in Mobile */}
              <div className="flex items-center gap-3 py-3 mb-2 border-b border-white/10">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {authUser?.name || authUser?.email?.split('@')[0] || 'Guest User'}
                  </p>
                  {authUser?.walletAddress && (
                    <p className="text-xs text-gray-400">
                      {authUser.walletAddress.slice(0, 6)}...{authUser.walletAddress.slice(-4)}
                    </p>
                  )}
                </div>
              </div>
              
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
