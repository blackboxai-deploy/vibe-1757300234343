import { NextResponse } from 'next/server';
import { Database } from '@/lib/database';

// GET - Retrieve dashboard statistics
export async function GET() {
  try {
    const stats = Database.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}