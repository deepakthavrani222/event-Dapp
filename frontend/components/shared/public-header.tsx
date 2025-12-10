"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRole } from "@/hooks/use-role"
import { useAuth } from "@/lib/context/AuthContext"
import { UserSidebar } from "./user-sidebar"

import { Menu, X, MapPin, Search, Wallet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const guestNavItems = [
  { label: "For you", href: "/" },
  { label: "Events", href: "/events", active: true },
  { label: "Activities", href: "/activities" },
  { label: "Stores", href: "/stores" },
]

const buyerNavItems = [
  { label: "For you", href: "/" },
  { label: "Events", href: "/buyer" },
  { label: "My Tickets", href: "/my-tickets" },
  { label: "Resale Market", href: "/buyer/resale" },
]

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isGuest } = useRole()
  const { user: authUser } = useAuth()
  
  // Use different nav items based on login status
  const navItems = isGuest ? guestNavItems : buyerNavItems

  return (
    <>
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="text-2xl font-black text-gradient-neon">TicketChain</div>
        </Link>

        {/* Location */}
        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/10 transition-colors border border-white/10">
          <MapPin className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-white">Bangalore</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                item.active
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Search className="h-5 w-5" />
          </Button>

          {isGuest ? (
            <Link href="/login">
              <Button
                size="sm"
                className="hidden md:flex gradient-purple-cyan hover:opacity-90 border-0 text-white rounded-full h-10 px-6 font-semibold neon-glow"
              >
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              {/* Wallet Address */}
              {authUser?.walletAddress && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/20 rounded-full">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-mono text-gray-300">
                    {authUser.walletAddress.slice(0, 6)}...{authUser.walletAddress.slice(-4)}
                  </span>
                </div>
              )}

              {/* User Avatar Button */}
              <Button
                onClick={() => setSidebarOpen(true)}
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-full h-10 w-10 p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-500/20 text-purple-300 font-semibold text-sm">
                    {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
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
            className="lg:hidden border-t border-white/10 glass-card"
          >
            <nav className="container py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.active ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Sign In */}
              {isGuest ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    className="w-full mt-4 gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold neon-glow"
                  >
                    Sign In
                  </Button>
                </Link>
              ) : (
                <div className="mt-4 space-y-3">
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-500/20 text-purple-300 font-semibold">
                        {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{authUser?.name}</p>
                      <p className="text-sm text-gray-400">{authUser?.email}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setSidebarOpen(true)
                    }}
                    className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold"
                  >
                    Open Account Menu
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      </header>

      {/* User Sidebar - Outside header for proper z-index */}
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
