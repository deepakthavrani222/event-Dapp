import type React from "react"
import { DashboardHeader } from "@/components/shared/dashboard-header"

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader role="artist" />
      <main className="flex-1">{children}</main>
    </div>
  )
}
