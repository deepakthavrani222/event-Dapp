"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, MapPin, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectCity: (city: string) => void
  currentCity: string
}

// Popular cities with icons
const popularCities = [
  { name: "Ahmedabad", icon: "🏛️" },
  { name: "Bengaluru", icon: "🏙️" },
  { name: "Chandigarh", icon: "🌳" },
  { name: "Chennai", icon: "🛕" },
  { name: "Delhi NCR", icon: "🏰" },
  { name: "Goa", icon: "🏖️" },
  { name: "Hyderabad", icon: "🕌" },
  { name: "Kolkata", icon: "🌉" },
  { name: "Mumbai", icon: "🌆" },
  { name: "Pune", icon: "⛰️" },
]

// All Indian cities organized alphabetically
const allCities: Record<string, string[]> = {
  A: ["Abohar", "Abu Road", "Achampet", "Acharapakkam", "Addanki", "Adilabad", "Adipur", "Adoni", "Adoor", "Agar", "Agartala", "Agra", "Ahmedabad", "Ahmedgarh", "Ahmednagar", "Ajmer", "Akbarpur", "Akividu", "Akola", "Alakode", "Alangayam", "Alangudi", "Alappuzha", "Aligarh", "Allagadda", "Almora", "Alwar", "Amalapuram", "Amalner", "Amangal", "Ambajogai", "Ambala"],
  B: ["Baddi", "Bagalkot", "Bageshwar", "Bahadurgarh", "Bahraich", "Balasore", "Ballari", "Ballia", "Balotra", "Balrampur", "Banda", "Bangalore", "Bankura", "Banswara", "Bapatla", "Baramati", "Baramulla", "Baran", "Bardhaman", "Bareilly", "Bargarh", "Baripada", "Barmer", "Barnala", "Barpeta", "Barshi", "Basirhat", "Basti", "Batala", "Bathinda", "Beawar", "Begusarai", "Belgaum", "Bellary", "Berhampur", "Betul", "Bhadrak", "Bhagalpur", "Bhandara", "Bharatpur", "Bharuch", "Bhavnagar", "Bhilai", "Bhilwara", "Bhimavaram", "Bhind", "Bhiwadi", "Bhiwani", "Bhopal", "Bhubaneswar", "Bhuj", "Bidar", "Bihar Sharif", "Bijapur", "Bijnor", "Bikaner", "Bilaspur", "Bokaro", "Bongaigaon", "Brahmapur", "Budaun", "Bulandshahr", "Burhanpur"],
  C: ["Calicut", "Chamba", "Chamoli", "Champawat", "Chandauli", "Chandigarh", "Chandrapur", "Changanassery", "Chengalpattu", "Chennai", "Chhatarpur", "Chhindwara", "Chidambaram", "Chikkaballapur", "Chikmagalur", "Chinsurah", "Chirala", "Chitradurga", "Chittoor", "Chittorgarh", "Chopda", "Churachandpur", "Coimbatore", "Coonoor", "Cuddalore", "Cuddapah", "Cuttack"],
  D: ["Dabra", "Dahod", "Dalhousie", "Daman", "Damoh", "Darbhanga", "Darjeeling", "Datia", "Dausa", "Davangere", "Dehradun", "Delhi", "Deoghar", "Deoria", "Dewas", "Dhanbad", "Dharamshala", "Dharmapuri", "Dharwad", "Dhubri", "Dhule", "Dibrugarh", "Dimapur", "Dindigul", "Diu", "Durg", "Durgapur"],
  E: ["Eluru", "Ernakulam", "Erode", "Etah", "Etawah"],
  F: ["Faizabad", "Faridabad", "Faridkot", "Farrukhabad", "Fatehabad", "Fatehgarh Sahib", "Fatehpur", "Fazilka", "Firozabad", "Firozpur"],
  G: ["Gandhidham", "Gandhinagar", "Gangtok", "Gaya", "Ghaziabad", "Ghazipur", "Giridih", "Goa", "Godhra", "Gonda", "Gondia", "Gopalganj", "Gorakhpur", "Gudivada", "Gudur", "Gulbarga", "Guna", "Guntakal", "Guntur", "Gurdaspur", "Gurgaon", "Guwahati", "Gwalior"],
  H: ["Hajipur", "Haldwani", "Hamirpur", "Hanamkonda", "Hanumangarh", "Hapur", "Hardoi", "Haridwar", "Hassan", "Hathras", "Haveri", "Hazaribagh", "Hindupur", "Hinganghat", "Hingoli", "Hisar", "Hoshangabad", "Hoshiarpur", "Hospet", "Hosur", "Howrah", "Hubli", "Hyderabad"],
  I: ["Ichalkaranji", "Imphal", "Indore", "Itanagar", "Itarsi"],
  J: ["Jabalpur", "Jagdalpur", "Jagtial", "Jaipur", "Jaisalmer", "Jalandhar", "Jalgaon", "Jalna", "Jalore", "Jalpaiguri", "Jammu", "Jamnagar", "Jamshedpur", "Jamui", "Jaunpur", "Jehanabad", "Jetpur", "Jhansi", "Jharsuguda", "Jhunjhunu", "Jind", "Jodhpur", "Jorhat", "Junagadh"],
  K: ["Kadapa", "Kaithal", "Kakinada", "Kalimpong", "Kallakurichi", "Kalpetta", "Kamareddy", "Kanchipuram", "Kandukur", "Kangra", "Kannauj", "Kannur", "Kanpur", "Kanyakumari", "Kapurthala", "Karad", "Karaikal", "Karaikkudi", "Karimnagar", "Karnal", "Karur", "Karwar", "Kasaragod", "Kashipur", "Kathua", "Katihar", "Katni", "Kavali", "Khammam", "Khandwa", "Khanna", "Kharagpur", "Khargone", "Kishanganj", "Kochi", "Kodaikanal", "Kohima", "Kolar", "Kolhapur", "Kolkata", "Kollam", "Koppal", "Koraput", "Korba", "Kota", "Kothagudem", "Kottayam", "Kozhikode", "Krishnagiri", "Kullu", "Kumbakonam", "Kurnool", "Kurukshetra"],
  L: ["Lakhimpur", "Latur", "Leh", "Lucknow", "Ludhiana"],
  M: ["Machilipatnam", "Madanapalle", "Madikeri", "Madurai", "Mahabubnagar", "Maharajganj", "Mahasamund", "Mahbubnagar", "Mahesana", "Mainpuri", "Malappuram", "Malda", "Malegaon", "Malerkotla", "Manali", "Mandi", "Mandla", "Mandsaur", "Mandya", "Mangalore", "Mango", "Manipal", "Manjeri", "Mansa", "Margao", "Mathura", "Mau", "Mayiladuthurai", "Medak", "Meerut", "Mehsana", "Midnapore", "Mirzapur", "Moga", "Moradabad", "Morbi", "Morena", "Motihari", "Muktsar", "Mumbai", "Munger", "Murwara", "Mussoorie", "Muzaffarnagar", "Muzaffarpur", "Mysore"],
  N: ["Nabha", "Nadiad", "Nagaon", "Nagapattinam", "Nagar", "Nagaur", "Nagda", "Nagercoil", "Nagpur", "Naihati", "Nainital", "Nalanda", "Nalbari", "Nalgonda", "Namakkal", "Nanded", "Nandurbar", "Nandyal", "Narasaraopet", "Narayanpet", "Narnaul", "Narsinghpur", "Nashik", "Navi Mumbai", "Navsari", "Nawada", "Neemuch", "Nellore", "New Delhi", "Neyveli", "Nizamabad", "Noida"],
  O: ["Ongole", "Ooty", "Osmanabad"],
  P: ["Pachora", "Pakur", "Palakkad", "Palanpur", "Pali", "Palwal", "Panaji", "Panchkula", "Pandharpur", "Panipat", "Panna", "Panvel", "Parbhani", "Patan", "Pathankot", "Patiala", "Patna", "Pauri", "Peddapalli", "Perambalur", "Phagwara", "Phaltan", "Pithampur", "Pithoragarh", "Pollachi", "Pondicherry", "Ponnani", "Porbandar", "Port Blair", "Proddatur", "Pudukkottai", "Pune", "Puri", "Purnia", "Purulia"],
  R: ["Rae Bareli", "Raichur", "Raiganj", "Raigarh", "Raipur", "Raisen", "Rajahmundry", "Rajapalayam", "Rajgarh", "Rajkot", "Rajnandgaon", "Rajsamand", "Ramagundam", "Rameshwaram", "Ramgarh", "Rampur", "Ranchi", "Ranga Reddy", "Ranipet", "Ratnagiri", "Ratlam", "Raurkela", "Raver", "Rawatbhata", "Rewa", "Rewari", "Rishikesh", "Robertsganj", "Rohtak", "Roorkee", "Rourkela", "Rudrapur"],
  S: ["Sagar", "Saharanpur", "Saharsa", "Salem", "Samastipur", "Sambalpur", "Sambhal", "Sangli", "Sangola", "Sangrur", "Sasaram", "Satara", "Satna", "Sawai Madhopur", "Secunderabad", "Sehore", "Seoni", "Serampore", "Shahdol", "Shahjahanpur", "Shajapur", "Shamli", "Shillong", "Shimla", "Shimoga", "Shirdi", "Shivpuri", "Sikar", "Silchar", "Siliguri", "Silvassa", "Singrauli", "Sirsa", "Sitamarhi", "Sitapur", "Sivaganga", "Sivakasi", "Siwan", "Solan", "Solapur", "Sonipat", "Srikakulam", "Srinagar", "Sultanpur", "Surat", "Surendranagar", "Suryapet"],
  T: ["Tadepalligudem", "Tadipatri", "Tezpur", "Thane", "Thanjavur", "Theni", "Thiruvananthapuram", "Thoothukudi", "Thrissur", "Tikamgarh", "Tinsukia", "Tiruchirapalli", "Tirunelveli", "Tirupati", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvottiyur", "Tonk", "Tumkur", "Tura", "Udaipur", "Udgir"],
  U: ["Udaipur", "Udgir", "Udupi", "Ujjain", "Ulhasnagar", "Uluberia", "Umred", "Una", "Unnao"],
  V: ["Vadodara", "Valsad", "Vapi", "Varanasi", "Vasai", "Vellore", "Veraval", "Vidisha", "Vijayawada", "Vikarabad", "Villupuram", "Virudhunagar", "Visakhapatnam", "Vizianagaram", "Vrindavan"],
  W: ["Warangal", "Wardha", "Washim", "Wokha"],
  Y: ["Yadgir", "Yamunanagar", "Yanam", "Yavatmal"],
  Z: ["Zahirabad", "Zirakpur"]
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function LocationModal({ isOpen, onClose, onSelectCity, currentCity }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSelectCity = (city: string) => {
    onSelectCity(city)
    onClose()
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // For now, default to nearest major city
          handleSelectCity("Bengaluru")
        },
        () => {
          alert("Unable to get your location")
        }
      )
    }
  }


  // Filter cities based on search
  const getFilteredCities = () => {
    if (searchQuery) {
      const results: string[] = []
      Object.values(allCities).forEach(cities => {
        cities.forEach(city => {
          if (city.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push(city)
          }
        })
      })
      return results.slice(0, 20)
    }
    if (selectedLetter && allCities[selectedLetter]) {
      return allCities[selectedLetter]
    }
    return []
  }

  const filteredCities = getFilteredCities()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-start justify-center pt-16 z-[101] px-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl pointer-events-auto bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Select Location</h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search city, area or locality"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSelectedLetter(null)
                    }}
                    className="w-full pl-12 pr-4 py-3 h-12 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Use Current Location */}
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Navigation className="h-4 w-4" />
                  Use Current Location
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
                {/* Search Results */}
                {searchQuery ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Search Results</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleSelectCity(city)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentCity === city 
                              ? 'bg-purple-100 text-purple-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                    {filteredCities.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No cities found</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Popular Cities */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 mb-4">Popular Cities</h3>
                      <div className="grid grid-cols-5 gap-3">
                        {popularCities.map((city) => (
                          <button
                            key={city.name}
                            onClick={() => handleSelectCity(city.name)}
                            className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                              currentCity === city.name
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            <span className="text-2xl mb-1">{city.icon}</span>
                            <span className={`text-xs font-medium text-center ${
                              currentCity === city.name ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {city.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* All Cities - Alphabet Filter (Single Row) */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">All Cities</h3>
                      <div className="flex gap-0.5">
                        {alphabet.map((letter) => (
                          <button
                            key={letter}
                            onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                            disabled={!allCities[letter]}
                            className={`w-6 h-7 rounded text-xs font-medium transition-colors ${
                              selectedLetter === letter
                                ? 'bg-purple-600 text-white'
                                : allCities[letter]
                                  ? 'text-purple-600 hover:bg-purple-100'
                                  : 'text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cities for Selected Letter */}
                    {selectedLetter && allCities[selectedLetter] && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-4 gap-2">
                          {allCities[selectedLetter].map((city) => (
                            <button
                              key={city}
                              onClick={() => handleSelectCity(city)}
                              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                currentCity === city 
                                  ? 'bg-purple-100 text-purple-700 font-medium' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
