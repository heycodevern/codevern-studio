"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, Users, CalendarClock, Zap } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [socialCount, setSocialCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // Fetch Connected Socials
      const { count: socialDataCount } = await supabase.from('social_accounts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_connected', true);
      setSocialCount(socialDataCount || 0);

      // Fetch Scheduled Posts
      const { count: scheduledCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'scheduled');
      setPostsCount(scheduledCount || 0);
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Dashboard Overview</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}! Here is what is happening with your smart engine.
      </p>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            <Activity size={18} />
            <h4 style={{ margin: 0, fontWeight: 500 }}>System Status</h4>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#10b981' }}>Online</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Engine is running smoothly</p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            <Users size={18} />
            <h4 style={{ margin: 0, fontWeight: 500 }}>Social Accounts</h4>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>{socialCount}</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Connected platforms</p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            <CalendarClock size={18} />
            <h4 style={{ margin: 0, fontWeight: 500 }}>Scheduled Posts</h4>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>{postsCount}</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Awaiting generation</p>
        </div>

      </div>

      {/* Quick Actions */}
      <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: 'var(--accent-glow)', padding: '15px', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <Zap size={24} />
          </div>
          <div>
            <h4 style={{ marginBottom: '5px' }}>Connect Socials</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Link YouTube, Facebook, and Instagram to start automating.</p>
            <a href="/dashboard/social" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Connect Now →</a>
          </div>
        </div>

      </div>
    </div>
  );
}
