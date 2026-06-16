"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, UploadCloud, FileVideo, FileImage, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function MediaLibraryPage() {
  const params = useParams();
  const router = useRouter();
  const platform = params.platform as string;

  const [files, setFiles] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch files from Storage
    const { data: storageFiles, error } = await supabase.storage.from('media').list(user.id + '/');
    if (!error && storageFiles) {
      setFiles(storageFiles);
    }

    // Fetch Drafts for attaching
    const { data: draftData } = await supabase
      .from('posts')
      .select('id, title, status')
      .eq('platform', platform)
      .eq('user_id', user.id)
      .in('status', ['draft', 'scheduled', 'failed'])
      .order('created_at', { ascending: false });

    if (draftData) setDrafts(draftData);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [platform]);

  // Simulate smooth upload progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      setUploadProgress(0);
      interval = setInterval(() => {
        setUploadProgress(prev => {
          const increment = Math.random() * 15;
          const next = prev + increment;
          return next >= 90 ? 90 : next; // Hold at 90% until fully resolved
        });
      }, 500);
    } else if (uploadProgress > 0) {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000); // Clear after 1 second
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsUploading(false);
      return;
    }

    // Generate safe filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage.from('media').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      alert("Upload failed: " + error.message);
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Upload Failed',
        message: `Could not upload ${file.name}: ${error.message}`,
        type: 'error'
      });
    } else {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Media Uploaded',
        message: `${file.name} has been added to your library securely!`,
        type: 'success'
      });
      fetchData(); // Refresh file list
    }
    
    setIsUploading(false);
    // Reset input
    e.target.value = '';
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const openAttachModal = async (file: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const url = getPublicUrl(`${user.id}/${file.name}`);
    setSelectedFileUrl(url);
    setSelectedDraftId('');
    setAttachModalOpen(true);
  };

  const handleAttach = async () => {
    if (!selectedDraftId || !selectedFileUrl) return;

    const { error } = await supabase
      .from('posts')
      .update({ media_url: selectedFileUrl })
      .eq('id', selectedDraftId);

    if (error) {
      alert("Failed to attach media: " + error.message);
    } else {
      alert("Media successfully attached to post!");
      setAttachModalOpen(false);
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '5px' }}>Media Library</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Upload videos and images to attach to your generated posts.</p>
        </div>
        
        {/* Upload Button */}
        <div style={{ position: 'relative' }}>
          <input 
            type="file" 
            id="media-upload" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
            accept="video/mp4,video/quicktime,image/jpeg,image/png"
          />
          <button 
            className="btn-primary" 
            onClick={() => document.getElementById('media-upload')?.click()}
            disabled={isUploading}
            style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '200px', justifyContent: 'center' }}
          >
            {isUploading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
          
          {/* Progress Bar */}
          {(isUploading || uploadProgress > 0) && (
            <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                background: uploadProgress === 100 ? '#10b981' : 'var(--accent-primary)', 
                width: `${uploadProgress}%`,
                transition: 'width 0.5s ease-out, background 0.3s'
              }} />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading media...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {files.filter(f => f.name !== '.emptyFolderPlaceholder').length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <UploadCloud size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
              <h3>Your library is empty</h3>
              <p>Upload a .mp4 video to get started.</p>
            </div>
          ) : (
            files.filter(f => f.name !== '.emptyFolderPlaceholder').map(file => (
              <div key={file.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', marginBottom: '15px' }}>
                  {file.metadata?.mimetype?.startsWith('video') ? (
                    <FileVideo size={48} style={{ color: 'var(--accent-primary)' }} />
                  ) : (
                    <FileImage size={48} style={{ color: '#10b981' }} />
                  )}
                </div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  {(file.metadata?.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '5px' }}
                  onClick={() => openAttachModal(file)}
                >
                  <LinkIcon size={14} /> Attach to Post
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Attach Modal */}
      {attachModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Attach to Post</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Select a draft to link this media file to.</p>
            
            <div style={{ marginBottom: '25px' }}>
              <select 
                className="input-field" 
                value={selectedDraftId}
                onChange={(e) => setSelectedDraftId(e.target.value)}
                style={{ appearance: 'none', background: 'var(--bg-primary)' }}
              >
                <option value="" disabled>Select a post...</option>
                {drafts.map(d => (
                  <option key={d.id} value={d.id}>
                    [{d.status.toUpperCase()}] {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1 }} 
                onClick={handleAttach}
                disabled={!selectedDraftId}
              >
                Confirm Link
              </button>
              <button 
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} 
                onClick={() => setAttachModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
