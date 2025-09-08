import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import { generateId, generateTrackingCode, isValidUrl, formatUrl } from '@/lib/utils-tracking';
import { CreateLinkRequest, TrackingLink } from '@/lib/types';

// POST - Create a new tracking link
export async function POST(request: NextRequest) {
  try {
    const body: CreateLinkRequest = await request.json();
    
    // Validate required fields
    if (!body.original_url || !body.title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    // Validate and format URL
    const formattedUrl = formatUrl(body.original_url);
    if (!isValidUrl(formattedUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate tracking code (use custom if provided and unique)
    let trackingCode = body.custom_code || generateTrackingCode();
    
    // Check if custom code already exists
    if (body.custom_code && Database.getLinkByCode(body.custom_code)) {
      return NextResponse.json(
        { error: 'Custom code already exists' },
        { status: 409 }
      );
    }

    // Create new tracking link
    const newLink: TrackingLink = {
      id: generateId(),
      original_url: formattedUrl,
      tracking_code: trackingCode,
      title: body.title,
      description: body.description || '',
      created_at: new Date().toISOString(),
      click_count: 0
    };

    // Save to database
    Database.addLink(newLink);

    // Return the created link with tracking URL
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/track/${trackingCode}`;
    
    return NextResponse.json({
      success: true,
      link: newLink,
      tracking_url: trackingUrl
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve all tracking links
export async function GET() {
  try {
    const links = Database.getLinks();
    
    // Add tracking URLs to each link
    const baseUrl = 'http://localhost:3000'; // Will be dynamic in production
    const linksWithUrls = links.map(link => ({
      ...link,
      tracking_url: `${baseUrl}/track/${link.tracking_code}`
    }));

    return NextResponse.json({
      success: true,
      links: linksWithUrls
    });

  } catch (error) {
    console.error('Error retrieving links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}