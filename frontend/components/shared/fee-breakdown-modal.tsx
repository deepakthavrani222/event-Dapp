"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Shield, Zap } from "lucide-react"

interface FeeBreakdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketPrice: number
  quantity: number
}

export function FeeBreakdownModal({ open, onOpenChange, ticketPrice, quantity }: FeeBreakdownModalProps) {
  const subtotal = ticketPrice * quantity
  const platformFee = subtotal * 0.05
  const gst = (subtotal + platformFee) * 0.18
  const total = subtotal + platformFee + gst

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Price Breakdown
          </DialogTitle>
          <DialogDescription>Transparent pricing with no hidden charges</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between text-sm">
            <span>Ticket Price × {quantity}</span>
            <span className="font-mono">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Platform Fee (5%)</span>
            <span className="font-mono">₹{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>GST (18%)</span>
            <span className="font-mono">₹{gst.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="font-mono text-primary">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs">
            <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground leading-relaxed">
              Your ticket is secured on the blockchain. All transactions are encrypted and tamper-proof.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
