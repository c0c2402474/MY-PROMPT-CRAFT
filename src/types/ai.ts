export type AIProvider = 'gemini' | 'openai-compatible';

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  modelId?: string;
}

export interface AnalysisQuestion {
  key: string;
  label: string;
}

export interface OptimizationResponse {
  improvedPrompt: string;
  improvementReason: string;
}

export interface ChatRequestBody {
  provider: AIProvider;
  mode: 'analyze' | 'optimize';
  prompt: string;
  answers?: Record<string, string>;
  config: ProviderConfig;
}
