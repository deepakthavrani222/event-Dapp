// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  location: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejectionReason?: string;
  minPrice?: number;
  totalAvailable?: number;
  ticketTypes?: TicketType[];
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
}

// Ticket types
export interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  availableSupply: number;
  totalSupply: number;
  tokenId?: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  ticketType: string;
  price: number;
  qrCode: string;
  status: 'active' | 'used' | 'resale';
  tokenId: number;
  nftAddress?: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'ORGANIZER' | 'ADMIN' | 'INSPECTOR' | 'PROMOTER';
  walletAddress?: string;
}
