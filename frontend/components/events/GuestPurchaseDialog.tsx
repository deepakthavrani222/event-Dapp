"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Phone, User, ArrowRight, Shield, Zap, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/context/AuthContext"

interface GuestPurchaseDialogProps {
  selections: any
  eventTitle: string
  onClose: () => void
  onSuccess: () => void
}

export function GuestPurchaseDialog({ selections, eventTitle, onClose, onSuccess }: GuestPurchaseDialogProps) {
  const { login } = useAuth()
  const [step, setStep] = useState(1) // 1: Sign up options, 2: Quick signup, 3: Login
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleQuickSignup = async () => {
    if (!email || !name || !agreeTerms) return
    
    setLoading(true)
    try {
      await login(email, name)
      onSuccess()
    } catch (error) {
      console.error('Quick signup failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      await login(email)
      onSuccess()
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background border border-border/50 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {step === 1 && "Ready to Buy?"}
                  {step === 2 && "Quick Sign Up"}
                  {step === 3 && "Welcome Back"}
                </h2>
                <p className="text-gray-400 text-sm">{eventTitle}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Step 1: Sign up options */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Order Summary */}
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-3">Your Order</h3>
                    <div className="space-y-2 text-sm">
                      {selections.selections.map((selection: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-300">
                            {selection.quantity}x {selection.name}
                          </span>
                          <span className="text-white font-semibold">
                            ₹{(selection.quantity * selection.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <Separator className="bg-white/20" />
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-primary">₹{selections.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sign up options */}
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-white">Almost there!</h3>
                    <p className="text-gray-400 text-sm">
                      Just need a quick sign-up to secure your tickets. Takes 30 seconds.
                    </p>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-12 rounded-xl"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Continue with Email
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full bg-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-gray-400">or</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="w-full bg-card/50 border-border/50 text-white hover:bg-card/70 h-12 rounded-xl"
                  >
                    Already have an account? Sign In
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>Secure checkout with 256-bit encryption</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>Instant ticket delivery to your email</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-1">
                      No Wallet Required
                    </Badge>
                    <span className="text-xs">We handle the blockchain for you</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Quick signup */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-white">Create Your Account</h3>
                  <p className="text-gray-400 text-sm">
                    We'll create a secure wallet for you automatically
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-10 bg-card/50 border-border/50 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="pl-10 bg-card/50 border-border/50 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="pl-10 bg-card/50 border-border/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={setAgreeTerms}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the{" "}
                      <span className="text-primary hover:underline cursor-pointer">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="text-primary hover:underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleQuickSignup}
                    disabled={!email || !name || !agreeTerms || loading}
                    className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-12 rounded-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Creating Account...
                      </div>
                    ) : (
                      <>
                        Create Account & Buy Tickets
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Back
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Login */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-white">Welcome Back</h3>
                  <p className="text-gray-400 text-sm">
                    Sign in to continue with your purchase
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-white">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="pl-10 bg-card/50 border-border/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleLogin}
                    disabled={!email || loading}
                    className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-12 rounded-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Signing In...
                      </div>
                    ) : (
                      <>
                        Sign In & Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Back
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setStep(2)}
                    className="text-primary hover:text-primary/80"
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}