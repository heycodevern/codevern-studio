"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Zap, Rocket, CheckCircle2, Share2, Video, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket size={18} color="var(--accent-primary)" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>CodeVern Studio</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 0.2s' }} className="hover:text-white">
            Login
          </Link>
          <Link href="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Get Started Free
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '100px 20px', textAlign: 'center', position: 'relative' }}>
        {/* Abstract Background Glows */}
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '250px', height: '250px', background: '#e1306c', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '30px', marginBottom: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
            CodeVern Studio v2.0 is now live
          </div>
          
          <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, fontWeight: 800, marginBottom: '24px', letterSpacing: '-2px' }}>
            The Smart <span className="text-gradient">Social Engine</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Automate your growth across YouTube, Facebook, and Instagram with advanced AI optimization. Generate, schedule, and publish without lifting a finger.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <Link 
              href="/login" 
              className="btn-primary" 
              style={{ padding: '15px 35px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Start Automating
              <ArrowRight size={20} style={{ transform: isHovered ? 'translateX(5px)' : 'translateX(0)', transition: 'transform 0.2s ease' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '15px' }}>Everything you need to scale</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Powerful tools built for creators and social media managers.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {/* Feature 1 */}
            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Bot size={24} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Multi-AI Fallback</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Connect your OpenAI, Gemini, or DeepSeek API keys. Generate high-converting captions and scripts instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(225, 48, 108, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Share2 size={24} color="#e1306c" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Auto-Publishing</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Seamlessly connect YouTube, Facebook, and Instagram. Schedule posts and let the engine publish them while you sleep.</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <CheckCircle2 size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Team Management</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Invite staff members to your dashboard with temporary passwords and custom role-based permissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-glass)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Rocket size={20} color="var(--accent-primary)" />
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>CodeVern Studio</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px' }}>
          <Link href="/privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Terms of Service</Link>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>&copy; {new Date().getFullYear()} CodeVern Studio. All rights reserved.</p>
      </footer>

    </div>
  );
}
