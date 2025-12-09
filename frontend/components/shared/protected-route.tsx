"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRole, type UserRole } from "@/hooks/use-role"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, loading } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role === "guest") {
      router.push("/")
    }
  }, [role, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (role === "guest") {
    return null
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card/50 border-border/50 backdrop-blur">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground leading-relaxed">
              You don't have permission to access this page. Please contact support if you believe this is an error.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="gap-2 bg-gradient-purple-teal hover:opacity-90 border-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
