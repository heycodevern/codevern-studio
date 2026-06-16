"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Settings, Globe, Clock, Save, Loader2 } from 'lucide-react';

export default function PublishingRulesPage() {
  const params = useParams();
  const router = useRouter();
  const platform = params.platform as string;

  const [timezone, setTimezone] = useState('UTC');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('profiles').select('timezone').eq('id', user.id).single();
      if (data && data.timezone) {
        setTimezone(data.timezone);
      } else {
        // Auto-detect browser timezone
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').update({ timezone }).eq('id', user.id);
    
    if (error) {
      alert("Failed to save rules: " + error.message);
    } else {
      alert("Publishing Rules saved successfully!");
    }
    setIsSaving(false);
  };

  if (isLoading) return <p style={{ color: 'var(--text-secondary)', padding: '20px' }}>Loading rules...</p>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => router.push(`/dashboard/social/${platform}`)}
      >
        <ArrowLeft size={16} /> Back to {platform} Manager
      </button>

      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '5px' }}>Publishing Rules</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure how the background engine handles your scheduled content.</p>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Globe size={20} color="var(--accent-primary)" /> Engine Timezone
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Your cron jobs and content calendar will synchronize to this timezone. Ensure this matches your local time or your target audience's time.
        </p>
        
        <label className="input-label">Select Timezone</label>
        <select 
          className="input-field" 
          value={timezone} 
          onChange={(e) => setTimezone(e.target.value)}
          style={{ appearance: 'none', background: 'var(--bg-primary)' }}
        >
          <option value="UTC">UTC (Universal Coordinated Time)</option>
          <option value="America/New_York">Eastern Time (US & Canada)</option>
          <option value="America/Chicago">Central Time (US & Canada)</option>
          <option value="America/Denver">Mountain Time (US & Canada)</option>
          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
          <option value="Europe/London">London (GMT/BST)</option>
          <option value="Europe/Paris">Central European Time (CET)</option>
          <option value="Asia/Kolkata">India Standard Time (IST)</option>
          <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
          <option value="Australia/Sydney">Sydney (AEST)</option>
        </select>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Clock size={20} color="#10b981" /> Optimal Posting Times ({platform})
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Based on standard social media analytics, here are the recommended times to schedule your {platform} posts. The engine will soon automatically snap your drafts to these times.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '5px' }}>Morning Commute</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700 }}>08:00 AM</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '5px' }}>Lunch Break</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700 }}>12:30 PM</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '5px' }}>Evening Scroll</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700 }}>06:00 PM</div>
          </div>
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={handleSave} 
        disabled={isSaving}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
      >
        {isSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
        {isSaving ? 'Saving Rules...' : 'Save Publishing Rules'}
      </button>

    </div>
  );
}
