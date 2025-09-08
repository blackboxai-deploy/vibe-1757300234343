'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatTimestamp } from '@/lib/utils-tracking';
import { TrackingLink, AnalyticsEntry, DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsResponse = await fetch('/api/dashboard');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Load all links
      const linksResponse = await fetch('/api/links');
      const linksData = await linksResponse.json();
      
      if (linksData.success) {
        setLinks(linksData.links);
      }

      // Load all analytics
      const analyticsResponse = await fetch('/api/analytics');
      const analyticsData = await analyticsResponse.json();
      
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalyticsEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/analytics/${entryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh data
        await loadDashboardData();
      } else {
        setError('Failed to delete analytics entry');
      }
    } catch (error) {
      setError('Network error while deleting entry');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const getFilteredAnalytics = () => {
    if (!selectedLinkId) return analytics;
    return analytics.filter(entry => entry.link_id === selectedLinkId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">LinkTracker Pro</h1>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <span className="mr-2">🏠</span>
                Create Link
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Monitor your link performance and visitor analytics</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Links</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total_links}</p>
                  </div>
                  <span className="text-3xl">🔗</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Clicks</p>
                    <p className="text-3xl font-bold text-green-900">{stats.total_clicks}</p>
                  </div>
                  <span className="text-3xl">👆</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Unique Visitors</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.unique_visitors}</p>
                  </div>
                  <span className="text-3xl">👥</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Top Country</p>
                    <p className="text-xl font-bold text-orange-900">
                      {stats.top_countries[0]?.country || 'N/A'}
                    </p>
                    <p className="text-sm text-orange-700">
                      {stats.top_countries[0]?.count || 0} clicks
                    </p>
                  </div>
                  <span className="text-3xl">🌍</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Links List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Tracking Links</CardTitle>
                <CardDescription>
                  Manage and monitor your active links
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {links.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p>No tracking links created yet</p>
                      <Link href="/">
                        <Button className="mt-2" size="sm">
                          Create Your First Link
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {links.map((link) => (
                        <div 
                          key={link.id} 
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedLinkId === link.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => setSelectedLinkId(selectedLinkId === link.id ? null : link.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 truncate">{link.title}</h3>
                            <Badge variant="secondary">{link.click_count} clicks</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate mb-2">{link.original_url}</p>
                          <div className="flex items-center justify-between">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {link.tracking_code}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(`${window.location.origin}/track/${link.tracking_code}`);
                              }}
                            >
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics and Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* World Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Click Locations Map</CardTitle>
                <CardDescription>
                  Geographic distribution of your link clicks
                  {selectedLinkId && ' (filtered by selected link)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive World Map</h3>
                    <p className="text-gray-600 max-w-sm">
                      {getFilteredAnalytics().length > 0 
                        ? `Showing ${getFilteredAnalytics().length} click locations from ${new Set(getFilteredAnalytics().map(a => a.country)).size} countries`
                        : 'No location data available yet. Create and share tracking links to see visitor locations here.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest clicks and location data
                      {selectedLinkId && ' (filtered by selected link)'}
                    </CardDescription>
                  </div>
                  {selectedLinkId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedLinkId(null)}
                    >
                      Show All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {getFilteredAnalytics().length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p>No analytics data available yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {getFilteredAnalytics()
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .slice(0, 20)
                        .map((entry) => {
                          const link = links.find(l => l.id === entry.link_id);
                          return (
                            <div key={entry.id} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {link?.title || 'Unknown Link'}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>📍 {entry.city}, {entry.country}</span>
                                    <span>🕒 {formatTimestamp(entry.timestamp)}</span>
                                    <span>💻 {entry.device_type}</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => deleteAnalyticsEntry(entry.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                              {entry.latitude && entry.longitude && (
                                <div className="text-xs text-gray-400">
                                  Coordinates: {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Countries */}
        {stats && stats.top_countries.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>
                Click distribution by country
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.top_countries.slice(0, 8).map((country, index) => (
                  <div key={country.country} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{country.country}</p>
                      <p className="text-sm text-gray-500">{country.count} clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}