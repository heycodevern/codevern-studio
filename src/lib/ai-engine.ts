import { supabase } from './supabase';

interface GenerateContentParams {
  userId: string;
  prompt: string;
}

export async function generateSmartContent({ userId, prompt }: GenerateContentParams) {
  // 1. Fetch all active keys for this user
  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !keys || keys.length === 0) {
    throw new Error('No active API keys found. Please add a key in the dashboard.');
  }

  // 2. Fallback Logic: Iterate through keys until one works
  for (const keyRecord of keys) {
    try {
      console.log(`Testing provider: ${keyRecord.provider}`);
      
      const content = await callAiProvider(keyRecord.provider, keyRecord.api_key, prompt);
      
      // Update last_tested_at
      await supabase.from('api_keys').update({ last_tested_at: new Date().toISOString() }).eq('id', keyRecord.id);
      
      return { content, providerUsed: keyRecord.provider };
    } catch (err) {
      console.error(`Provider ${keyRecord.provider} failed:`, err);
      // Mark as inactive if rate-limited or invalid
      await supabase.from('api_keys').update({ is_active: false, last_tested_at: new Date().toISOString() }).eq('id', keyRecord.id);
      // Continue to the next key in the loop...
    }
  }

  throw new Error('All configured API keys failed.');
}

async function callAiProvider(provider: string, apiKey: string, prompt: string): Promise<string> {
  // In a real production app, we would use specific SDKs or fetch calls based on the provider.
  // This is a placeholder for the actual API fetch logic per provider.
  
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] })
    });
    if (!res.ok) throw new Error('OpenAI API Error');
    const data = await res.json();
    return data.choices[0].message.content;
  }
  
  if (provider === 'gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error('Gemini API Error');
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  // ... Other providers (Claude, Meta, Grok, DeepSeek) logic goes here.
  // For now, if the provider fetch isn't implemented, throw to test fallback.
  throw new Error(`Provider ${provider} SDK logic not yet fully implemented in demo.`);
}
