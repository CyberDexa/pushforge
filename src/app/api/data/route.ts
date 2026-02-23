import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { userData } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const [row] = await db
      .select()
      .from(userData)
      .where(eq(userData.userId, session.user.id));

    return NextResponse.json(row?.data ?? {});
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Load failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const data = await req.json();

    await db
      .insert(userData)
      .values({
        userId: session.user.id,
        data,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userData.userId,
        set: { data, updatedAt: new Date() },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 }
    );
  }
}
