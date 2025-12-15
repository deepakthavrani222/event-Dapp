"use client"

import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Ticket, 
  MessageSquare, 
  LogOut, 
  ChevronRight,
  HelpCircle,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/context/AuthContext"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const isDark = theme === 'dark'

  const handleLogout = () => {
    logout()
    onClose()
    router.push('/')
  }

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
            className={`fixed right-0 top-0 h-full w-[340px] max-w-[90vw] z-[101] shadow-2xl flex flex-col overflow-hidden ${
              isDark 
                ? 'bg-gray-900 border-l border-white/10' 
                : 'bg-[#F5F5F5] border-l border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={isDark ? 'text-gray-400 hover:text-white hover:bg-transparent' : 'text-gray-600 hover:text-gray-900 hover:bg-transparent'}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* User Profile Section */}
              <div className={`p-6 ${isDark ? '' : 'bg-[#F5F5F5]'}`}>
                <div className="flex items-center gap-4">
                  <Avatar className={`h-16 w-16 ${isDark ? 'border-2 border-purple-500/30' : 'border-2 border-purple-200'}`}>
                    <AvatarFallback className={`text-2xl font-semibold ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'User'}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.phone || user?.email || 'No contact info'}
                    </p>
                  </div>
                </div>
              </div>

              {/* View All Bookings */}
              <div className="px-4 py-2">
                <Link href="/my-tickets" onClick={onClose}>
                  <div className={`flex items-center justify-between p-4 rounded-xl ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Ticket className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>View all bookings</span>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </Link>
              </div>

              {/* Support Section */}
              <div className="px-4 pt-6 pb-2">
                <h3 className={`text-sm font-semibold mb-3 px-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Support</h3>
                <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Link href="/support" onClick={onClose}>
                    <div className={`flex items-center justify-between p-4 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}>
                      <div className="flex items-center gap-3">
                        <MessageSquare className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Chat with us</span>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </Link>
                </div>
              </div>

              {/* More Section */}
              <div className="px-4 pt-6 pb-2">
                <h3 className={`text-sm font-semibold mb-3 px-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>More</h3>
                <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Link href="/terms" onClick={onClose}>
                    <div className={`flex items-center justify-between p-4 border-b ${
                      isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                    } transition-colors`}>
                      <div className="flex items-center gap-3">
                        <HelpCircle className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Terms & Conditions</span>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </Link>
                  
                  <Link href="/privacy" onClick={onClose}>
                    <div className={`flex items-center justify-between p-4 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}>
                      <div className="flex items-center gap-3">
                        <FileText className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</span>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Logout */}
              <div className="px-4 py-6">
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-3 p-4 w-full transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
