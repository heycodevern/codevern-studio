import { NextResponse } from 'next/server';
import { getGoogleOAuthClient } from '../../connect/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state'); // The userId we passed

  if (!code || !userId) {
    return NextResponse.json({ error: 'Missing code or state/userId' }, { status: 400 });
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('Failed to get access token from Google.');
    }

    // Set the credentials so we can fetch the user's YouTube channel info
    oauth2Client.setCredentials(tokens);

    // Optional: Fetch the YouTube channel name to display in the dashboard
    let channelName = 'YouTube Channel';
    try {
      const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true';
      const response = await oauth2Client.request({ url });
      const data: any = response.data;
      if (data.items && data.items.length > 0) {
        channelName = data.items[0].snippet.title;
      }
    } catch (e) {
      console.error('Could not fetch channel name:', e);
    }

    // Upsert the social account in our database
    const existing = await prisma.social_accounts.findFirst({
      where: { user_id: userId, platform: 'youtube' }
    });

    if (existing) {
      await prisma.social_accounts.update({
        where: { id: existing.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || existing.refresh_token,
          token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          account_name: channelName,
          is_connected: true
        }
      });
    } else {
      await prisma.social_accounts.create({
        data: {
          user_id: userId,
          platform: 'youtube',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          account_name: channelName,
          is_connected: true
        }
      });
    }

    // Successfully connected, redirect back to dashboard
    return NextResponse.redirect(new URL('/dashboard/social', req.url));

  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
