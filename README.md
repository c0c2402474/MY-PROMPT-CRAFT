# MY PROMPT CRAFT

## 概要

このプロジェクトは、曖昧なプロンプトを AI との対話で改善し、実行しやすい最適なプロンプトに変換する MVP です。

- ユーザーが「ブログを書いて」などの簡単な依頼を入力
- AI が不足情報を診断して追加質問を生成
- 回答を受け取り、構造化された改善プロンプトを生成
- 生成されたプロンプトと改善理由を表示

## 使い方

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバー起動

```bash
npm run dev
```

起動後、`http://localhost:3000` にアクセスしてください。

## 主要構成

- `src/app/page.tsx`
  - メイン UI と状態管理
  - 依頼入力 -> 質問生成 -> 回答 -> 改善プロンプト生成 のフローを実装
- `src/app/api/chat/route.ts`
  - Gemini / OpenAI 互換 API を想定したプロキシ API
  - `mode: analyze` と `mode: optimize` に対応
- `src/constants/prompts.ts`
  - AI に与えるシステムプロンプト定義
  - 解析と最適化のテンプレートを管理
- `src/types/ai.ts`
  - 型定義

## API 設定

### Gemini

- `provider` を `gemini` に選択
- `Gemini APIキー` を入力

### OpenAI 互換（LM Studio など）

- `provider` を `openai-compatible` に選択
- `API Base URL` と `モデルID` を入力

## 注意事項

- 現在の実装は MVP です。
- 実際のモデル呼び出しでは、指定した API が起動し、正しいレスポンス形式を返す必要があります。 
- `src/app/api/chat/route.ts` は AI レスポンスを JSON としてパースする設計です。

## 今後の拡張候補

- 質問フォームの動的生成をさらに改善
- Gemini / OpenAI 以外のモデルプロバイダー追加
- ローカル LLM 対応の強化
- プロンプトテンプレートのカスタマイズ管理
