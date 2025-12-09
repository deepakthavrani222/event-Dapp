"use client"

import { useState, Suspense } from "react"
import type { Ticket } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, MeshDistortMaterial } from "@react-three/drei"
import { MapPin, Calendar, Clock, Share2, Gift, Download, Sparkles, ExternalLink } from "lucide-react"
import QRCode from "react-qr-code"
import { motion } from "framer-motion"

interface Ticket3DCardProps {
  ticket: Ticket
}

function TicketMesh() {
  return (
    <mesh rotation={[0, 0.5, 0]}>
      <boxGeometry args={[3, 2, 0.1]} />
      <MeshDistortMaterial
        color="#7c3aed"
        metalness={0.9}
        roughness={0.1}
        emissive="#14b8a6"
        emissiveIntensity={0.5}
        distort={0.3}
        speed={2}
      />
    </mesh>
  )
}

export function Ticket3DCard({ ticket }: Ticket3DCardProps) {
  const [showQR, setShowQR] = useState(false)
  const isPastEvent = new Date(ticket.eventDate) < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-darker-surface/50 border border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
        <div className="relative h-72 bg-gradient-to-br from-primary/30 via-darker-surface to-secondary/30 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
            }
          >
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} castShadow color="#7c3aed" />
              <spotLight position={[-10, -10, 10]} angle={0.2} penumbra={1} intensity={1} color="#14b8a6" />
              <pointLight position={[0, 0, 5]} intensity={0.8} color="#ec4899" />
              <TicketMesh />
              <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={1.5}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.5}
              />
            </Canvas>
          </Suspense>

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/40 backdrop-blur-md border border-primary/30 text-white gap-1.5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              NFT Ticket
            </Badge>
            {!isPastEvent && (
              <Badge className="bg-green-500/40 backdrop-blur-md border border-green-400/30 text-white px-3 py-1.5">
                Active
              </Badge>
            )}
          </div>

          {isPastEvent && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Event Completed
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <h3 className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent line-clamp-1">
              {ticket.eventTitle}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-mono">#{ticket.nftTokenId}</p>
              <Badge className="bg-primary/10 text-primary border-primary/20">₹{ticket.price.toLocaleString()}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Date</span>
              </div>
              <p className="font-bold text-sm">
                {new Date(ticket.eventDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground">{new Date(ticket.eventDate).getFullYear()}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Time</span>
              </div>
              <p className="font-bold text-sm">{ticket.eventTime}</p>
              <p className="text-xs text-muted-foreground">Doors open 30min early</p>
            </div>

            <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Venue & Seat</span>
              </div>
              <p className="font-bold text-sm line-clamp-1 mb-1">{ticket.venue}</p>
              <p className="text-xs text-muted-foreground">
                {ticket.section} • Row {ticket.row} • Seat {ticket.seat}
              </p>
            </div>
          </div>

          {!isPastEvent && (
            <motion.div className="relative" initial={false} animate={{ height: showQR ? "auto" : 0 }}>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white rounded-xl shadow-lg"
                >
                  <div className="flex justify-center mb-3">
                    <QRCode value={ticket.qrCode} size={160} />
                  </div>
                  <p className="text-center text-xs text-gray-600">Show this QR code at the venue entrance</p>
                </motion.div>
              )}
            </motion.div>
          )}

          <div className="space-y-3">
            {!isPastEvent && (
              <>
                <Button
                  onClick={() => setShowQR(!showQR)}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 border-0 shadow-lg h-12 text-base font-semibold"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  {showQR ? "Hide QR Code" : "Show QR Code"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Share2 className="h-4 w-4" />
                    Resell
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:border-secondary/50 hover:bg-secondary/5"
                  >
                    <Gift className="h-4 w-4" />
                    Gift
                  </Button>
                </div>
              </>
            )}

            <Button
              variant="outline"
              className={`w-full gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:border-muted-foreground/50 ${isPastEvent ? "" : ""}`}
            >
              <Download className="h-4 w-4" />
              Download Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
