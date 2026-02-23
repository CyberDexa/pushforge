import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, accessToken } = await req.json();

    if (!text || !accessToken) {
      return NextResponse.json(
        { error: "Missing text or accessToken" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Twitter API error: ${err}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, tweetId: data.data?.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to post" },
      { status: 500 }
    );
  }
}
