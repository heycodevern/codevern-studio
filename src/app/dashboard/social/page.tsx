"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaYoutube, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  is_connected: boolean;
}

export default function SocialConnectionsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const fetchAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    
    const { data, error } = await supabase.from('social_accounts').select('*').eq('user_id', user.id);
    if (!error && data) {
      setAccounts(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (platform: string) => {
    // Scaffolded for OAuth
    // In production, this redirects to the backend API route which redirects to the OAuth provider
    window.location.href = `/api/social/connect?provider=${platform}`;
  };

  const platforms = [
    { id: 'youtube', name: 'YouTube', color: '#ff0000', icon: <FaYoutube size={28} /> },
    { id: 'facebook', name: 'Facebook', color: '#1877f2', icon: <FaFacebook size={28} /> },
    { id: 'instagram', name: 'Instagram', color: '#e1306c', icon: <FaInstagram size={28} /> },
    { id: 'linkedin', name: 'LinkedIn', color: '#0a66c2', icon: <FaLinkedin size={28} /> },
  ];

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Social Accounts</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Connect your social media accounts. CodeVern Studio needs these connections to automatically publish your AI-generated content.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {platforms.map(platform => {
          const connectedAccount = accounts.find(a => a.platform === platform.id);
          
          return (
            <div key={platform.id} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: platform.color, marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {platform.icon}
              </div>
              <h3 style={{ marginBottom: '10px' }}>{platform.name}</h3>
              
              {connectedAccount && connectedAccount.is_connected ? (
                <>
                  <p style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '15px' }}>● Connected as {connectedAccount.account_name}</p>
                  <button style={{ color: '#ef4444', padding: '5px 10px', fontSize: '0.9rem', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)' }}>Disconnect</button>
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>Not Connected</p>
                  <button 
                    className="btn-primary" 
                    style={{ background: platform.color, boxShadow: `0 4px 15px ${platform.color}40` }}
                    onClick={() => handleConnect(platform.id)}
                  >
                    Connect {platform.name}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
