import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get password from environment variable (defaults to 'admin123' if not set)
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

    if (password === adminPassword) {
      return NextResponse.json({ 
        success: true,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
