import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { topic, platform, userId } = await req.json();

    if (!topic || !platform || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch the user's active API keys
    const { data: keys, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (keyError || !keys || keys.length === 0) {
      return NextResponse.json({ error: 'No active AI API keys found. Please add one in settings.' }, { status: 404 });
    }

    // 2. Select a provider (e.g. prioritize openai if available, otherwise gemini)
    const openaiKey = keys.find(k => k.provider === 'openai');
    const geminiKey = keys.find(k => k.provider === 'gemini');

    const selectedKey = openaiKey || geminiKey;
    if (!selectedKey) {
      return NextResponse.json({ error: 'No supported AI providers found.' }, { status: 404 });
    }

    let generatedTitle = '';
    let generatedDescription = '';

    const systemPrompt = `You are an expert Social Media Manager and SEO Specialist for ${platform}. 
Generate highly engaging, viral, and SEO-optimized content based on the user's topic.
Return EXACTLY a JSON object in this format, and nothing else:
{
  "title": "A catchy title (max 60 chars)",
  "description": "A detailed description with hashtags and call to actions"
}`;

    // 3. Call the AI Provider
    if (selectedKey.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedKey.api_key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Topic: ${topic}` }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const result = JSON.parse(data.choices[0].message.content);
      generatedTitle = result.title;
      generatedDescription = result.description;

    } else if (selectedKey.provider === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${selectedKey.api_key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nTopic: ${topic}` }] }
          ]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      let text = data.candidates[0].content.parts[0].text;
      // Strip markdown code blocks if gemini returned them
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(text);
      generatedTitle = result.title;
      generatedDescription = result.description;
    }

    return NextResponse.json({
      title: generatedTitle,
      description: generatedDescription
    });

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
