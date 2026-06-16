"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, FileText, Send, Trash2 } from 'lucide-react';

export default function ContentCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const platform = params.platform as string;

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'draft' | 'scheduled' | 'published'>('draft');

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('platform', platform)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [platform]);

  const handleOpenSchedule = (post: any) => {
    setSelectedPost(post);
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedPost) return;

    // Combine date and time
    const dateTime = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    const { error } = await supabase
      .from('posts')
      .update({ status: 'scheduled', scheduled_for: dateTime })
      .eq('id', selectedPost.id);

    if (error) {
      alert("Failed to schedule: " + error.message);
    } else {
      setScheduleModalOpen(false);
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter(p => p.status === activeTab);

  return (
    <div style={{ maxWidth: '1000px' }}>
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => router.push(`/dashboard/social/${platform}`)}
      >
        <ArrowLeft size={16} /> Back to {platform} Manager
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '5px' }}>Content Calendar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and schedule your {platform} posts.</p>
        </div>
        <button className="btn-primary" onClick={() => router.push(`/dashboard/social/${platform}/draft`)}>
          + New Draft
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('draft')}
          style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeTab === 'draft' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'draft' ? 600 : 400, borderBottom: activeTab === 'draft' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileText size={16} /> Drafts
        </button>
        <button 
          onClick={() => setActiveTab('scheduled')}
          style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeTab === 'scheduled' ? '#10b981' : 'var(--text-secondary)', fontWeight: activeTab === 'scheduled' ? 600 : 400, borderBottom: activeTab === 'scheduled' ? '2px solid #10b981' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Clock size={16} /> Scheduled
        </button>
        <button 
          onClick={() => setActiveTab('published')}
          style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeTab === 'published' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'published' ? 600 : 400, borderBottom: activeTab === 'published' ? '2px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle2 size={16} /> Published
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading calendar...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredPosts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CalendarIcon size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
              <h3>No {activeTab} posts found.</h3>
              {activeTab === 'draft' && <p>Create a new draft using the AI engine to get started.</p>}
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ maxWidth: '600px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{post.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.description}</p>
                  
                  {post.status === 'scheduled' && post.scheduled_for && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Clock size={14} /> Scheduled for: {new Date(post.scheduled_for).toLocaleString()}
                    </div>
                  )}

                  {post.status === 'published' && post.published_url && (
                    <div style={{ marginTop: '10px' }}>
                      <a href={post.published_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>View Live Post →</a>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {(post.status === 'draft' || post.status === 'scheduled') && (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', gap: '5px', alignItems: 'center' }}
                      onClick={() => handleOpenSchedule(post)}
                    >
                      <CalendarIcon size={14} /> {post.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                    </button>
                  )}
                  <button 
                    style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                    onClick={() => handleDelete(post.id)}
                    title="Delete Post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Schedule Post</h3>
            <div style={{ marginBottom: '15px' }}>
              <label className="input-label">Date</label>
              <input type="date" className="input-field" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label className="input-label">Time</label>
              <input type="time" className="input-field" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleScheduleSubmit}>Confirm Schedule</button>
              <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} onClick={() => setScheduleModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
