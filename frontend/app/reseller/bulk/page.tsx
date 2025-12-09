"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import type { Event } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, TrendingUp, Calculator, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function ResellerBulkPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await apiClient.getEvents()
        setEvents(response.events || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const bulkEvents = events.filter((e) => (e.totalAvailable || 0) > 50).slice(0, 6)

  const calculateProfit = (price: number, quantity: number) => {
    const bulkDiscount = quantity >= 50 ? 0.2 : quantity >= 20 ? 0.15 : 0.1
    const costPrice = price * (1 - bulkDiscount)
    const sellingPrice = price
    const profit = (sellingPrice - costPrice) * quantity
    return { costPrice, profit, margin: ((sellingPrice - costPrice) / sellingPrice) * 100 }
  }

  const totalInvestment = bulkEvents.reduce((sum, event) => {
    const qty = quantities[event.id] || 0
    const { costPrice } = calculateProfit(event.minPrice || 0, qty)
    return sum + costPrice * qty
  }, 0)

  const totalPotentialProfit = bulkEvents.reduce((sum, event) => {
    const qty = quantities[event.id] || 0
    const { profit } = calculateProfit(event.minPrice || 0, qty)
    return sum + profit
  }, 0)

  return (
    <div className="container py-8 space-y-8">
      <div>
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-2">
          Bulk Purchase
        </motion.h1>
        <p className="text-muted-foreground">Buy tickets in bulk with exclusive wholesale pricing</p>
      </div>

      {/* Profit Calculator Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
            <p className="text-3xl font-bold">₹{totalInvestment.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Potential Profit</p>
            <p className="text-3xl font-bold text-green-500">₹{totalPotentialProfit.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-neon-pink/10 rounded-lg text-neon-pink">
                <Calculator className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">ROI</p>
            <p className="text-3xl font-bold">
              {totalInvestment > 0 ? ((totalPotentialProfit / totalInvestment) * 100).toFixed(1) : "0"}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Buy Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available for Bulk Purchase</h2>
          <Badge className="bg-gradient-purple-teal border-0">Exclusive Access</Badge>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading events...</div>
        ) : bulkEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No bulk events available</div>
        ) : (
          bulkEvents.map((event, idx) => {
            const quantity = quantities[event.id] || 0
            const { costPrice, profit, margin } = calculateProfit(event.minPrice || 0, quantity)

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50 backdrop-blur overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full md:w-32 h-32 rounded-lg object-cover"
                    />

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          • {event.city}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">MRP</p>
                          <p className="font-semibold">₹{(event.minPrice || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Your Price</p>
                          <p className="font-semibold text-primary">₹{Math.round(costPrice).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Margin</p>
                          <p className="font-semibold text-green-500">{margin.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Available</p>
                          <p className="font-semibold">{(event.totalAvailable || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setQuantities({
                                ...quantities,
                                [event.id]: Math.max(0, quantity - 10),
                              })
                            }
                            className="bg-transparent"
                          >
                            -10
                          </Button>
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) =>
                              setQuantities({
                                ...quantities,
                                [event.id]: Math.max(0, Number.parseInt(e.target.value) || 0),
                              })
                            }
                            className="w-24 text-center font-mono"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setQuantities({
                                ...quantities,
                                [event.id]: quantity + 10,
                              })
                            }
                            className="bg-transparent"
                          >
                            +10
                          </Button>
                        </div>

                        {quantity > 0 && (
                          <div className="flex-1 text-right">
                            <p className="text-sm text-muted-foreground">Potential Profit</p>
                            <p className="text-xl font-bold text-green-500">₹{Math.round(profit).toLocaleString()}</p>
                          </div>
                        )}
                      </div>

                      {quantity >= 50 && (
                        <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            20% bulk discount applied! You're getting the best wholesale price.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })
        )}
      </div>

      {/* Checkout Summary */}
      {totalInvestment > 0 && (
        <Card className="sticky bottom-4 bg-card/95 border-border/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Order Value</p>
                <p className="text-3xl font-bold">₹{totalInvestment.toLocaleString()}</p>
                <p className="text-sm text-green-500 font-semibold mt-1">
                  Expected Profit: ₹{totalPotentialProfit.toLocaleString()}
                </p>
              </div>
              <Button size="lg" className="bg-gradient-purple-teal hover:opacity-90 border-0 gap-2 px-8">
                <ShoppingBag className="h-5 w-5" />
                Complete Purchase
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
