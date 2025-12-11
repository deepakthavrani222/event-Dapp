import type React from "react"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { SupportChat } from "@/components/shared/support-chat"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <DashboardHeader role="admin" />
      <main className="flex-1">{children}</main>
      <SupportChat />
    </div>
  )
}
