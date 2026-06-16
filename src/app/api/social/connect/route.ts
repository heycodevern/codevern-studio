import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Helper to get Google OAuth2 Client
export const getGoogleOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.NODE_ENV === 'production' 
      ? 'https://codevern-studio.vercel.app/api/social/callback/youtube' 
      : 'http://localhost:3000/api/social/callback/youtube'
  );
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
  const userId = searchParams.get('userId'); // We'll pass this from the frontend

  if (!provider) {
    return NextResponse.json({ error: 'Missing provider' }, { status: 400 });
  }

  if (provider === 'youtube') {
    if (!process.env.YOUTUBE_CLIENT_ID) {
      return NextResponse.json({ error: 'YOUTUBE_CLIENT_ID is not set in .env' }, { status: 500 });
    }

    const oauth2Client = getGoogleOAuthClient();

    // Generate a secure URL to Google's consent screen
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to get a refresh token
      prompt: 'consent', // Force consent screen to ensure refresh token is provided
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
      ],
      state: userId || 'unknown', // Pass the user ID so we know who they are in the callback
    });

    return NextResponse.redirect(authorizationUrl);
  }

  return NextResponse.json({ error: 'Provider not supported yet' }, { status: 400 });
}
