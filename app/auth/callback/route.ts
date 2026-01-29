/**
 * Auth Callback Route Handler
 * Handles OAuth redirects and email confirmations from Supabase
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
      );
    }

    // If this is a password recovery, redirect to update password page
    if (type === 'recovery') {
      return NextResponse.redirect(`${requestUrl.origin}/update-password`);
    }

    // Successful authentication, redirect to dashboard or requested page
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // No code present, redirect to login with error
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=${encodeURIComponent('Invalid authentication link.')}`
  );
}
