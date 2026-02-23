import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { scriptText, voiceId, sourceUrl, apiKey } = await req.json();

    if (!scriptText || !apiKey) {
      return NextResponse.json(
        { error: "Missing script text or API key" },
        { status: 400 }
      );
    }

    // D-ID create talk endpoint — creates a talking head video from text
    const dIdSource = sourceUrl || "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg";

    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        source_url: dIdSource,
        script: {
          type: "text",
          input: scriptText,
          provider: {
            type: "microsoft",
            voice_id: voiceId || "en-US-JennyNeural",
          },
        },
        config: {
          stitch: true,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `D-ID error: ${err}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      talkId: data.id,
      status: data.status || "created",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video creation failed" },
      { status: 500 }
    );
  }
}
