'use client';

import { useState } from 'react';
import type { AIProvider, AnalysisQuestion, OptimizationResponse, ProviderConfig } from '../types/ai';

const defaultConfig: ProviderConfig = {
  apiKey: '',
  baseUrl: 'http://localhost:8080',
  modelId: 'gpt-4o-mini',
};

export default function Home() {
  const [provider, setProvider] = useState<AIProvider>('openai-compatible');
  const [config, setConfig] = useState<ProviderConfig>(defaultConfig);
  const [originalPrompt, setOriginalPrompt] = useState('ブログを書いて');
  const [questions, setQuestions] = useState<AnalysisQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [step, setStep] = useState<'input' | 'questions' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = (key: keyof ProviderConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setStep('input');
    setError(null);
  };

  const analyzePrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          mode: 'analyze',
          prompt: originalPrompt,
          config,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.questions) {
        throw new Error(data.error || '解析に失敗しました。');
      }

      setQuestions(data.questions);
      setStep('questions');
    } catch (catchError: any) {
      setError(catchError.message || '通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          mode: 'optimize',
          prompt: originalPrompt,
          answers,
          config,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.improvedPrompt) {
        throw new Error(data.error || '生成に失敗しました。');
      }

      setResult({
        improvedPrompt: data.improvedPrompt,
        improvementReason: data.improvementReason || '',
      });
      setStep('result');
    } catch (catchError: any) {
      setError(catchError.message || '通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improvedPrompt);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm shadow-slate-200/50">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Prompt Craft</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">曖昧なプロンプトを、AIとの対話で最強のプロンプトへ</h1>
          <p className="max-w-2xl text-base text-slate-600">不足情報を診断し、追加質問から回答を統合して、構造化された改善プロンプトを生成します。</p>
        </div>

        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-medium">モデル</span>
              <select
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                value={provider}
                onChange={event => setProvider(event.target.value as AIProvider)}
              >
                <option value="openai-compatible">OpenAI互換 / LM Studio</option>
                <option value="gemini">Gemini</option>
              </select>
            </label>
            {provider === 'gemini' ? (
              <label className="space-y-2 text-sm text-slate-700">
                <span className="font-medium">Gemini APIキー</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  value={config.apiKey}
                  onChange={event => updateConfig('apiKey', event.target.value)}
                  placeholder="APIキーを入力してください"
                />
              </label>
            ) : (
              <>
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">API Base URL</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    value={config.baseUrl}
                    onChange={event => updateConfig('baseUrl', event.target.value)}
                    placeholder="http://localhost:8080"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">モデルID</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    value={config.modelId}
                    onChange={event => updateConfig('modelId', event.target.value)}
                    placeholder="gpt-4o-mini"
                  />
                </label>
              </>
            )}
          </div>

          <label className="space-y-3 text-sm text-slate-700">
            <span className="font-medium">元の依頼</span>
            <textarea
              rows={5}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              value={originalPrompt}
              onChange={event => setOriginalPrompt(event.target.value)}
            />
          </label>

          {error ? (
            <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {step === 'input' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                onClick={analyzePrompt}
                disabled={loading || originalPrompt.trim().length === 0}
              >
                {loading ? '解析中…' : '不足情報を診断する'}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                onClick={handleReset}
              >
                リセット
              </button>
            </div>
          ) : null}

          {step === 'questions' ? (
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-50 p-6">
                <h2 className="text-xl font-semibold text-slate-900">追加情報を教えてください</h2>
                <p className="mt-2 text-sm text-slate-600">AI が改善プロンプトを生成するために必要な質問です。</p>
              </div>

              <div className="grid gap-4">
                {questions.map(question => (
                  <label key={question.key} className="space-y-2 text-sm text-slate-700">
                    <span className="font-medium">{question.label}</span>
                    <input
                      type="text"
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                      value={answers[question.key] || ''}
                      onChange={event => handleAnswerChange(question.key, event.target.value)}
                    />
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  onClick={createPrompt}
                  disabled={loading || questions.length === 0}
                >
                  {loading ? '生成中…' : '改善プロンプトを生成する'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  onClick={handleReset}
                >
                  最初からやり直す
                </button>
              </div>
            </div>
          ) : null}

          {step === 'result' && result ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">改善されたプロンプト</h2>
                    <p className="mt-1 text-sm text-slate-600">このプロンプトをコピーして、AI に入力できます。</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    onClick={handleCopy}
                  >
                    コピーする
                  </button>
                </div>
                <pre className="mt-5 whitespace-pre-wrap rounded-3xl bg-white p-5 text-sm leading-6 text-slate-900 shadow-sm">{result.improvedPrompt}</pre>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">改善理由</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{result.improvementReason}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  onClick={handleReset}
                >
                  新しい依頼を作成する
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
