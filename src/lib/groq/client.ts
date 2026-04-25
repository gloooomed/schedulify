import Groq from 'groq-sdk';
import { configStore } from '../config/store';

export const MODEL = 'llama-3.3-70b-versatile';

function getGroqClient(): Groq | null {
  const key = configStore.get()?.groqApiKey || import.meta.env.VITE_GROQ_API_KEY;
  if (!key) return null;
  return new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
}

export async function askGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const client = getGroqClient();
  if (!client) throw new Error('Groq API key not configured.');
  const chat = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });
  return chat.choices[0]?.message?.content ?? '';
}

export async function testGroqConnection(apiKey: string): Promise<boolean> {
  try {
    const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: 'Say "ok"' }],
      max_tokens: 5,
    });
    return true;
  } catch {
    return false;
  }
}
