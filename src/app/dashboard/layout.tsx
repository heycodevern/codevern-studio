"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Share2, KeyRound, Settings, LogOut, Sun, Moon, Search, Bell, ChevronDown, User } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ email: string, name: string, role: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check Theme
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }

    // Unified Auth Check
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        const { data: profile } = await supabase.from('profiles').select('business_name, role').eq('id', user.id).single();
        setUserProfile({
          email: user.email || '',
          name: profile?.business_name || 'Admin',
          role: profile?.role || 'OWNER'
        });
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to CodeVern', text: 'Your engine is ready.', time: 'Just now', read: false },
    { id: 2, title: 'YouTube Connected', text: 'OAuth token secured successfully.', time: '5m ago', read: false },
  ]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '30px', height: '30px', borderTopColor: 'var(--accent-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, width: 'fit-content' }}>
          CodeVern Studio
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Overview
          </Link>
          
          <Link href="/dashboard/social" className={`sidebar-link ${pathname === '/dashboard/social' ? 'active' : ''}`}>
            <Share2 size={18} />
            Social Accounts
          </Link>

          {(userProfile?.role === 'OWNER' || userProfile?.role === 'ADMIN') && (
            <>
              <Link href="/dashboard/keys" className={`sidebar-link ${pathname === '/dashboard/keys' ? 'active' : ''}`}>
                <KeyRound size={18} />
                AI API Keys
              </Link>
              <Link href="/dashboard/staff" className={`sidebar-link ${pathname === '/dashboard/staff' ? 'active' : ''}`}>
                <User size={18} />
                Manage Staff
              </Link>
              <Link href="/dashboard/settings" className={`sidebar-link ${pathname === '/dashboard/settings' ? 'active' : ''}`}>
                <Settings size={18} />
                Settings
              </Link>
            </>
          )}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button onClick={toggleTheme} className="sidebar-link" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            Toggle Theme
          </button>
          <button onClick={handleLogout} className="sidebar-link" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', color: '#ef4444' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        
        <header className="dashboard-header" style={{ justifyContent: 'space-between' }}>
          
          {/* Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 16px', borderRadius: 'var(--radius-lg)', width: '300px', border: '1px solid var(--border-color)' }}>
            <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder="Search campaigns, keywords..." 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '0.9rem' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <div style={{ cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }} onClick={() => setIsNotifOpen(!isNotifOpen)}>
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
                )}
              </div>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 15px)', right: '-10px', width: '320px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', zIndex: 50 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h4>
                    <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}>Mark all as read</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No new notifications.</p>
                    ) : (
                      notifications.slice(0, 5).map(notif => (
                        <div key={notif.id} style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)', borderLeft: notif.read ? '2px solid transparent' : '2px solid var(--accent-primary)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{notif.title}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{notif.time}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{notif.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px', borderRadius: 'var(--radius-md)' }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <User size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{userProfile?.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{userProfile?.email}</span>
                </div>
                <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '220px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', zIndex: 50 }}>
                  <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)', textDecoration: 'none' }}>
                    <Settings size={16} />
                    Account Settings
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#ef4444' }} onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
