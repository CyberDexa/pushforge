import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, apiKey } = await req.json();

    if (!to || !subject || !html || !apiKey) {
      return NextResponse.json(
        { error: "Missing to, subject, html, or apiKey" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PushForge <noreply@pushforge.io>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Resend API error: ${err}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, emailId: data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    );
  }
}
