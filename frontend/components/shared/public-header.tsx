"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { ThemeToggle } from "./theme-toggle"
import { useTheme } from "@/lib/context/ThemeContext"

const guestNavItems = [
  { label: "For you", href: "/" },
  { label: "Events", href: "/buyer" },
  { label: "Auctions", href: "/auction" },
]

const buyerNavItems = [
  { label: "For you", href: "/" },
  { label: "Events", href: "/buyer" },
  { label: "Auctions", href: "/auction" },
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
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Use different nav items based on login status
  const navItems = isGuest ? guestNavItems : buyerNavItems
  
  // Check if nav item is active based on current path
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-[#0A0A0A]/90 border-[#333333]' 
          : 'bg-white/95 border-gray-200 shadow-sm'
      }`}>
      <div className="flex h-20 items-center px-4 lg:px-6">
        {/* Left Section: Logo + Divider + Location */}
        <div className="flex items-center gap-4">
          {/* Logo - District Style */}
          <Link href="/" className="flex flex-col items-start">
            <span className={`text-2xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ticket<span className={isDark ? 'text-purple-400' : 'text-[#E23744]'}>chain</span>
            </span>
            <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              by web3
            </span>
          </Link>

          {/* Vertical Divider */}
          <div className={`hidden md:block h-8 w-px ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />

          {/* Location */}
          <button 
            onClick={() => setLocationOpen(true)}
            className="hidden md:flex items-center gap-1.5 transition-opacity hover:opacity-70"
          >
            <MapPin className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-[#E23744]'}`} />
            <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCity}</span>
            <ChevronDown className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Center: Desktop Navigation - Hide on event detail pages */}
        {!pathname.startsWith('/event/') ? (
          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? isDark 
                      ? "bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30"
                      : "bg-[#E23744]/10 text-[#E23744] border border-[#E23744]/30"
                    : isDark
                      ? "text-[#B0B0B0] hover:text-[#FFFFFF] hover:bg-[#161616]"
                      : "text-gray-900 hover:text-black hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Search Field - District Style */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`hidden md:flex items-center gap-3 px-5 py-2.5 rounded-lg transition-all min-w-[340px] ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border border-white/20' 
                : 'bg-[#F5F5F5] hover:bg-[#EBEBEB] border border-gray-200'
            }`}
          >
            <Search className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-[#7C3AED]'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Search for events, auctions and more
            </span>
          </button>

          {isGuest ? (
            <div className="hidden md:flex items-center gap-3">
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
                className={`rounded-full h-11 w-11 p-0 border-0 ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
                }`}
              >
                <Avatar className="h-11 w-11">
                  <AvatarFallback className={`font-semibold text-base ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-[#1A1A1A] text-white'
                  }`}>
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
            className={`lg:hidden ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
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
            className={`lg:hidden border-t ${isDark ? 'border-white/10 glass-card' : 'border-gray-200 bg-white'}`}
          >
            <nav className="container py-4 space-y-2">
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-2 mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Theme</span>
                <ThemeToggle />
              </div>
              
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href) 
                      ? isDark ? "bg-[#A78BFA]/20 text-[#A78BFA]" : "bg-[#E23744]/10 text-[#E23744]"
                      : isDark ? "text-[#B0B0B0] hover:bg-[#161616] hover:text-[#FFFFFF]" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              {isGuest ? (
                <div className="space-y-3 mt-4">
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
