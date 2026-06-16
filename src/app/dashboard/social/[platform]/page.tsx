"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Image as ImageIcon, Send, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ManagePlatformPage() {
  const params = useParams();
  const router = useRouter();
  const platform = params.platform as string;
  const [account, setAccount] = useState<any>(null);
  const [channelStats, setChannelStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('social_accounts').select('*').eq('platform', platform).eq('user_id', user.id).single();
      setAccount(data);

      if (data && platform === 'youtube') {
        try {
          const res = await fetch(`/api/social/youtube/channel?userId=${user.id}`);
          if (res.ok) {
            const stats = await res.json();
            setChannelStats(stats);
          }
        } catch (e) {
          console.error("Failed to fetch youtube stats", e);
        }
      }

      setIsLoading(false);
    };

    fetchAccount();
  }, [platform]);

  if (isLoading) return <p style={{ color: 'var(--text-secondary)' }}>Loading platform data...</p>;

  return (
    <div style={{ maxWidth: '1000px' }}>
      
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => router.push('/dashboard/social')}
      >
        <ArrowLeft size={16} /> Back to Connections
      </button>

      {/* Dynamic Header for YouTube */}
      {platform === 'youtube' && channelStats ? (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '40px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
          {channelStats.bannerUrl ? (
            <div style={{ width: '100%', height: '180px', backgroundImage: `url(${channelStats.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          ) : (
            <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, #ff0000 0%, #990000 100%)' }}></div>
          )}
          
          <div style={{ padding: '20px 30px', display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-60px' }}>
            <img 
              src={channelStats.thumbnailUrl || '/default-avatar.png'} 
              alt="Channel DP" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--bg-primary)', backgroundColor: 'var(--bg-primary)' }}
            />
            <div style={{ paddingBottom: '10px' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '5px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{channelStats.title || account?.account_name}</h1>
              <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                  {parseInt(channelStats.subscriberCount || '0').toLocaleString()} Subscribers
                </span>
                <span>{parseInt(channelStats.videoCount || '0').toLocaleString()} Videos</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', textTransform: 'capitalize' }}>Manage {platform}</h1>
          {account?.is_connected ? (
            <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
              Active as {account.account_name || 'Connected'}
            </span>
          ) : (
            <span style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
              Not Connected
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div 
          className="glass-panel" 
          style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}
          onClick={() => router.push(`/dashboard/social/${platform}/draft`)}
        >
          <Edit3 size={24} style={{ color: 'var(--accent-primary)', marginBottom: '15px' }} />
          <h3 style={{ marginBottom: '5px' }}>Draft New Content</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Use AI to write posts automatically tailored for {platform}.</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer' }}>
          <ImageIcon size={24} style={{ color: 'var(--accent-primary)', marginBottom: '15px' }} />
          <h3 style={{ marginBottom: '5px' }}>Media Library</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upload or generate images and videos for your posts.</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer' }}>
          <Calendar size={24} style={{ color: 'var(--accent-primary)', marginBottom: '15px' }} />
          <h3 style={{ marginBottom: '5px' }}>Content Calendar</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View your automated publishing schedule.</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer' }}>
          <Clock size={24} style={{ color: 'var(--accent-primary)', marginBottom: '15px' }} />
          <h3 style={{ marginBottom: '5px' }}>Publishing Rules</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure optimal posting times and frequency.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3>Recent Automated Posts</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>No posts generated yet. Connect your API keys to start the engine.</p>
      </div>

    </div>
  );
}
