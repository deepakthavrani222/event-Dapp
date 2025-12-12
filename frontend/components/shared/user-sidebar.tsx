"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Ticket, Settings, LogOut, Wallet, History, Heart, Star, HelpCircle, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/context/AuthContext"
import { useRole } from "@/hooks/use-role"
import Link from "next/link"

interface UserSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const { user, logout } = useAuth()
  const { role } = useRole()

  const handleLogout = () => {
    logout()
    onClose()
  }

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      href: "/profile",
      description: "Manage your account"
    },
    {
      icon: Ticket,
      label: "My Tickets",
      href: "/buyer/tickets",
      description: "View your tickets"
    },
    {
      icon: History,
      label: "Purchase History",
      href: "/buyer/history",
      description: "Past transactions"
    },
    {
      icon: Heart,
      label: "Favorites",
      href: "/buyer/favorites",
      description: "Saved events"
    },
    {
      icon: Wallet,
      label: "Wallet",
      href: "/wallet",
      description: "Manage your Web3 wallet"
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      description: "Account preferences"
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      href: "/support",
      description: "Get assistance"
    }
  ]

  // Role-specific menu items
  const roleMenuItems = {
    organizer: [
      { icon: Star, label: "Organizer Dashboard", href: "/organizer", description: "Manage your events" }
    ],
    promoter: [
      { icon: Star, label: "Promoter Dashboard", href: "/promoter", description: "Track your promotions" }
    ],
    admin: [
      { icon: Star, label: "Admin Dashboard", href: "/admin", description: "Platform management" }
    ],
    artist: [
      { icon: Crown, label: "Artist Tools", href: "/artist-tools", description: "Golden tickets & fan engagement" }
    ]
  }

  const currentRoleItems = roleMenuItems[role as keyof typeof roleMenuItems] || []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gray-900/95 backdrop-blur-xl border-l border-white/20 z-[101] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header - Fixed */}
            <div className="p-6 border-b border-white/20 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Account</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                  <AvatarFallback className="bg-purple-500/20 text-purple-300 font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                  <Badge className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Wallet Info */}
              {user?.walletAddress && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Web3 Wallet</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  </p>
                </div>
              )}
            </div>

            {/* Menu Items - Scrollable */}
            <div 
              className="p-6 space-y-2 flex-1 overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {/* Role-specific items first */}
              {currentRoleItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                      <item.icon className="h-4 w-4 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white group-hover:text-purple-300 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}

              {currentRoleItems.length > 0 && <Separator className="bg-white/20 my-4" />}

              {/* Regular menu items */}
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <item.icon className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white group-hover:text-gray-300 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 border-t border-white/20 flex-shrink-0">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}