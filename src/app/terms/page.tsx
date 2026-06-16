import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen p-8 md:p-20" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <h1 className="text-4xl font-bold mb-8 text-gradient">Terms of Service</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
          <p>By accessing and using CodeVern Studio ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Description of Service</h2>
          <p>CodeVern Studio provides AI-driven content generation and automated social media publishing tools. We act as an intermediary to help you manage your social media presence.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You agree not to use the Service to generate or distribute illegal, harmful, or abusive content.</li>
            <li>When connecting third-party platforms (e.g., YouTube), you agree to comply with their respective Terms of Service (such as the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>YouTube Terms of Service</a>).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">4. API Usage and Limitations</h2>
          <p>Our service integrates with external APIs. We are not responsible for any downtime, rate limits, or account suspensions imposed by third-party platforms (like Google or Meta) as a result of your usage of CodeVern Studio.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">5. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to the Service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">6. Changes to Terms</h2>
          <p>We may modify these terms at any time. We will notify users of any significant changes. Your continued use of the Service constitutes your acceptance of the updated terms.</p>
        </section>
      </div>
    </div>
  );
}
