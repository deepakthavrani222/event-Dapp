import type React from "react"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { SupportChat } from "@/components/shared/support-chat"
import { Footer } from "@/components/shared/footer"
import { DarkThemeWrapper } from "@/components/shared/dark-theme-wrapper"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DarkThemeWrapper>
      <DashboardHeader role="admin" />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportChat />
    </DarkThemeWrapper>
  )
}
