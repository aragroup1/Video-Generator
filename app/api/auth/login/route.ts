import { NextRequest, NextResponse } from 'next/server';
import { createToken, setAuthCookie, initializeSingleUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Initialize single user if needed
    await initializeSingleUser();

    // Simple password check
    const correctPassword = process.env.ADMIN_PASSWORD || 'changeme';
    
    if (password !== correctPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: 'single-user',
      email: 'admin@localhost',
      name: 'Admin',
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: 'single-user',
        email: 'admin@localhost',
        name: 'Admin',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 400 }
    );
  }
}
