// Local storage-based database simulation
import { TrackingLink, AnalyticsEntry, DashboardStats } from './types';

const LINKS_KEY = 'tracking_links';
const ANALYTICS_KEY = 'tracking_analytics';

// Utility functions for local storage
export class Database {
  
  // Link operations
  static getLinks(): TrackingLink[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LINKS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveLinks(links: TrackingLink[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  }

  static addLink(link: TrackingLink): void {
    const links = this.getLinks();
    links.push(link);
    this.saveLinks(links);
  }

  static getLinkByCode(code: string): TrackingLink | null {
    const links = this.getLinks();
    return links.find(link => link.tracking_code === code) || null;
  }

  static updateLinkClicks(linkId: string): void {
    const links = this.getLinks();
    const linkIndex = links.findIndex(link => link.id === linkId);
    if (linkIndex !== -1) {
      links[linkIndex].click_count++;
      this.saveLinks(links);
    }
  }

  // Analytics operations
  static getAnalytics(): AnalyticsEntry[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveAnalytics(analytics: AnalyticsEntry[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  }

  static addAnalyticsEntry(entry: AnalyticsEntry): void {
    const analytics = this.getAnalytics();
    analytics.push(entry);
    this.saveAnalytics(analytics);
  }

  static getAnalyticsByLinkId(linkId: string): AnalyticsEntry[] {
    const analytics = this.getAnalytics();
    return analytics.filter(entry => entry.link_id === linkId);
  }

  static deleteAnalyticsEntry(entryId: string): boolean {
    const analytics = this.getAnalytics();
    const initialLength = analytics.length;
    const filtered = analytics.filter(entry => entry.id !== entryId);
    
    if (filtered.length < initialLength) {
      this.saveAnalytics(filtered);
      return true;
    }
    return false;
  }

  // Dashboard statistics
  static getDashboardStats(): DashboardStats {
    const links = this.getLinks();
    const analytics = this.getAnalytics();
    
    const totalClicks = analytics.length;
    const uniqueIPs = new Set(analytics.map(a => a.ip_address)).size;
    
    // Count clicks by country
    const countryCount = analytics.reduce((acc, entry) => {
      if (entry.country) {
        acc[entry.country] = (acc[entry.country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const recentClicks = analytics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return {
      total_links: links.length,
      total_clicks: totalClicks,
      unique_visitors: uniqueIPs,
      top_countries: topCountries,
      recent_clicks: recentClicks
    };
  }

  // Clear all data (for testing)
  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LINKS_KEY);
    localStorage.removeItem(ANALYTICS_KEY);
  }
}