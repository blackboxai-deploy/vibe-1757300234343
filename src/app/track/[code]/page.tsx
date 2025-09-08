'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCurrentLocation, getLocationFromIP } from '@/lib/utils-tracking';
import { Database } from '@/lib/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TrackingPage() {
  const params = useParams();
  const trackingCode = params.code as string;
  
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  useEffect(() => {
    if (!trackingCode) {
      setError('Invalid tracking code');
      setStatus('error');
      return;
    }

    // Find the link by tracking code
    const link = Database.getLinkByCode(trackingCode);
    if (!link) {
      setError('Link not found or expired');
      setStatus('error');
      return;
    }

    setTargetUrl(link.original_url);
    
    // Request location permission and capture analytics
    captureAnalytics(link.id, link.original_url);
  }, [trackingCode]);

  const captureAnalytics = async (linkId: string, originalUrl: string) => {
    let locationData = null;
    let ipLocationData = null;

    try {
      // Try to get precise location first
      locationData = await getCurrentLocation();
      setLocationPermission('granted');
    } catch (locationError) {
      setLocationPermission('denied');
      console.log('Precise location not available, using IP location');
      
      // Fallback to IP-based location
      try {
        ipLocationData = await getLocationFromIP();
      } catch (ipError) {
        console.log('IP location also failed');
      }
    }

    // Prepare analytics data
    const analyticsData = {
      link_id: linkId,
      latitude: locationData?.latitude || ipLocationData?.latitude || null,
      longitude: locationData?.longitude || ipLocationData?.longitude || null,
      country: ipLocationData?.country || 'Unknown',
      city: ipLocationData?.city || 'Unknown',
      referrer: document.referrer || ''
    };

    // Send analytics data to API
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsData)
      });
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }

    // Redirect after a short delay
    setStatus('redirecting');
    setTimeout(() => {
      window.location.href = originalUrl;
    }, 2000);
  };

  const handleManualRedirect = () => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">⚠</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="relative">
              <div className="h-16 w-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'loading' ? 'Preparing Redirect' : 'Redirecting...'}
            </h1>
            
            <p className="text-gray-600 mb-4">
              {status === 'loading' 
                ? 'Please wait while we prepare your destination...'
                : 'You will be redirected shortly...'
              }
            </p>
          </div>

          {/* Location permission status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <span className="text-gray-500 mr-2">📍</span>
              <span className="text-sm font-medium text-gray-700">
                Location Status
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              locationPermission === 'granted' 
                ? 'bg-green-100 text-green-700' 
                : locationPermission === 'denied'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {locationPermission === 'granted' 
                ? 'Precise location captured'
                : locationPermission === 'denied'
                ? 'Using approximate location'
                : 'Detecting location...'
              }
            </span>
          </div>

          {/* Manual redirect button */}
          {targetUrl && (
            <Button 
              onClick={handleManualRedirect}
              className="w-full"
              variant="outline"
            >
              <span className="mr-2">🔗</span>
              Continue to Destination
            </Button>
          )}

          {/* Privacy notice */}
          <div className="mt-6 text-xs text-gray-500">
            <p>
              This link tracks analytics for legitimate purposes. 
              Your privacy is protected and data is used responsibly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}