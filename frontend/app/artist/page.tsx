"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Heart, MessageSquare, Sparkles, Crown, Send } from "lucide-react"
import { motion } from "framer-motion"

export default function ArtistPage() {
  const stats = [
    { label: "Total Fans", value: "12.5K", icon: Users, color: "text-primary" },
    { label: "Engagement Rate", value: "8.4%", icon: Heart, color: "text-secondary" },
    { label: "Golden Pass Holders", value: "342", icon: Crown, color: "text-neon-pink" },
    { label: "Messages Sent", value: "48", icon: MessageSquare, color: "text-neon-teal" },
  ]

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-2"
          >
            Artist Profile
          </motion.h1>
          <p className="text-muted-foreground">Connect with your fans and manage exclusive content</p>
        </div>
        <Button className="gap-2 bg-gradient-purple-teal hover:opacity-90 border-0">
          <Sparkles className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Card className="bg-card/50 border-border/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 bg-primary/10 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Golden Pass Drop */}
        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-neon-pink" />
              Golden Pass Drop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-neon-pink/20 to-primary/20 rounded-lg border border-neon-pink/30 text-center space-y-3">
              <Crown className="h-12 w-12 mx-auto text-neon-pink" />
              <h3 className="text-xl font-bold">Launch Exclusive Golden Pass</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Give your superfans lifetime access to all your events with special perks and behind-the-scenes content.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Pass Name</label>
                <Input placeholder="e.g., VIP Golden Circle" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Price (INR)</label>
                <Input type="number" placeholder="e.g., 50000" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Total Supply</label>
                <Input type="number" placeholder="e.g., 100" />
              </div>
            </div>

            <Button className="w-full bg-gradient-purple-pink hover:opacity-90 border-0 gap-2">
              <Sparkles className="h-4 w-4" />
              Launch Golden Pass
            </Button>
          </CardContent>
        </Card>

        {/* Message All Fans */}
        <Card className="bg-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" />
              Message All Fans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input placeholder="e.g., New Concert Announcement!" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea placeholder="Write a personal message to your fans..." rows={8} className="resize-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>This will be sent to 12,543 fans</span>
            </div>

            <Button className="w-full bg-gradient-purple-teal hover:opacity-90 border-0 gap-2">
              <Send className="h-4 w-4" />
              Send Message
            </Button>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your fans will receive this as a notification and email. Use this feature responsibly to maintain
                engagement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/50 border-border/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Fan Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { fan: "Rahul M.", action: "purchased Golden Pass", time: "2 min ago" },
              { fan: "Priya S.", action: "bought 2 tickets to Mumbai show", time: "15 min ago" },
              { fan: "Arjun K.", action: "sent a message", time: "1 hour ago" },
              { fan: "Sneha P.", action: "shared your event", time: "3 hours ago" },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-purple-teal flex items-center justify-center text-white font-semibold">
                    {activity.fan[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{activity.fan}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activity.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
