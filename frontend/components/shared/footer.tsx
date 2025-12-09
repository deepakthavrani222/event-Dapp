"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Instagram, Twitter, Youtube, Send, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  organizers: [
    { label: "List Your Event", href: "/organizer" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Resources", href: "/resources" },
  ],
  categories: [
    { label: "Music Events", href: "/events?category=music" },
    { label: "Sports Events", href: "/events?category=sports" },
    { label: "Comedy Shows", href: "/events?category=comedy" },
    { label: "Food & Drinks", href: "/events?category=food" },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0a0a12] mt-20">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-transparent pointer-events-none" />

      <div className="container relative">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-white/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-black text-white mb-2">
                Never Miss <span className="text-gradient-neon">An Event</span>
              </h3>
              <p className="text-gray-400">Subscribe to get exclusive early access and special offers</p>
            </div>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-500 h-12 rounded-full"
              />
              <Button className="gradient-purple-cyan h-12 px-6 rounded-full neon-glow font-bold gap-2 border-0">
                <Send className="w-4 h-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-3xl font-black">
                <span className="text-white">TIKR</span>
                <span className="text-gradient-neon">.WEB3</span>
              </h2>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              India's first Web3 ticketing platform. Secure, transparent, and scalper-free events for everyone.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-full glass-card border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">For Organizers</h4>
            <ul className="space-y-2.5">
              {footerLinks.organizers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="py-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl glass-card border-white/20 flex items-center justify-center mb-2">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-medium">Scan to download</p>
              </div>
              <div>
                <p className="text-white font-bold mb-1">Download the App</p>
                <p className="text-sm text-gray-400">Available on iOS & Android</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>support@tikr.web3</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2025 TIKR.WEB3. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/security" className="text-gray-500 hover:text-white transition-colors">
              Security
            </Link>
            <Link href="/accessibility" className="text-gray-500 hover:text-white transition-colors">
              Accessibility
            </Link>
            <Link href="/cookies" className="text-gray-500 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Ambient glow effect */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
    </footer>
  )
}
