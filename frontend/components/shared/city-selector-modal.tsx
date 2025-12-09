"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Locate } from "lucide-react"

const cities = [
  { name: "Mumbai", icon: "🏛️" },
  { name: "Delhi NCR", icon: "🕌" },
  { name: "Bengaluru", icon: "🏢" },
  { name: "Hyderabad", icon: "🏰" },
  { name: "Chennai", icon: "🏛️" },
  { name: "Kolkata", icon: "🌉" },
  { name: "Pune", icon: "🏛️" },
  { name: "Ahmedabad", icon: "🕌" },
]

const allCities = [
  "Abohar",
  "Abu Road",
  "Achampet",
  "Acharapakkam",
  "Addanki",
  "Adilabad",
  "Adipur",
  "Adoni",
  "Adoor",
  "Agar",
  "Agartala",
  "Agra",
  "Ahmedabad",
  "Ahmednagar",
  "Ajmer",
  "Akbarpur",
  "Akividu",
  "Akola",
  "Alakode",
  "Alangayam",
  "Alangudi",
  "Alappuzha",
  "Aligarh",
  "Allagadda",
  "Almora",
  "Alwar",
  "Amalapuram",
  "Amaravati",
  "Ambala",
  "Ambikapur",
  "Amravati",
  "Amritsar",
]

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function CitySelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [search, setSearch] = useState("")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white text-gray-900">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Select Location</h2>

          <Input
            placeholder="Search city, area or locality"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
          />

          <button className="flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700">
            <Locate className="w-5 h-5" />
            Use Current Location
          </button>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Popular Cities</h3>
            <div className="grid grid-cols-4 gap-3">
              {cities.map((city) => (
                <button
                  key={city.name}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors"
                  onClick={onClose}
                >
                  <div className="text-4xl text-purple-600">{city.icon}</div>
                  <span className="text-sm font-medium text-gray-900">{city.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">All Cities</h3>
            <div className="flex gap-2 mb-4 flex-wrap">
              {alphabet.map((letter) => (
                <button key={letter} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  {letter}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-x-4 gap-y-2">
              {allCities.map((city) => (
                <button
                  key={city}
                  className="text-left text-sm text-gray-700 hover:text-purple-600 py-1"
                  onClick={onClose}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
