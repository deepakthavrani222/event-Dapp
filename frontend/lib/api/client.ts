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
    const token = localStorage.getItem('token');
    console.log('Getting token from localStorage:', !!token);
    return token;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Adding Authorization header with token');
      } else {
        console.log('No token available for Authorization header');
      }
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Check if auth should be excluded (when headers are explicitly set to empty object)
    const excludeAuth = options.headers && Object.keys(options.headers).length === 0;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(!excludeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No token provided');
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
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

  async getOrganizerStats() {
    return this.request('/api/organizer/stats', {
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
    // Add multiple cache-busting parameters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return this.request(`/api/buyer/tickets?_t=${timestamp}&_r=${random}&_cb=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store', // Force no caching
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

  async getMyResaleListings() {
    return this.request('/api/buyer/my-listings', {
      method: 'GET',
    });
  }

  async cancelListing(listingId: string) {
    return this.request(`/api/buyer/listings/${listingId}/cancel`, {
      method: 'POST',
    });
  }

  async getListing(listingId: string) {
    return this.request(`/api/buyer/listings/${listingId}`, {
      method: 'GET',
    });
  }

  async updateListingPrice(listingId: string, price: number) {
    return this.request(`/api/buyer/listings/${listingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ price }),
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

  // Image upload endpoints
  async uploadImage(file: File, type: 'event' | 'avatar' | 'ticket' = 'event') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const url = `${this.baseUrl}/api/upload/image`;
    
    // Get token for authentication
    const token = this.getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method: 'POST',
      headers,
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  async deleteImage(publicId: string) {
    return this.request(`/api/upload/image?publicId=${publicId}`, {
      method: 'DELETE',
    });
  }

  // Artist endpoints
  async getArtistProfile() {
    return this.request('/api/artist/profile', {
      method: 'GET',
    });
  }

  async saveArtistProfile(profileData: any) {
    return this.request('/api/artist/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async submitArtistVerification(documents: any) {
    return this.request('/api/artist/verification', {
      method: 'POST',
      body: JSON.stringify(documents),
    });
  }

  async getArtistVerificationStatus() {
    return this.request('/api/artist/verification', {
      method: 'GET',
    });
  }

  async getArtistAnalytics(timeRange: string = '30d') {
    return this.request(`/api/artist/analytics?timeRange=${timeRange}`, {
      method: 'GET',
    });
  }

  async getArtistMessages(page: number = 1, status?: string) {
    const query = new URLSearchParams({ page: page.toString() });
    if (status) query.append('status', status);
    
    return this.request(`/api/artist/messages?${query}`, {
      method: 'GET',
    });
  }

  async sendArtistMessage(messageData: any) {
    return this.request('/api/artist/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Admin Artist endpoints
  async getAdminArtists(status: string = 'pending', page: number = 1) {
    return this.request(`/api/admin/artists?status=${status}&page=${page}`, {
      method: 'GET',
    });
  }

  async verifyArtist(artistId: string, action: 'approve' | 'reject', data: any) {
    return this.request(`/api/admin/artists/${artistId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    });
  }

  // Public Artist Profile (no auth required)
  async getArtistProfile(slug: string) {
    return this.request(`/api/artist/${slug}`, {
      method: 'GET',
      headers: {}, // No auth required for public profiles
    });
  }

  // Get all verified artists (public endpoint)
  async getVerifiedArtists() {
    return this.request('/api/artists', {
      method: 'GET',
      headers: {}, // No auth required for public artist list
    });
  }

  // Follow/Unfollow artist
  async followArtist(slug: string, action: 'follow' | 'unfollow') {
    return this.request(`/api/artist/${slug}/follow`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // Check if following artist
  async checkArtistFollowStatus(slug: string) {
    return this.request(`/api/artist/${slug}/follow`, {
      method: 'GET',
    });
  }

  // Subscribe to artist updates
  async subscribeToArtist(slug: string, email: string) {
    return this.request(`/api/artist/${slug}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Golden Ticket endpoints
  async getGoldenTicketTemplates() {
    return this.request('/api/artist/golden-tickets', {
      method: 'GET',
    });
  }

  async createGoldenTicketTemplate(templateData: any) {
    return this.request('/api/artist/golden-tickets', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async getGoldenTicketTemplate(id: string) {
    return this.request(`/api/artist/golden-tickets/${id}`, {
      method: 'GET',
      headers: {}, // Public endpoint
    });
  }

  async updateGoldenTicketTemplate(id: string, updateData: any) {
    return this.request(`/api/artist/golden-tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteGoldenTicketTemplate(id: string) {
    return this.request(`/api/artist/golden-tickets/${id}`, {
      method: 'DELETE',
    });
  }

  async purchaseGoldenTicket(templateId: string, purchaseData: any) {
    return this.request(`/api/buyer/golden-tickets/${templateId}/purchase`, {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  // Artist Messaging endpoints
  async getArtistMessages(page: number = 1, status?: string) {
    const params = new URLSearchParams({ page: page.toString() });
    if (status) params.append('status', status);
    
    return this.request(`/api/artist/messages?${params}`, {
      method: 'GET',
    });
  }

  async sendArtistMessage(messageData: any) {
    return this.request('/api/artist/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getArtistAudience() {
    return this.request('/api/artist/audience', {
      method: 'GET',
    });
  }

  // Admin Settings endpoints
  async getAdminSettings(category?: string) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/api/admin/settings${params}`, {
      method: 'GET',
    });
  }

  async updateAdminSetting(settingData: any) {
    return this.request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settingData),
    });
  }

  async getAdminUsers(role?: string) {
    const params = role ? `?role=${role}` : '';
    return this.request(`/api/admin/users${params}`, {
      method: 'GET',
    });
  }

  async addAdminUser(userData: any) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getAuditLogs(filters: any = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    
    return this.request(`/api/admin/audit?${params}`, {
      method: 'GET',
    });
  }

  async getDataExports() {
    return this.request('/api/admin/export', {
      method: 'GET',
    });
  }

  async requestDataExport(exportData: any) {
    return this.request('/api/admin/export', {
      method: 'POST',
      body: JSON.stringify(exportData),
    });
  }

  // Artist Perks endpoints
  async getArtistPerks() {
    return this.request('/api/artist/perks', {
      method: 'GET',
    });
  }

  async recalculateArtistTier() {
    return this.request('/api/artist/perks', {
      method: 'POST',
      body: JSON.stringify({ action: 'recalculate' }),
    });
  }

  // Collaboration endpoints
  async getCollaborations(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/artist/collaborations${params}`, {
      method: 'GET',
    });
  }

  async createCollaboration(collabData: any) {
    return this.request('/api/artist/collaborations', {
      method: 'POST',
      body: JSON.stringify(collabData),
    });
  }

  async getCollaboration(id: string) {
    return this.request(`/api/artist/collaborations/${id}`, {
      method: 'GET',
    });
  }

  async respondToCollaboration(id: string, action: string, data: any = {}) {
    return this.request(`/api/artist/collaborations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action, ...data }),
    });
  }

  // NFT Collectibles endpoints
  async getNFTCollectibles() {
    return this.request('/api/artist/nft-collectibles', {
      method: 'GET',
    });
  }

  async createNFTCollectible(collectibleData: any) {
    return this.request('/api/artist/nft-collectibles', {
      method: 'POST',
      body: JSON.stringify(collectibleData),
    });
  }

  // Featured Artists endpoints (public)
  async getFeaturedArtists() {
    return this.request('/api/admin/featured-artists', {
      method: 'GET',
      headers: {}, // Public endpoint
    });
  }

  async manageFeaturedArtists(action: string, data: any) {
    return this.request('/api/admin/featured-artists', {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    });
  }

  async trackFeaturedArtistClick(artistId: string) {
    return this.request(`/api/admin/featured-artists/${artistId}/click`, {
      method: 'POST',
      headers: {}, // Public endpoint
    });
  }
}

export const apiClient = new ApiClient(API_URL);
