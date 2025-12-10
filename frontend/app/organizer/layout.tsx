import type React from "react"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { SupportChat } from "@/components/shared/support-chat"

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader role="organizer" />
      <main className="flex-1">{children}</main>
      <SupportChat />
    </div>
  )
}
