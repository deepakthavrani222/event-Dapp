/**
 * API Client for backend communication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(options.headers !== undefined),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, name?: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
  }

  async verifyToken() {
    return this.request('/api/auth/verify', {
      method: 'GET',
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Event endpoints (public)
  async getEvents(filters?: { category?: string; city?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/buyer/events${query}`, {
      method: 'GET',
      headers: {},
    });
  }

  async getEvent(id: string) {
    return this.request(`/api/buyer/events/${id}`, {
      method: 'GET',
      headers: {},
    });
  }

  // Organizer endpoints
  async createEvent(eventData: any) {
    return this.request('/api/organizer/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getOrganizerEvents() {
    return this.request('/api/organizer/events', {
      method: 'GET',
    });
  }

  // Buyer endpoints
  async purchaseTickets(purchaseData: any) {
    return this.request('/api/buyer/purchase', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  async getMyTickets() {
    return this.request('/api/buyer/tickets', {
      method: 'GET',
    });
  }

  // Resale endpoints
  async resellTicket(ticketId: string, price: number) {
    return this.request('/api/buyer/resell', {
      method: 'POST',
      body: JSON.stringify({ ticketId, price }),
    });
  }

  async getResaleListings() {
    return this.request('/api/buyer/listings', {
      method: 'GET',
    });
  }

  async purchaseResaleTicket(listingId: string, paymentMethod: string) {
    return this.request(`/api/buyer/listings/${listingId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
    });
  }

  // Admin endpoints
  async getAdminEvents(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/admin/events${query}`, {
      method: 'GET',
    });
  }

  async approveEvent(eventId: string, action: 'approve' | 'reject', rejectionReason?: string) {
    return this.request('/api/admin/events/approve', {
      method: 'POST',
      body: JSON.stringify({ eventId, action, rejectionReason }),
    });
  }
}

export const apiClient = new ApiClient(API_URL);
