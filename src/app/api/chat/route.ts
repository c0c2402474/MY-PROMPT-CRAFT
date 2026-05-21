import { NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '../../../../constants/prompts';
import type { ChatRequestBody } from '../../../../types/ai';

async function callGemini(systemPrompt: string, prompt: string, apiKey: string) {
  if (!apiKey) {
    throw new Error('Gemini APIキーが設定されていません。');
  }
  const module = await import('@google/generative-ai');
  const { GoogleGenerativeAI } = module;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
  return result.response.text();
}

async function callOpenAICompatible(systemPrompt: string, prompt: string, config: { baseUrl?: string; modelId?: string }) {
  const baseUrl = config.baseUrl?.trim() || '';
  const modelId = config.modelId?.trim() || '';

  if (!baseUrl || !modelId) {
    throw new Error('OpenAI互換APIの baseUrl と modelId を設定してください。');
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`APIエラー: ${response.status} ${body}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? '';
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;
  const { provider, mode, prompt, answers = {}, config } = body;
  const systemPrompt = mode === 'analyze' ? SYSTEM_PROMPTS.ANALYZER : SYSTEM_PROMPTS.OPTIMIZER;
  const userPrompt =
    mode === 'analyze'
      ? `ユーザー入力:\n${prompt}`
      : `元の依頼:\n${prompt}\n\n補足情報:\n${Object.entries(answers)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}`;

  try {
    const text =
      provider === 'gemini'
        ? await callGemini(systemPrompt, userPrompt, config.apiKey ?? '')
        : await callOpenAICompatible(systemPrompt, userPrompt, config);

    if (mode === 'analyze') {
      try {
        const parsed = JSON.parse(text);
        return NextResponse.json({ questions: parsed.questions ?? [] });
      } catch {
        return NextResponse.json({ error: '解析結果がJSON形式ではありませんでした。', raw: text }, { status: 500 });
      }
    }

    if (mode === 'optimize') {
      try {
        const parsed = JSON.parse(text);
        return NextResponse.json({
          improvedPrompt: parsed.improvedPrompt ?? parsed.prompt ?? '',
          improvementReason: parsed.improvementReason ?? parsed.reason ?? '',
        });
      } catch {
        return NextResponse.json({ error: '生成結果がJSON形式ではありませんでした。', raw: text }, { status: 500 });
      }
    }

    return NextResponse.json({ error: '不明なモードです。' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
