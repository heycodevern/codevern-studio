"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaYoutube, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  is_connected: boolean;
}

export default function SocialConnectionsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);

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
    setConnectingPlatform(platform);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setConnectingPlatform(null);
      return;
    }
    window.location.href = `/api/social/connect?provider=${platform}&userId=${user.id}`;
  };

  const handleDisconnect = async (platform: string) => {
    setDisconnectingPlatform(platform);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setDisconnectingPlatform(null);
      return;
    }
    
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .match({ user_id: user.id, platform });
      
    if (!error) {
      await fetchAccounts();
    }
    setDisconnectingPlatform(null);
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => router.push(`/dashboard/social/${platform.id}`)}
                    >
                      Manage
                    </button>
                    <button 
                      style={{ color: '#ef4444', padding: '5px 10px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '5px', opacity: disconnectingPlatform === platform.id ? 0.5 : 1, cursor: disconnectingPlatform === platform.id ? 'not-allowed' : 'pointer' }}
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={disconnectingPlatform === platform.id}
                    >
                      {disconnectingPlatform === platform.id ? <Loader2 size={14} className="animate-spin" /> : null}
                      {disconnectingPlatform === platform.id ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>Not Connected</p>
                  <button 
                    className="btn-primary" 
                    style={{ background: platform.color, boxShadow: `0 4px 15px ${platform.color}40`, display: 'flex', alignItems: 'center', gap: '8px', opacity: connectingPlatform === platform.id ? 0.7 : 1, cursor: connectingPlatform === platform.id ? 'not-allowed' : 'pointer' }}
                    onClick={() => handleConnect(platform.id)}
                    disabled={connectingPlatform === platform.id}
                  >
                    {connectingPlatform === platform.id ? <Loader2 size={18} className="animate-spin" /> : null}
                    {connectingPlatform === platform.id ? 'Connecting...' : `Connect ${platform.name}`}
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
