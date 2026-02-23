import type { Platform, Product, BrandVoice } from "./types";

const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  twitter:
    "Write a Twitter/X post. Max 280 characters. Use hashtags sparingly (1-2 max). Be punchy, direct, and scroll-stopping. No emojis overload.",
  linkedin:
    "Write a LinkedIn post. 150-300 words. Professional but not boring. Start with a hook. Use line breaks for readability. End with a call to action.",
  email_subject:
    "Write an email subject line. Max 60 characters. Create curiosity or urgency. No clickbait.",
  email_body:
    "Write an email body. 100-200 words. Conversational tone. One clear CTA. Personalize with {{name}} placeholder.",
  whatsapp:
    "Write a WhatsApp message. Keep it casual, friendly, under 100 words. Like you're telling a friend about something cool. Include the link naturally.",
  video_script:
    "Write a 60-second video script. Format: [SCENE DESCRIPTION] followed by narration text. Include intro hook (5 sec), problem (10 sec), solution (20 sec), demo highlights (15 sec), CTA (10 sec).",
  instagram:
    "Write an Instagram caption. 100-200 words. Start with a hook. Use line breaks. Include 5-8 relevant hashtags at the end. Include a CTA.",
};

const TONE_MAP: Record<string, string> = {
  professional: "Professional, authoritative, and trustworthy. Data-driven when possible.",
  casual: "Casual, approachable, and conversational. Like talking to a smart friend.",
  urgent: "Urgent and action-oriented. Create FOMO. Time-sensitive language.",
  witty: "Witty, clever, and memorable. Use wordplay or unexpected angles. Not forced humor.",
  storytelling: "Story-driven. Start with a relatable situation. Paint a before/after picture.",
};

function buildBrandVoiceSection(brandVoice?: BrandVoice): string {
  if (!brandVoice || (!brandVoice.personality && brandVoice.writingSamples.length === 0)) {
    return "";
  }

  const parts: string[] = ["\nBRAND VOICE GUIDELINES:"];

  if (brandVoice.companyName) {
    parts.push(`Brand: ${brandVoice.companyName}`);
  }
  if (brandVoice.personality) {
    parts.push(`Personality: ${brandVoice.personality}`);
  }
  if (brandVoice.writingSamples.length > 0) {
    parts.push("Writing Style Examples (match this tone/style):");
    brandVoice.writingSamples.slice(0, 3).forEach((s, i) => {
      parts.push(`  ${i + 1}. "${s.slice(0, 200)}"`);
    });
  }
  if (brandVoice.doNot.length > 0) {
    parts.push(`NEVER: ${brandVoice.doNot.join(", ")}`);
  }
  if (brandVoice.includeAlways.length > 0) {
    parts.push(`ALWAYS INCLUDE: ${brandVoice.includeAlways.join(", ")}`);
  }

  return parts.join("\n");
}

function buildPrompt(
  product: Product,
  platform: Platform,
  tone: string,
  angle: string,
  customPrompt?: string,
  brandVoice?: BrandVoice
): string {
  const audienceMap = {
    b2b: "businesses and professionals",
    b2c: "individual consumers",
    both: "both businesses and individual consumers",
  };

  return `You are a world-class marketing copywriter. Generate marketing content for the following product.

PRODUCT: ${product.name}
DESCRIPTION: ${product.description}
KEY FEATURES: ${product.keyFeatures.join(", ")}
TARGET AUDIENCE: ${audienceMap[product.targetAudience]}
${product.website ? `WEBSITE: ${product.website}` : ""}

PLATFORM: ${platform}
${PLATFORM_INSTRUCTIONS[platform]}

TONE: ${TONE_MAP[tone] || tone}

ANGLE/FOCUS: ${angle || "General product promotion"}
${buildBrandVoiceSection(brandVoice)}
${customPrompt ? `ADDITIONAL INSTRUCTIONS: ${customPrompt}` : ""}

RULES:
- Write ONLY the content. No explanations, no "Here's a..." preamble.
- Make it feel human-written, not AI-generated.
- Focus on benefits, not features.
- Be specific, not generic.
- If the platform is email_subject, output ONLY the subject line.

OUTPUT:`;
}

export async function generateContent(
  product: Product,
  platforms: Platform[],
  tone: string,
  angle: string,
  apiKey: string,
  provider: "openai" | "anthropic",
  customPrompt?: string,
  brandVoice?: BrandVoice
): Promise<Record<Platform, string>> {
  const results: Record<string, string> = {};

  for (const platform of platforms) {
    const prompt = buildPrompt(product, platform, tone, angle, customPrompt, brandVoice);

    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error: ${err}`);
      }

      const data = await response.json();
      results[platform] = data.choices?.[0]?.message?.content?.trim() || "";
    } else {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic API error: ${err}`);
      }

      const data = await response.json();
      results[platform] =
        data.content?.[0]?.text?.trim() || "";
    }
  }

  return results as Record<Platform, string>;
}

export function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    twitter: "Twitter / X",
    linkedin: "LinkedIn",
    email_subject: "Email Subject",
    email_body: "Email Body",
    whatsapp: "WhatsApp",
    video_script: "Video Script",
    instagram: "Instagram",
  };
  return labels[platform];
}

export function getPlatformEmoji(platform: Platform): string {
  const emojis: Record<Platform, string> = {
    twitter: "𝕏",
    linkedin: "in",
    email_subject: "✉",
    email_body: "📧",
    whatsapp: "💬",
    video_script: "🎬",
    instagram: "📸",
  };
  return emojis[platform];
}
