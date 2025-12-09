"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleSwitcher } from "./role-switcher"
import { useRole } from "@/hooks/use-role"
import { Menu, X, MapPin, Search, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { label: "For you", href: "/" },
  { label: "Dining", href: "/dining" },
  { label: "Events", href: "/events", active: true },
  { label: "Movies", href: "/movies" },
  { label: "Activities", href: "/activities" },
  { label: "Stores", href: "/stores" },
]

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isGuest } = useRole()

  return (
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

          <RoleSwitcher />

          {isGuest ? (
            <Button
              size="sm"
              className="hidden md:flex gradient-purple-cyan hover:opacity-90 border-0 text-white rounded-full h-10 px-6 font-semibold neon-glow"
            >
              Sign In
            </Button>
          ) : (
            <Button
              size="icon"
              className="hidden md:flex bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-full h-10 w-10"
            >
              <User className="h-5 w-5" />
            </Button>
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
