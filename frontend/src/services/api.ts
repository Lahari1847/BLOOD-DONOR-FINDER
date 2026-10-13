// Centralized API Client for LifeLink
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const effectiveToken = token || localStorage.getItem('lifelink_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: any) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateProfile(data: any) {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAccount() {
    const res = await fetch(`${API_URL}/auth/account`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Donors
  async searchDonors(params: Record<string, string | number | boolean | undefined>) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_URL}/donors/search?${query.toString()}`);
    return res.json();
  },

  async upsertDonorProfile(data: any) {
    const res = await fetch(`${API_URL}/donors/profile`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleAvailability() {
    const res = await fetch(`${API_URL}/donors/availability/toggle`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async addDonationRecord(data: any) {
    const res = await fetch(`${API_URL}/donors/records`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getDonorAnalytics() {
    const res = await fetch(`${API_URL}/donors/analytics`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getDonorContactRequests() {
    const res = await fetch(`${API_URL}/donors/contact-requests`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async respondToContactRequest(id: string, action: 'ACCEPT' | 'DECLINE' | 'RESERVE') {
    const res = await fetch(`${API_URL}/donors/contact-requests/${id}/respond`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    return res.json();
  },

  // Requests
  async createRequest(data: any) {
    const res = await fetch(`${API_URL}/requests/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async listEmergencyRequests(params?: { bloodGroup?: string; city?: string; urgency?: string }) {
    const query = new URLSearchParams();
    if (params?.bloodGroup && params.bloodGroup !== 'ALL') query.append('bloodGroup', params.bloodGroup);
    if (params?.city) query.append('city', params.city);
    if (params?.urgency && params.urgency !== 'ALL') query.append('urgency', params.urgency);

    const res = await fetch(`${API_URL}/requests/emergency?${query.toString()}`);
    return res.json();
  },

  async listMyRequests() {
    const res = await fetch(`${API_URL}/requests/my-requests`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async sendContactRequest(requestId: string, donorId: string, message?: string) {
    const res = await fetch(`${API_URL}/requests/contact`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ requestId, donorId, message }),
    });
    return res.json();
  },

  async updateRequestStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/requests/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async reportAbuse(data: { targetType: string; targetId: string; reason: string }) {
    const res = await fetch(`${API_URL}/requests/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Directory
  async getPublicStats() {
    const res = await fetch(`${API_URL}/directory/public-stats`);
    return res.json();
  },

  async listHospitals(city?: string) {
    const url = city ? `${API_URL}/directory/hospitals?city=${encodeURIComponent(city)}` : `${API_URL}/directory/hospitals`;
    const res = await fetch(url);
    return res.json();
  },

  async listBloodBanks(city?: string) {
    const url = city ? `${API_URL}/directory/blood-banks?city=${encodeURIComponent(city)}` : `${API_URL}/directory/blood-banks`;
    const res = await fetch(url);
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Admin
  async getAdminAnalytics() {
    const res = await fetch(`${API_URL}/admin/analytics`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async listReports() {
    const res = await fetch(`${API_URL}/admin/reports`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateReportStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/admin/reports/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async togglePartnerVerification(type: 'hospital' | 'bloodbank', id: string) {
    const res = await fetch(`${API_URL}/admin/verify-partner/${type}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },
};
