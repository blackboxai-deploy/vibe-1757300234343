import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import { generateId, getClientIP, parseUserAgent } from '@/lib/utils-tracking';
import { AnalyticsEntry } from '@/lib/types';

// POST - Store analytics data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.link_id) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const referrer = request.headers.get('referer') || body.referrer || '';
    const ipAddress = getClientIP(request);
    const deviceInfo = parseUserAgent(userAgent);

    // Create analytics entry
    const analyticsEntry: AnalyticsEntry = {
      id: generateId(),
      link_id: body.link_id,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      country: body.country || 'Unknown',
      city: body.city || 'Unknown',
      referrer: referrer,
      device_type: deviceInfo.device_type,
      browser: deviceInfo.browser,
      os: deviceInfo.os
    };

    // Save analytics data
    Database.addAnalyticsEntry(analyticsEntry);

    // Update link click count
    Database.updateLinkClicks(body.link_id);

    return NextResponse.json({
      success: true,
      message: 'Analytics data saved successfully'
    });

  } catch (error) {
    console.error('Error saving analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('link_id');

    let analytics;
    if (linkId) {
      // Get analytics for specific link
      analytics = Database.getAnalyticsByLinkId(linkId);
    } else {
      // Get all analytics
      analytics = Database.getAnalytics();
    }

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}