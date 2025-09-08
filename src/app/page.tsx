'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isValidUrl, formatUrl } from '@/lib/utils-tracking';
import Link from 'next/link';

export default function HomePage() {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    customCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    trackingUrl?: string;
    link?: any;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Validate form
    if (!formData.url || !formData.title) {
      setResult({
        success: false,
        message: 'URL and title are required'
      });
      setLoading(false);
      return;
    }

    // Validate URL format
    const formattedUrl = formatUrl(formData.url);
    if (!isValidUrl(formattedUrl)) {
      setResult({
        success: false,
        message: 'Please enter a valid URL'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          original_url: formattedUrl,
          title: formData.title,
          description: formData.description,
          custom_code: formData.customCode || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: 'Tracking link created successfully!',
          trackingUrl: data.tracking_url,
          link: data.link
        });
        
        // Reset form
        setFormData({
          url: '',
          title: '',
          description: '',
          customCode: ''
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to create tracking link'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.'
      });
    }

    setLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">LinkTracker Pro</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="hidden sm:flex">
                <span className="mr-2">📊</span>
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Track Links with Precision
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create powerful tracking links that capture precise location data, analytics, and user engagement. 
            Get detailed insights with interactive maps and comprehensive dashboards.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Precise Tracking</h3>
              <p className="text-gray-600 text-sm">
                Capture exact location coordinates using HTML5 geolocation and IP fallback for comprehensive analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Interactive Maps</h3>
              <p className="text-gray-600 text-sm">
                Visualize click locations on interactive world maps with detailed geographic distribution and analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 text-sm">
                Monitor engagement patterns, device types, browsers, and geographic trends with detailed reporting.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Link Creation Form */}
        <Card className="max-w-2xl mx-auto shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Tracking Link</CardTitle>
            <CardDescription className="text-center">
              Generate a trackable link with advanced location analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="url" className="text-sm font-medium">
                  Target URL *
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The destination URL where users will be redirected
                </p>
              </div>

              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Link Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Campaign Name or Description"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about this tracking link..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customCode" className="text-sm font-medium">
                  Custom Code (Optional)
                </Label>
                <Input
                  id="customCode"
                  placeholder="my-custom-link"
                  value={formData.customCode}
                  onChange={(e) => setFormData({...formData, customCode: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for auto-generated code
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Link...
                  </div>
                ) : (
                  'Create Tracking Link'
                )}
              </Button>
            </form>

            {/* Result Display */}
            {result && (
              <Alert className={`mt-6 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
                
                {result.success && result.trackingUrl && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Tracking URL:</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-sm bg-gray-100 p-2 rounded text-blue-600 break-all">
                          {result.trackingUrl}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.trackingUrl || '')}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href="/dashboard" className="flex-1">
                        <Button variant="outline" className="w-full">
                          <span className="mr-2">📊</span>
                          View Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => window.open(result.trackingUrl, '_blank')}
                      >
                        <span className="mr-2">🔗</span>
                        Test Link
                      </Button>
                    </div>
                  </div>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/60 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 LinkTracker Pro. Professional link tracking and analytics platform.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Privacy-focused analytics • Secure tracking • GDPR compliant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}