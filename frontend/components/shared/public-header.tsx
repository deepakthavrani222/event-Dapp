"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRole } from "@/hooks/use-role"
import { useAuth } from "@/lib/context/AuthContext"
import { useArtistVerification } from "@/hooks/useArtistVerification"
import { UserSidebar } from "./user-sidebar"
import { SearchModal } from "./search-modal"
import { LocationModal } from "./location-modal"

import { Menu, X, MapPin, Search, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const guestNavItems = [
  { label: "For you", href: "/" },
  { label: "Events", href: "/events", active: true },
  { label: "Artists", href: "/artists" },
]

const buyerNavItems = [
  { label: "For you", href: "/" },
  { label: "Events", href: "/buyer" },
  { label: "Artists", href: "/artists" },
  { label: "My Tickets", href: "/my-tickets" },
]

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState("Bengaluru")
  const { user, isGuest } = useRole()
  const { user: authUser } = useAuth()
  const { openVerificationFlow } = useArtistVerification()
  
  // Use different nav items based on login status
  const navItems = isGuest ? guestNavItems : buyerNavItems

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center">
        {/* Left Section: Logo + Divider + Location */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-black text-gradient-neon">TicketChain</div>
          </Link>

          {/* Vertical Divider */}
          <div className="hidden md:block h-8 w-px bg-white/20" />

          {/* Location */}
          <button 
            onClick={() => setLocationOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors border border-white/20"
          >
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span className="font-medium text-white text-sm">{selectedCity}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
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

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto lg:ml-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Search className="h-5 w-5" />
          </Button>

          {isGuest ? (
            <div className="hidden md:flex items-center gap-3">
              <Button
                size="sm"
                onClick={openVerificationFlow}
                className="gradient-yellow-orange hover:opacity-90 border-0 text-black rounded-full h-10 px-6 font-bold"
              >
                ⭐ Verify as Artist
              </Button>
              <Link href="/login">
                <Button
                  size="sm"
                  className="gradient-purple-cyan hover:opacity-90 border-0 text-white rounded-full h-10 px-6 font-semibold neon-glow"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
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

              {/* Mobile Auth Buttons */}
              {isGuest ? (
                <div className="space-y-3 mt-4">
                  <Button
                    className="w-full gradient-yellow-orange hover:opacity-90 border-0 text-black h-12 font-bold"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openVerificationFlow();
                    }}
                  >
                    ⭐ Verify as Artist
                  </Button>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold neon-glow"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
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

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Location Modal */}
      <LocationModal 
        isOpen={locationOpen} 
        onClose={() => setLocationOpen(false)} 
        onSelectCity={setSelectedCity}
        currentCity={selectedCity}
      />
    </>
  )
}
