"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sun, Moon, CheckCircle2, AlertCircle, Rocket, Zap, Bot, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    email: '',
    password: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [isDark, setIsDark] = useState(false);

  const router = useRouter();

  // Auto-redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard/keys');
      }
    };
    checkUser();
  }, [router]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const completeSetup = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    if (isLoginMode) {
      // Handle Login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setErrorMsg(authError.message);
        showToast(authError.message, 'error');
        setIsLoading(false);
        return;
      }

      showToast('Login successful! Redirecting...', 'success');
      router.push('/dashboard/keys');
      return;
    }

    // Handle Registration
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      showToast(authError.message, 'error');
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        business_name: formData.businessName,
        niche: formData.niche,
        timezone: formData.timezone
      });

      if (profileError) {
        setErrorMsg(profileError.message);
        showToast(profileError.message, 'error');
        setIsLoading(false);
        return;
      }
    }

    showToast('Engine built successfully! Welcome aboard.', 'success');

    // Simulate small delay for smooth animation
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 1000);
  };

  return (
    <div className="split-layout">
      
      {/* Left Side: Branding & Value Prop */}
      <div className="split-left">
        <div>
          <div style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px' }}>
            CodeVern Studio v2.0
          </div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '20px' }}>
            The Smart <br/> <span className="text-gradient">Social Engine</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '40px' }}>
            Automate your growth across YouTube, Facebook, and Instagram with advanced AI optimization.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}><Zap size={20} color="var(--accent-primary)" /></div>
              <div>
                <h4 style={{ color: 'var(--text-primary)' }}>100% Automated</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Set it and forget it scheduling.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}><Bot size={20} color="var(--accent-primary)" /></div>
              <div>
                <h4 style={{ color: 'var(--text-primary)' }}>Multi-AI Fallback</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>OpenAI, Gemini, DeepSeek & more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Glassmorphism Form */}
      <div className="split-right" style={{ position: 'relative' }}>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{ position: 'absolute', top: '20px', right: '40px', fontSize: '1.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          title="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={{ width: '100%', maxWidth: '500px', padding: '40px', position: 'relative' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
              {isLoginMode 
                ? "Welcome Back" 
                : step === 1 
                  ? "Create your Engine" 
                  : step === 2 
                    ? "Algorithm Config" 
                    : step === 3 
                      ? "Finalize Setup" 
                      : "Dashboard Ready"}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isLoginMode 
                ? "Sign in to access your dashboard." 
                : step === 1 
                  ? "Basic details to tune the AI to your niche." 
                  : step === 2 
                    ? "Reviewing the prompt strategies." 
                    : step === 3 
                      ? "You are almost there." 
                      : ""}
            </p>
          </div>

          {toast && (
            <div className="toast-container">
              <div className={`toast toast-${toast.type}`}>
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {toast.message}
              </div>
            </div>
          )}

          <>
            {/* Login Mode or Step 1 */}
            {(step === 1 || isLoginMode) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {!isLoginMode && (
                    <div>
                      <label className="input-label">Project / Business Name</label>
                      <input type="text" className="input-field" placeholder="e.g. CodeVern Tech" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                  )}
                  
                  <div>
                    <label className="input-label">Email Address (For Login)</label>
                    <input type="email" className="input-field" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Password</label>
                    <input type="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  
                  {!isLoginMode && (
                    <>
                      <div>
                        <label className="input-label">Your Content Niche / Industry</label>
                        <input type="text" className="input-field" placeholder="e.g. Tech Education" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} />
                      </div>
                      <div>
                        <label className="input-label">Detected Timezone</label>
                        <input type="text" className="input-field" value={formData.timezone} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                      </div>
                    </>
                  )}

                  {isLoginMode ? (
                    <button className="btn-primary" style={{ marginTop: '10px' }} onClick={completeSetup} disabled={isLoading}>
                      {isLoading ? <span className="spinner"></span> : null}
                      {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleNext}>
                      Next Step <ArrowRight size={16} />
                    </button>
                  )}

                  <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                    {isLoginMode ? "Don't have an engine yet? " : "Already have an engine? "}
                    <button 
                      onClick={() => setIsLoginMode(!isLoginMode)}
                      style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      {isLoginMode ? "Create one" : "Login"}
                    </button>
                  </p>

                </div>
              )}

              {/* Step 2 */}
              {step === 2 && !isLoginMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'var(--accent-glow)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Algorithm Optimizer Active</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      We will automatically inject trending hashtags, SEO keywords, and optimal formatting for {formData.niche || "your niche"} directly into the AI prompts.
                    </p>
                  </div>
                  <button className="btn-primary" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleNext}>
                    Continue <ArrowRight size={16} />
                  </button>
                  <button style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }} onClick={handleBack}><ArrowLeft size={16} /> Back</button>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && !isLoginMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Click below to create your account and securely setup your database.
                  </p>
                  
                  {errorMsg && (
                    <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} /> {errorMsg}
                    </div>
                  )}
                  
                  <button className="btn-primary" style={{ marginTop: '10px' }} onClick={completeSetup} disabled={isLoading}>
                    {isLoading ? <span className="spinner"></span> : null}
                    {isLoading ? 'Processing...' : 'Complete Setup'}
                  </button>
                  <button style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }} onClick={handleBack} disabled={isLoading}><ArrowLeft size={16} /> Back</button>
                </div>
              )}

              {/* Step 4: Dashboard Preview */}
              {step === 4 && !isLoginMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
                  <div style={{ marginBottom: '10px', color: 'var(--accent-primary)' }}><Rocket size={48} /></div>
                  <h3 className="text-gradient">Engine is Online</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Welcome to your automated dashboard.
                  </p>
                  
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => window.location.href = '/dashboard/keys'}>
                    Configure AI API Keys <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          {/* Progress Bar */}
          {step < 4 && !isLoginMode && !isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ 
                  width: '30px', height: '4px', borderRadius: '2px',
                  background: i <= step ? 'var(--accent-primary)' : 'var(--border-color)',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
