export interface Product {
  id: string;
  name: string;
  description: string;
  targetAudience: "b2b" | "b2c" | "both";
  keyFeatures: string[];
  website?: string;
  createdAt: string;
}

export interface GeneratedContent {
  id: string;
  productId: string;
  platform: Platform;
  content: string;
  createdAt: string;
  copied: boolean;
  scheduledFor?: string;
  status: "draft" | "scheduled" | "posted";
  campaignId?: string;
  variationGroup?: string;
}

export type Platform =
  | "twitter"
  | "linkedin"
  | "email_subject"
  | "email_body"
  | "whatsapp"
  | "video_script"
  | "instagram";

export type Tone = "professional" | "casual" | "urgent" | "witty" | "storytelling";

export interface ContentRequest {
  productId: string;
  platforms: Platform[];
  tone: Tone;
  angle: string;
  customPrompt?: string;
}

export interface Template {
  id: string;
  name: string;
  category: "launch" | "feature" | "engagement" | "promo" | "story" | "custom";
  platforms: Platform[];
  tone: Tone;
  angle: string;
  customPrompt: string;
  isBuiltIn: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  productIds: string[];
  platforms: Platform[];
  templateId?: string;
  tone: Tone;
  angle: string;
  customPrompt?: string;
  status: "draft" | "generating" | "ready" | "completed";
  createdAt: string;
  completedAt?: string;
}

export interface BrandVoice {
  personality: string;
  writingSamples: string[];
  doNot: string[];
  includeAlways: string[];
  companyName: string;
}

export interface VideoJob {
  id: string;
  scriptContentId?: string;
  scriptText: string;
  type: "voiceover" | "talking_head";
  voiceId: string;
  status: "pending" | "processing" | "completed" | "failed";
  resultUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type AppView =
  | "dashboard"
  | "products"
  | "generate"
  | "history"
  | "settings"
  | "calendar"
  | "templates"
  | "campaigns"
  | "analytics"
  | "video"
  | "landing";

export interface AppState {
  products: Product[];
  generatedContent: GeneratedContent[];
  currentView: AppView;
  apiKey: string;
  aiProvider: "openai" | "anthropic";
  templates: Template[];
  campaigns: Campaign[];
  brandVoice: BrandVoice;
  videoJobs: VideoJob[];
}
