"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Sparkles, Image as ImageIcon, Save, Calendar, Loader2 } from 'lucide-react';

export default function DraftContentPage() {
  const params = useParams();
  const router = useRouter();
  const platform = params.platform as string;

  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{ title: string, description: string } | null>(null);
  
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic first.");
    
    setIsGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, userId: user?.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedData(data);
      setEditedTitle(data.title);
      setEditedDescription(data.description);
    } catch (error: any) {
      alert("AI Generation failed: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!editedTitle || !editedDescription) return;
    setIsSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user?.id,
        platform: platform,
        title: editedTitle,
        description: editedDescription,
        status: 'draft'
      });

      if (error) throw error;
      alert("Draft saved successfully! You can find it in the Content Calendar.");
      router.push(`/dashboard/social/${platform}`);
    } catch (error: any) {
      alert("Failed to save draft: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => router.push(`/dashboard/social/${platform}`)}
      >
        <ArrowLeft size={16} /> Back to {platform} Manager
      </button>

      <div style={{ marginBottom: '30px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Draft New Content</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Use your connected AI Engine to generate highly optimized posts for {platform}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Left Column: Input */}
        <div>
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="var(--accent-primary)" /> AI Prompt
            </h3>
            
            <label className="input-label">What is this post about?</label>
            <textarea 
              className="input-field" 
              placeholder={`E.g. A tutorial on how to use CodeVern Studio for ${platform} automation...`}
              style={{ height: '150px', resize: 'vertical', marginBottom: '20px' }}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
              {isGenerating ? 'Engine generating...' : 'Generate with AI Engine'}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div>
          <div className="glass-panel" style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '20px' }}>Generated Draft</h3>
            
            {!generatedData ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', opacity: 0.5 }}>
                <Sparkles size={48} style={{ marginBottom: '15px' }} />
                <p>Output will appear here</p>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="input-label">Title</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label className="input-label">Description / Caption</label>
                  <textarea 
                    className="input-field" 
                    style={{ flex: 1, resize: 'vertical', minHeight: '200px' }}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    <Calendar size={18} /> Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
