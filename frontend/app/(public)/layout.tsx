import type React from "react"
import { PublicHeader } from "@/components/shared/public-header"
import { Footer } from "@/components/shared/footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
