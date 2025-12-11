"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Wallet, Smartphone, Check, ArrowRight, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiClient } from '@/lib/api/client'
import { notifyTicketPurchased } from '@/lib/hooks/useRealTimeTickets'

interface EnhancedPurchaseDialogProps {
  selections: any
  eventTitle: string
  onClose: () => void
  onSuccess: () => void
}

export function EnhancedPurchaseDialog({ selections, eventTitle, onClose, onSuccess }: EnhancedPurchaseDialogProps) {
  const [step, setStep] = useState(1) // 1: Review, 2: Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, Rupay" },
    { id: "upi", name: "UPI Payment", icon: Smartphone, description: "PhonePe, GPay, Paytm" },
    { id: "wallet", name: "Crypto Wallet", icon: Wallet, description: "MetaMask, WalletConnect" },
  ]

  const handlePurchase = async () => {
    setProcessing(true)
    
    try {
      // Use real API call instead of mock
      // Handle multiple ticket selections by purchasing each one
      const purchasePromises = selections.selections.map((selection: any) => 
        apiClient.purchaseTickets({
          ticketTypeId: selection.ticketTypeId,
          quantity: selection.quantity,
          paymentMethod: paymentMethod.toUpperCase(),
          referralCode: undefined, // Could be added to form later
        })
      );

      const responses = await Promise.all(purchasePromises);
      const allSuccessful = responses.every(response => response.success);

      if (!allSuccessful) {
        const failedResponses = responses.filter(r => !r.success);
        throw new Error(failedResponses[0]?.error || 'Some purchases failed');
      }

      if (allSuccessful) {
        console.log('Purchase successful! Refreshing tickets...');
        
        // Trigger My Tickets refresh immediately
        notifyTicketPurchased();
        
        // Also trigger global refresh events
        window.dispatchEvent(new CustomEvent('refreshTickets'));
        
        // Set localStorage flag for cross-tab communication
        localStorage.setItem('ticketPurchased', Date.now().toString());
        
        // Refresh triggers sent
        
        setProcessing(false)
        setStep(3)
        
        // Auto close after success
        setTimeout(() => {
          onSuccess()
        }, 3000)
      }
    } catch (error: any) {
      console.error('🎫 Enhanced Purchase failed:', error);
      setProcessing(false);
      // Could add error state here
      alert(`Purchase failed: ${error.message}`);
    }
  }

  const fees = {
    platform: Math.round(selections.total * 0.02), // 2% platform fee
    payment: Math.round(selections.total * 0.015), // 1.5% payment gateway
    tax: Math.round(selections.total * 0.18), // 18% GST
  }

  const finalTotal = selections.total + fees.platform + fees.payment + fees.tax

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background border border-border/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {step === 1 && "Review Your Order"}
                  {step === 2 && "Payment Details"}
                  {step === 3 && "Purchase Successful!"}
                </h2>
                <p className="text-gray-400">{eventTitle}</p>
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

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-6">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-600 text-gray-400'
                  }`}>
                    {step > stepNum ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-12 h-1 rounded ${
                      step > stepNum ? 'bg-primary' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Step 1: Review Order */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Ticket Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Selected Tickets</h3>
                  {selections.selections.map((selection: any, index: number) => (
                    <Card key={selection.ticketTypeId} className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{selection.name}</h4>
                            <p className="text-sm text-gray-400">Quantity: {selection.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">₹{(selection.quantity * selection.price).toLocaleString()}</p>
                            <p className="text-sm text-gray-400">₹{selection.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="bg-card/50 border-border/50 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-card/50 border-border/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-white">Price Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tickets ({selections.totalTickets})</span>
                        <span className="text-white">₹{selections.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Platform Fee</span>
                        <span className="text-white">₹{fees.platform.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Payment Gateway</span>
                        <span className="text-white">₹{fees.payment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">GST (18%)</span>
                        <span className="text-white">₹{fees.tax.toLocaleString()}</span>
                      </div>
                      <Separator className="bg-white/20" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total Amount</span>
                        <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!email || !phone}
                  className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-12 rounded-xl"
                >
                  Proceed to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Payment Methods */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Choose Payment Method</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {paymentMethods.map((method) => (
                      <Card key={method.id} className={`cursor-pointer transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-primary/10 border-primary/50' 
                          : 'bg-card/50 border-border/50 hover:border-primary/30'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <method.icon className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="text-white font-medium cursor-pointer">
                                {method.name}
                              </Label>
                              <p className="text-sm text-gray-400">{method.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </div>

                {/* Security Features */}
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-400" />
                      <div>
                        <h4 className="font-semibold text-white">Secure Payment</h4>
                        <p className="text-sm text-gray-300">256-bit SSL encryption & PCI DSS compliant</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Amount */}
                <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">Total Amount</h3>
                        <p className="text-sm text-gray-300">{selections.totalTickets} tickets</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          ₹{finalTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-card/50 border-border/50 text-white hover:bg-card/70"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePurchase}
                    disabled={processing}
                    className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-12 rounded-xl"
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                  <p className="text-gray-400">Your tickets have been purchased successfully</p>
                </div>

                <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                  <CardContent className="p-4 text-left">
                    <h4 className="font-semibold text-white mb-2">What's Next?</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• NFT tickets will be minted to your wallet</li>
                      <li>• Confirmation email sent to {email}</li>
                      <li>• QR codes available in your dashboard</li>
                      <li>• Tickets can be resold on our marketplace</li>
                    </ul>
                  </CardContent>
                </Card>

                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                  Transaction ID: TXN{Date.now().toString().slice(-8)}
                </Badge>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}