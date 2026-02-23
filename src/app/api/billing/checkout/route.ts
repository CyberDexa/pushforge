import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    // Get authenticated user's email for pre-filling checkout
    const session = await auth();
    const customerEmail = session?.user?.email;

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", `${origin}?billing=success`);
    params.append("cancel_url", `${origin}?billing=cancel`);
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    if (customerEmail) {
      params.append("customer_email", customerEmail);
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error?.message || "Stripe API error" },
        { status: response.status }
      );
    }

    const checkoutSession = await response.json();
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
