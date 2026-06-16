import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  // Define OAuth Endpoints (Placeholders for now)
  const OAUTH_URLS: Record<string, string> = {
    facebook: `https://www.facebook.com/v17.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback&scope=pages_manage_posts,pages_read_engagement`,
    instagram: `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback&scope=user_profile,user_media&response_type=code`,
    youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.YOUTUBE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload`,
    linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback&scope=w_member_social`
  };

  const redirectUrl = OAUTH_URLS[provider];

  if (!redirectUrl) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  // Redirect user to the Provider's OAuth login page
  // Note: This will fail until the actual Client IDs are added to .env.local
  return NextResponse.redirect(redirectUrl);
}
