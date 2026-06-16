import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen p-8 md:p-20" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <h1 className="text-4xl font-bold mb-8 text-gradient">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Introduction</h2>
          <p>Welcome to CodeVern Studio. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and share information when you use our platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> We collect your email address and authentication details when you register via Supabase Auth.</li>
            <li><strong>Social Media Data:</strong> When you connect accounts (like YouTube, Facebook, LinkedIn, Instagram) via OAuth, we receive access tokens that allow us to publish content on your behalf. We do not store your social media passwords.</li>
            <li><strong>Usage Data:</strong> We may collect data on how you interact with our AI generation tools to improve our services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. How We Use Your Information</h2>
          <p>We use your information strictly to provide our services, including:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Generating AI content based on your requests.</li>
            <li>Automatically publishing content to your connected social media channels.</li>
            <li>Managing your staff and team access within the dashboard.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Third-Party Services & Google API</h2>
          <p>CodeVern Studio uses third-party APIs (like Google API for YouTube). Our use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data. OAuth tokens are stored securely in our database and are only used for automated publishing as requested by you.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: heycodevern@gmail.com</p>
        </section>
      </div>
    </div>
  );
}
