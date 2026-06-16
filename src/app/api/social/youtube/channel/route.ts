import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // 1. Get the stored YouTube token for this user
    const { data: account, error } = await supabaseAdmin
      .from('social_accounts')
      .select('access_token, refresh_token, token_expires_at')
      .eq('user_id', userId)
      .eq('platform', 'youtube')
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'YouTube account not connected' }, { status: 404 });
    }

    // 2. Initialize Google OAuth Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      // The redirect URI doesn't matter for API calls, but we must provide it
      process.env.NODE_ENV === 'production' 
        ? 'https://codevern-studio.vercel.app/api/social/callback/youtube'
        : 'http://localhost:3000/api/social/callback/youtube'
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.token_expires_at ? new Date(account.token_expires_at).getTime() : null,
    });

    // 3. Fetch channel details
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    const response = await youtube.channels.list({
      part: ['snippet', 'brandingSettings', 'statistics'],
      mine: true
    });

    const items = response.data.items;
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No channel found for this account' }, { status: 404 });
    }

    const channel = items[0];

    return NextResponse.json({
      title: channel.snippet?.title,
      description: channel.snippet?.description,
      thumbnailUrl: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url,
      bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
      subscriberCount: channel.statistics?.subscriberCount,
      videoCount: channel.statistics?.videoCount,
      viewCount: channel.statistics?.viewCount,
    });

  } catch (error: any) {
    console.error('Error fetching YouTube channel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
