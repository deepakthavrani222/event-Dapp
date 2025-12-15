"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Wallet, Check, ArrowRight, Shield, Zap, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiClient } from '@/lib/api/client'
import { notifyTicketPurchased } from '@/lib/hooks/useRealTimeTickets'
import { CryptoPayment } from '@/components/web3/CryptoPayment'
import { useTheme } from "next-themes"

interface EnhancedPurchaseDialogProps {
  selections: any
  eventTitle: string
  onClose: () => void
  onSuccess: () => void
}

const paymentMethods = [
  { id: 'crypto', name: 'MetaMask Wallet', description: 'Pay with ETH - Secure blockchain payment', icon: Wallet },
  { id: 'upi', name: 'UPI Payment', description: 'PhonePe, GPay, Paytm, BHIM', icon: CreditCard },
]

export function EnhancedPurchaseDialog({ selections, eventTitle, onClose, onSuccess }: EnhancedPurchaseDialogProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState(1) // 1: Review, 2: Payment Method, 3: Success, 4: Crypto Payment
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('crypto')
  const [email, setEmail] = useState('')



  // Handle successful crypto payment from MetaMask
  const handleCryptoSuccess = async (txHash: string) => {
    setProcessing(true)
    
    try {
      // Complete purchase with crypto transaction hash
      const purchasePromises = selections.selections.map((selection: any) => 
        apiClient.purchaseTickets({
          ticketTypeId: selection.ticketTypeId,
          quantity: selection.quantity,
          paymentMethod: 'CRYPTO',
          referralCode: undefined,
          transactionHash: txHash,
        })
      );

      const responses = await Promise.all(purchasePromises);
      const allSuccessful = responses.every(response => response.success);

      if (!allSuccessful) {
        const failedResponses = responses.filter(r => !r.success);
        throw new Error(failedResponses[0]?.error || 'Some purchases failed');
      }

      console.log('Crypto purchase successful! Refreshing tickets...');
      
      // Trigger My Tickets refresh immediately
      notifyTicketPurchased();
      window.dispatchEvent(new CustomEvent('refreshTickets'));
      localStorage.setItem('ticketPurchased', Date.now().toString());
      
      setProcessing(false)
      setStep(3)
      
      // Auto close after success
      setTimeout(() => {
        onSuccess()
      }, 3000)
    } catch (error: any) {
      console.error('🎫 Crypto Purchase failed:', error);
      setProcessing(false);
      setStep(1); // Go back to review
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-2xl'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {step === 1 && "Review Your Order"}
                  {step === 2 && "Choose Payment Method"}
                  {step === 3 && "Purchase Successful!"}
                  {step === 4 && "Pay with MetaMask"}
                </h2>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{eventTitle}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { num: 1, label: 'Review' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Complete' }
              ].map(({ num, label }, index) => {
                // Step 4 (MetaMask) is part of step 2 flow
                const currentStep = step === 4 ? 2 : step;
                const isComplete = currentStep >= num || step === 3;
                const showCheck = currentStep > num || step === 3;
                
                return (
                  <div key={num} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isComplete 
                          ? 'bg-purple-600 text-white'
                          : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {showCheck ? <Check className="h-4 w-4" /> : num === 2 ? <Wallet className="h-4 w-4" /> : num}
                      </div>
                    </div>
                    {index < 2 && (
                      <div className={`w-8 h-1 rounded ${
                        currentStep > num || step === 3 ? 'bg-purple-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
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
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Selected Tickets</h3>
                  {selections.selections.map((selection: any, index: number) => (
                    <Card key={selection.ticketTypeId} className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selection.name}</h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Quantity: {selection.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{(selection.quantity * selection.price).toLocaleString()}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>₹{selection.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Price Breakdown */}
                <Card className={isDark ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/20' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'}>
                  <CardContent className="p-4 space-y-3">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Price Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Tickets ({selections.totalTickets})</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>₹{selections.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Platform Fee</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>₹{fees.platform.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Payment Gateway</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>₹{fees.payment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>GST (18%)</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>₹{fees.tax.toLocaleString()}</span>
                      </div>
                      <Separator className={isDark ? 'bg-white/20' : 'bg-gray-300'} />
                      <div className="flex justify-between text-lg font-bold">
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>Total Amount</span>
                        <span className="text-purple-600">₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : 'text-gray-900'}>Email for confirmation</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-purple-600 hover:bg-purple-700 border-0 text-white font-semibold h-12 rounded-xl"
                >
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Payment Method Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Payment Methods */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Choose Payment Method</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {paymentMethods.map((method) => (
                      <Card key={method.id} className={`cursor-pointer transition-all ${
                        paymentMethod === method.id 
                          ? isDark ? 'bg-purple-900/30 border-purple-500/50' : 'bg-purple-50 border-purple-400'
                          : isDark ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500/30' : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <method.icon className="h-5 w-5 text-purple-600" />
                            <div className="flex-1">
                              <Label htmlFor={method.id} className={`font-medium cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {method.name}
                              </Label>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{method.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </div>

                {/* Security Features */}
                <Card className={isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Secure Payment</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {paymentMethod === 'crypto' ? 'Secured by Ethereum blockchain' : '256-bit SSL encryption & PCI DSS compliant'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Amount */}
                <Card className={isDark ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Amount</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{selections.totalTickets} tickets</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600">
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
                    className={`flex-1 ${isDark ? 'bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'}`}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (paymentMethod === 'crypto') {
                        setStep(4) // Go to MetaMask payment
                      } else {
                        // Handle other payment methods (UPI, etc.)
                        setProcessing(true)
                        setTimeout(() => {
                          setProcessing(false)
                          setStep(3)
                        }, 2000)
                      }
                    }}
                    disabled={processing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 border-0 text-white font-semibold h-12 rounded-xl"
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Processing...
                      </div>
                    ) : paymentMethod === 'crypto' ? (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Pay with MetaMask
                      </>
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
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Successful!</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Your tickets have been purchased successfully</p>
                </div>

                <Card className={isDark ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}>
                  <CardContent className="p-4 text-left">
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>What's Next?</h4>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <li>• NFT tickets will be minted to your wallet</li>
                      <li>• Confirmation email sent to {email || 'your email'}</li>
                      <li>• QR codes available in your dashboard</li>
                      <li>• Tickets can be resold on our marketplace</li>
                    </ul>
                  </CardContent>
                </Card>

                <Badge className={`px-4 py-2 ${isDark ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                  Transaction ID: TXN{Date.now().toString().slice(-8)}
                </Badge>
              </motion.div>
            )}

            {/* Step 4: Crypto/MetaMask Payment */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <CryptoPayment
                  amountINR={finalTotal}
                  eventTitle={eventTitle}
                  ticketType={selections.selections.map((s: any) => s.name).join(', ')}
                  quantity={selections.totalTickets}
                  onSuccess={handleCryptoSuccess}
                  onCancel={() => setStep(2)}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}