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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('social_accounts').select('*').eq('platform', platform).eq('user_id', user.id).single();
      setAccount(data);
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer' }}>
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
