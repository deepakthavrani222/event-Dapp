import type React from "react"
import { PublicHeader } from "@/components/shared/public-header"
import { SupportChat } from "@/components/shared/support-chat"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      {/* Spacer for fixed header (h-20 = 80px) */}
      <div className="h-20" />
      <main className="flex-1">{children}</main>
      <SupportChat />
    </div>
  )
}
