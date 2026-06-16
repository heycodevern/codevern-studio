import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  try {
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });

    const resolvedParams = await params;
    const platform = resolvedParams.platform;

    // 1. Fetch Post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) throw new Error('Post not found');

    // 2. Fetch User Account
    const { data: account, error: accountError } = await supabaseAdmin
      .from('social_accounts')
      .select('*')
      .eq('user_id', post.user_id)
      .eq('platform', platform)
      .single();

    if (accountError || !account) throw new Error(`Social account disconnected for ${platform}`);

    // --- INSTANT PUBLISH ENGINE ---
    if (platform === 'youtube') {
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
      });

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      if (!post.media_url) {
        throw new Error('No media_url provided. YouTube requires a video file. Please use the Media Library first.');
      }

      // Fetch the video file
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
            categoryId: '22'
          },
          status: {
            privacyStatus: 'public'
          }
        },
        media: {
          body: mediaRes.body // Stream directly to YouTube
        }
      });

      // Mark as published
      await supabaseAdmin.from('posts').update({
        status: 'published',
        published_url: `https://youtube.com/watch?v=${response.data.id}`
      }).eq('id', post.id);

      // Success Notification
      await supabaseAdmin.from('notifications').insert({
        user_id: post.user_id,
        title: 'Video Published!',
        message: `Your video "${post.title}" has been successfully published to YouTube instantly!`,
        type: 'success'
      });

      return NextResponse.json({ success: true, url: `https://youtube.com/watch?v=${response.data.id}` });
    }

    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });

  } catch (error: any) {
    console.error('Instant Publish Error:', error);
    
    try {
      const { postId } = await req.clone().json();
      const { data: post } = await supabaseAdmin.from('posts').select('user_id, title').eq('id', postId).single();
      
      if (post) {
        // Mark as failed
        await supabaseAdmin.from('posts').update({ status: 'failed', error_message: error.message }).eq('id', postId);
        
        // Error Notification
        await supabaseAdmin.from('notifications').insert({
          user_id: post.user_id,
          title: 'Publishing Failed',
          message: `Failed to instantly publish "${post.title || 'Draft'}": ${error.message}`,
          type: 'error'
        });
      }
    } catch (e) {
      // Ignored
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
