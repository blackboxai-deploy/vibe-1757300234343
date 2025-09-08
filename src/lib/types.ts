// Database types and interfaces for the link tracking system

export interface TrackingLink {
  id: string;
  original_url: string;
  tracking_code: string;
  title: string;
  description?: string;
  created_at: string;
  click_count: number;
}

export interface AnalyticsEntry {
  id: string;
  link_id: string;
  latitude: number | null;
  longitude: number | null;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  country?: string;
  city?: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  os?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface IPLocationResponse {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  ip: string;
}

export interface DashboardStats {
  total_links: number;
  total_clicks: number;
  unique_visitors: number;
  top_countries: Array<{
    country: string;
    count: number;
  }>;
  recent_clicks: AnalyticsEntry[];
}

export interface CreateLinkRequest {
  original_url: string;
  title: string;
  description?: string;
  custom_code?: string;
}

export interface TrackingData {
  link_id: string;
  location?: LocationData;
  user_agent: string;
  referrer?: string;
  ip_address: string;
}