"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    business_name: '',
    niche: '',
    timezone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({
          business_name: data.business_name || '',
          niche: data.niche || '',
          timezone: data.timezone || ''
        });
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').update({
      business_name: formData.business_name,
      niche: formData.niche,
      timezone: formData.timezone
    }).eq('id', user.id);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Settings saved successfully.', 'success');
    }
    setIsSaving(false);
  };

  if (isLoading) return <p style={{ color: 'var(--text-secondary)' }}>Loading settings...</p>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Account Settings</h1>
      
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {toast.message}
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label className="input-label">Project / Business Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.business_name} 
              onChange={e => setFormData({...formData, business_name: e.target.value})} 
            />
          </div>

          <div>
            <label className="input-label">Content Niche</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.niche} 
              onChange={e => setFormData({...formData, niche: e.target.value})} 
            />
          </div>

          <div>
            <label className="input-label">Timezone</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.timezone} 
              onChange={e => setFormData({...formData, timezone: e.target.value})} 
            />
          </div>

          <button 
            className="btn-primary" 
            style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? <span className="spinner"></span> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
