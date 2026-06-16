"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    email: '',
    password: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const completeSetup = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insert the profile details
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        business_name: formData.businessName,
        niche: formData.niche,
        timezone: formData.timezone
      });

      if (profileError) {
        setErrorMsg(profileError.message);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setStep(4); // Move to dashboard
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>CodeVern Studio</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 1 && "Let's set up your smart social media engine."}
            {step === 2 && "Configure your AI content generation."}
            {step === 3 && "Connect your social platforms."}
          </p>
        </div>

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">Project / Business Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. CodeVern Tech"
                value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})}
              />
            </div>
            <div>
              <label className="input-label">Email Address (For Login)</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="input-label">Your Content Niche / Industry</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Tech Education, Earning Websites..."
                value={formData.niche}
                onChange={e => setFormData({...formData, niche: e.target.value})}
              />
            </div>
            <div>
              <label className="input-label">Detected Timezone (For Auto-Posting)</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.timezone}
                readOnly
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '8px' }}>
                All scheduled posts will automatically sync to {formData.timezone}.
              </p>
            </div>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={handleNext}>
              Continue to AI Setup →
            </button>
          </div>
        )}

        {/* Step 2: AI Details */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Smart Algorithm Engine</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                CodeVern Studio uses advanced Prompt Engineering tailored for YouTube, Facebook, and Instagram to maximize reach and engagement. We will automatically use the best available AI API.
              </p>
            </div>
            
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={handleNext}>
              Continue to Connections →
            </button>
            <button style={{ color: 'var(--text-secondary)', marginTop: '10px' }} onClick={handleBack}>
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Social Media Setup Placeholder */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {['YouTube', 'Facebook', 'Instagram', 'LinkedIn'].map(platform => (
                <div key={platform} className="glass-panel" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <h4 style={{ color: 'var(--text-primary)' }}>{platform}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Not Connected</p>
                </div>
              ))}
            </div>
            
            {errorMsg && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>{errorMsg}</p>}
            
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={completeSetup} disabled={isLoading}>
              {isLoading ? 'Setting up your engine...' : 'Complete Setup & Enter Dashboard'}
            </button>
            <button style={{ color: 'var(--text-secondary)', marginTop: '10px' }} onClick={handleBack}>
              ← Back
            </button>
          </div>
        )}

        {/* Step 4: Dashboard Preview */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
              <h2 className="text-gradient">Welcome to CodeVern Studio</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                Your {formData.niche || 'Niche'} Engine is Ready.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)' }}>AI API Status</h4>
                <p style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>● 0 Keys Configured</p>
              </div>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)' }}>Scheduled Posts</h4>
                <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', marginTop: '5px' }}>0 Upcoming</p>
              </div>
            </div>
            
            <button 
              className="btn-primary" 
              style={{ marginTop: '20px' }}
              onClick={() => window.location.href = '/dashboard/keys'}
            >
              Configure AI API Keys →
            </button>
          </div>
        )}
        
        {/* Progress Bar (Only show during setup) */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ 
                width: '40px', 
                height: '4px', 
                borderRadius: '2px',
                background: i <= step ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
