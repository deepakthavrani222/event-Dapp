'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft, Loader2, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

// Multi-step wizard steps
const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Event name, category & banner' },
  { id: 2, title: 'Event Details', description: 'Description, venue & timing' },
  { id: 3, title: 'Ticket Setup', description: 'Create ticket types' },
  { id: 4, title: 'Pricing', description: 'Set prices & quantities' },
  { id: 5, title: 'Review', description: 'Preview & publish' }
];

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Event details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  
  // Date & time
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Ticket types
  const [ticketTypes, setTicketTypes] = useState([
    {
      id: '1',
      name: 'General Admission',
      description: 'Standard event access',
      price: 1000,
      totalSupply: 100,
      maxPerWallet: 5,
      saleStartDate: '',
      saleEndDate: ''
    }
  ]);

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(title && category && image);
      case 2:
        return !!(description && venue && city && location && date && time);
      case 3:
        return ticketTypes.length > 0 && ticketTypes.every(t => t.name);
      case 4:
        return ticketTypes.every(t => t.price > 0 && t.totalSupply > 0);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else if (!validateStep(currentStep)) {
      setError('Please fill in all required fields before continuing');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!title || !description || !venue || !city || !location || !date || !time) {
        setError('Please fill in all required fields');
        return;
      }

      if (!image) {
        setError('Please upload an event image');
        return;
      }

      if (ticketTypes.length === 0) {
        setError('Please add at least one ticket type');
        return;
      }

      // Validate ticket types
      for (const ticket of ticketTypes) {
        if (!ticket.name || !ticket.price || !ticket.totalSupply) {
          setError('Please fill in all ticket type details');
          return;
        }
      }

      const eventData = {
        title,
        description,
        category,
        venue,
        city,
        location,
        image,
        imagePublicId,
        date,
        time,
        ticketTypes,
      };

      const response = await apiClient.createEvent(eventData);

      if (response.success) {
        router.push('/organizer');
      } else {
        setError(response.error || 'Failed to create event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
                  ${currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    w-full h-1 mx-3 rounded transition-all
                    ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{STEPS[currentStep - 1].title}</h1>
            <p className="text-gray-600 text-sm mt-1">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Rock Concert 2025"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Music">🎵 Music</SelectItem>
                        <SelectItem value="Sports">⚽ Sports</SelectItem>
                        <SelectItem value="Comedy">😄 Comedy</SelectItem>
                        <SelectItem value="Theater">🎭 Theater</SelectItem>
                        <SelectItem value="Festival">🎪 Festival</SelectItem>
                        <SelectItem value="Conference">💼 Conference</SelectItem>
                        <SelectItem value="Other">📋 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Compact Banner Upload */}
                <div className="space-y-2">
                  <Label>Event Banner *</Label>
                  {image ? (
                    <div className="relative">
                      <img 
                        src={image} 
                        alt="Event banner" 
                        className="w-full h-32 object-cover rounded-lg border-2 border-dashed border-gray-300"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImage('');
                          setImagePublicId('');
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <ImageUpload
                        value={image}
                        onChange={(url, publicId) => {
                          setImage(url);
                          setImagePublicId(publicId || '');
                        }}
                        onRemove={() => {
                          setImage('');
                          setImagePublicId('');
                        }}
                        type="event"
                        disabled={loading}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Recommended: 1920x1080px, max 10MB</p>
                </div>
              </div>
            )}

            {/* Step 2: Event Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Event Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your event... What can attendees expect?"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue Name *</Label>
                    <Input
                      id="venue"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Mumbai Arena"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Full Address *</Label>
                  <Textarea
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="123 Main Street, Andheri West, Mumbai, Maharashtra 400053"
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Event Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Ticket Types */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Ticket Types</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTicket = {
                        id: Date.now().toString(),
                        name: '',
                        description: '',
                        price: 0,
                        totalSupply: 0,
                        maxPerWallet: 5,
                        saleStartDate: '',
                        saleEndDate: ''
                      };
                      setTicketTypes([...ticketTypes, newTicket]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Type
                  </Button>
                </div>

                <div className="space-y-4">
                  {ticketTypes.map((ticket, index) => (
                    <div key={ticket.id} className="border rounded-lg p-4 space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Type {index + 1}</span>
                        {ticketTypes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTicketTypes(ticketTypes.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-sm">Ticket Name *</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => {
                              const updated = [...ticketTypes];
                              updated[index].name = e.target.value;
                              setTicketTypes(updated);
                            }}
                            placeholder="VIP, General, etc."
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-sm">Max per Person</Label>
                          <Input
                            type="number"
                            value={ticket.maxPerWallet}
                            onChange={(e) => {
                              const updated = [...ticketTypes];
                              updated[index].maxPerWallet = parseInt(e.target.value) || 5;
                              setTicketTypes(updated);
                            }}
                            placeholder="5"
                            min="1"
                            max="20"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm">Description</Label>
                        <Textarea
                          value={ticket.description}
                          onChange={(e) => {
                            const updated = [...ticketTypes];
                            updated[index].description = e.target.value;
                            setTicketTypes(updated);
                          }}
                          placeholder="What's included with this ticket..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {ticketTypes.map((ticket, index) => (
                  <div key={ticket.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                    <h4 className="font-semibold">{ticket.name || `Ticket Type ${index + 1}`}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price (₹) *</Label>
                        <Input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => {
                            const updated = [...ticketTypes];
                            updated[index].price = parseInt(e.target.value) || 0;
                            setTicketTypes(updated);
                          }}
                          placeholder="1000"
                          min="0"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Total Tickets *</Label>
                        <Input
                          type="number"
                          value={ticket.totalSupply}
                          onChange={(e) => {
                            const updated = [...ticketTypes];
                            updated[index].totalSupply = parseInt(e.target.value) || 0;
                            setTicketTypes(updated);
                          }}
                          placeholder="100"
                          min="1"
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Revenue Preview */}
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <strong>Revenue:</strong> ₹{((ticket.price || 0) * (ticket.totalSupply || 0)).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Total Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-green-600">
                        {ticketTypes.reduce((sum, t) => sum + (t.totalSupply || 0), 0)}
                      </div>
                      <div className="text-xs text-green-700">Total Tickets</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-600">{ticketTypes.length}</div>
                      <div className="text-xs text-green-700">Ticket Types</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{Math.min(...ticketTypes.map(t => t.price || 0)).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-700">Starting Price</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{ticketTypes.reduce((sum, t) => sum + ((t.price || 0) * (t.totalSupply || 0)), 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-700">Max Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Event Overview */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-4">
                    {image && (
                      <img src={image} alt={title} className="w-20 h-20 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Category:</strong> {category}</div>
                        <div><strong>Date:</strong> {date} at {time}</div>
                        <div><strong>Venue:</strong> {venue}, {city}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Summary */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Ticket Types</h4>
                  {ticketTypes.map((ticket, index) => (
                    <div key={ticket.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{ticket.name}</span>
                        <span className="font-bold text-blue-600">₹{ticket.price?.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {ticket.totalSupply} tickets • Max {ticket.maxPerWallet} per person
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold mb-3 text-green-800">Total Revenue Potential</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{ticketTypes.reduce((sum, t) => sum + ((t.price || 0) * (t.totalSupply || 0)), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">
                      {ticketTypes.reduce((sum, t) => sum + (t.totalSupply || 0), 0)} tickets across {ticketTypes.length} types
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="terms" className="mt-1" />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <span className="text-blue-600 underline">Terms & Conditions</span> and confirm that all event details are accurate.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancel
                </Button>
                
                {currentStep < 5 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={loading || !validateStep(5)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}