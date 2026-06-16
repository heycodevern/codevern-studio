"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, ShieldAlert, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface StaffMember {
  id: string;
  business_name: string;
  role: string;
  created_at: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'MARKETING', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStaff = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('profiles').select('*').eq('owner_id', user.id);
    if (data) setStaff(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const res = await fetch('/api/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          businessName: formData.name,
          ownerId: user.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Staff member added successfully!', 'success');
      setIsAdding(false);
      setFormData({ email: '', password: '', role: 'MARKETING', name: '' });
      fetchStaff();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p style={{ color: 'var(--text-secondary)' }}>Loading staff...</p>;

  return (
    <div style={{ maxWidth: '900px' }}>
      
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {toast.message}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '5px' }}>Staff & Departments</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your team and their access permissions.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setIsAdding(!isAdding)}>
          <UserPlus size={18} /> Add Staff
        </button>
      </div>

      {isAdding && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <h3 style={{ marginBottom: '20px' }}>Create New Staff Account</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label className="input-label">Staff Member Name</label>
              <input type="text" className="input-field" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Temporary Password</label>
              <input type="text" className="input-field" placeholder="Create a password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Department (Role)</label>
              <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ appearance: 'none', background: 'var(--bg-primary)' }}>
                <option value="MARKETING">Marketing (Content Only)</option>
                <option value="ANALYST">Analyst (View Only)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={handleAddStaff} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
            <button style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }} onClick={() => setIsAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {staff.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <ShieldAlert size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
            <h3>No staff members yet</h3>
            <p>Click "Add Staff" to invite team members.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '15px 20px', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</th>
                <th style={{ padding: '15px 20px', fontWeight: 500, color: 'var(--text-secondary)' }}>Department (Role)</th>
                <th style={{ padding: '15px 20px', fontWeight: 500, color: 'var(--text-secondary)' }}>Added On</th>
                <th style={{ padding: '15px 20px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px 20px' }}>{s.business_name}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ padding: '4px 10px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {s.role}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <button style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Remove Staff">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
