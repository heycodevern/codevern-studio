import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Vercel Cron Security: Ensure the request comes from Vercel
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch all posts that are scheduled and past their publish time
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString());

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No posts scheduled for publishing at this time.' });
    }

    const results = [];

    // 2. Process each post
    for (const post of posts) {
      try {
        // Fetch the user's social account token
        const { data: account, error: accountError } = await supabaseAdmin
          .from('social_accounts')
          .select('*')
          .eq('user_id', post.user_id)
          .eq('platform', post.platform)
          .single();

        if (accountError || !account) {
          throw new Error(`Social account not found or disconnected for platform: ${post.platform}`);
        }

        // --- YOUTUBE PUBLISHING LOGIC ---
        if (post.platform === 'youtube') {
          const oauth2Client = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET
          );

          oauth2Client.setCredentials({
            access_token: account.access_token,
            refresh_token: account.refresh_token,
          });

          const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

          // In a real scenario, you would download the media_url into a stream.
          // For this engine MVP, if there is no media URL, we cannot publish a video.
          if (!post.media_url) {
             throw new Error('No media_url provided. YouTube requires a video file.');
          }

          // Fetch the video file from the URL (Supabase Storage)
          const mediaRes = await fetch(post.media_url);
          if (!mediaRes.ok) throw new Error('Failed to download media file from URL');

          // @ts-ignore
          const response = await youtube.videos.insert({
            part: ['snippet', 'status'],
            requestBody: {
              snippet: {
                title: post.title,
                description: post.description,
                tags: post.tags || [],
                categoryId: '22' // People & Blogs default
              },
              status: {
                privacyStatus: 'public' // or 'private'/'unlisted'
              }
            },
            media: {
              body: mediaRes.body // ReadableStream
            }
          });

          // Mark as published
          await supabaseAdmin.from('posts').update({
            status: 'published',
            published_url: `https://youtube.com/watch?v=${response.data.id}`
          }).eq('id', post.id);

          results.push({ id: post.id, status: 'success', videoId: response.data.id });
        }
        
      } catch (postError: any) {
        console.error(`Error publishing post ${post.id}:`, postError);
        // Mark as failed
        await supabaseAdmin.from('posts').update({
          status: 'failed',
          error_message: postError.message
        }).eq('id', post.id);
        
        results.push({ id: post.id, status: 'failed', error: postError.message });
      }
    }

    return NextResponse.json({ message: 'Cron execution completed', results });

  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
