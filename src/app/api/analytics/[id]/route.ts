import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

// DELETE - Remove specific analytics entry
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: entryId } = await context.params;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Analytics entry ID is required' },
        { status: 400 }
      );
    }

    // Attempt to delete the analytics entry
    const deleted = Database.deleteAnalyticsEntry(entryId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Analytics entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting analytics entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve specific analytics entry
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: entryId } = await context.params;
    const analytics = Database.getAnalytics();
    const entry = analytics.find(a => a.id === entryId);

    if (!entry) {
      return NextResponse.json(
        { error: 'Analytics entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entry
    });

  } catch (error) {
    console.error('Error retrieving analytics entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}