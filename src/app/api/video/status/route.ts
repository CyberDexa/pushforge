import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const talkId = req.nextUrl.searchParams.get("talkId");
    const apiKey = req.nextUrl.searchParams.get("apiKey");

    if (!talkId || !apiKey) {
      return NextResponse.json(
        { error: "Missing talkId or apiKey" },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.d-id.com/talks/${encodeURIComponent(talkId)}`, {
      headers: {
        Authorization: `Basic ${apiKey}`,
      },
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
      status: data.status,
      resultUrl: data.result_url || null,
      error: data.error?.description || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status check failed" },
      { status: 500 }
    );
  }
}
