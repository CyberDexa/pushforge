import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    const body = await req.text();

    // Verify signature using Stripe's recommended method
    const stripe = await import("stripe").then((m) => m.default);
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "");
    const event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret);

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as { customer_email?: string; customer?: string; subscription?: string };
        if (session.customer_email) {
          await db
            .update(users)
            .set({
              stripeCustomerId: session.customer as string,
              subscriptionStatus: "active",
            })
            .where(eq(users.email, session.customer_email));
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as { customer?: string };
        if (sub.customer) {
          await db
            .update(users)
            .set({ subscriptionStatus: "canceled" })
            .where(eq(users.stripeCustomerId, sub.customer as string));
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as { customer?: string; status?: string };
        if (sub.customer && sub.status) {
          await db
            .update(users)
            .set({ subscriptionStatus: sub.status })
            .where(eq(users.stripeCustomerId, sub.customer as string));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 400 }
    );
  }
}
