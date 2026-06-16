"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ApiKey {
  id: string;
  provider: string;
  api_key: string;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [provider, setProvider] = useState('openai');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const fetchKeys = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    
    const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', user.id);
    if (!error && data) {
      setKeys(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAddKey = async () => {
    if (!apiKeyInput) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('api_keys').insert({
      user_id: user.id,
      provider: provider,
      api_key: apiKeyInput,
    });

    if (!error) {
      setApiKeyInput('');
      fetchKeys();
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>AI API Keys</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Add your API keys here. Our Smart Algorithm Engine will automatically cycle through them, testing each one. If one fails or hits a rate limit, we instantly fall back to the next working key.
      </p>

      {/* Add New Key */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px' }}>Add New Key</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="input-label">Provider</label>
            <select 
              className="input-field" 
              value={provider} 
              onChange={e => setProvider(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="gemini">Google Gemini</option>
              <option value="claude">Anthropic Claude</option>
              <option value="grok">xAI Grok</option>
              <option value="meta">Meta AI (Llama)</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label className="input-label">API Key</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="sk-..." 
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleAddKey}>Add Key</button>
        </div>
      </div>

      {/* List Keys */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Your Configured Keys</h3>
        {isLoading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        ) : keys.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No API keys added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {keys.map(k => (
              <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ textTransform: 'capitalize' }}>{k.provider}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>••••••••••••••••</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {k.is_active ? (
                    <span style={{ color: '#10b981', fontSize: '0.9rem' }}>● Active</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>● Failed</span>
                  )}
                  <button style={{ color: '#ef4444', padding: '5px 10px', fontSize: '0.8rem' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
