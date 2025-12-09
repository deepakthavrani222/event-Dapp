import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // For JWT-based auth, logout is handled client-side by removing the token
  // This endpoint exists for consistency and future session management
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
