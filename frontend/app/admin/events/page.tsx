"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import type { Event } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Calendar, MapPin, User } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [filter])

  async function fetchEvents() {
    setLoading(true)
    try {
      const response = await apiClient.getAdminEvents(filter)
      setEvents(response.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(eventId: string) {
    setProcessing(true)
    try {
      await apiClient.approveEvent(eventId, 'approve')
      await fetchEvents()
    } catch (error) {
      console.error('Failed to approve event:', error)
      alert('Failed to approve event')
    } finally {
      setProcessing(false)
    }
  }

  async function handleReject() {
    if (!selectedEvent || !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    try {
      await apiClient.approveEvent(selectedEvent.id, 'reject', rejectionReason)
      setShowRejectDialog(false)
      setRejectionReason('')
      setSelectedEvent(null)
      await fetchEvents()
    } catch (error) {
      console.error('Failed to reject event:', error)
      alert('Failed to reject event')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Event Management</h1>
        <p className="text-muted-foreground">Review and approve events created by organizers</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No {filter} events found
            </div>
          ) : (
            events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full md:w-48 h-48 rounded-lg object-cover"
                      />

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-2xl mb-2">{event.title}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                        </div>

                        <p className="text-muted-foreground line-clamp-2">{event.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.city}</span>
                          </div>
                          {event.organizer && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{event.organizer.name}</span>
                            </div>
                          )}
                        </div>

                        {event.rejectionReason && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-300">
                              <strong>Rejection Reason:</strong> {event.rejectionReason}
                            </p>
                          </div>
                        )}

                        {filter === 'pending' && (
                          <div className="flex gap-3 pt-2">
                            <Button
                              onClick={() => handleApprove(event.id)}
                              disabled={processing}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Event
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedEvent(event)
                                setShowRejectDialog(true)
                              }}
                              disabled={processing}
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Event
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this event. This will be visible to the organizer.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason('')
                setSelectedEvent(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              Reject Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
