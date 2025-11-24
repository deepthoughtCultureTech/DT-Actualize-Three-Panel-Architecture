import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { ObjectId } from "mongodb";

/**
 * GET - Fetch WhatsApp group link for eligible candidates
 * Only returns the group link
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string; role: string }>(token);

    if (!payload || payload.role !== "candidate") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Optional: Verify candidate has completed all rounds
    const db = await connectDB();
    const candidateId = new ObjectId(payload.id);

    // Check if candidate has any completed applications
    const applications = await db
      .collection("applications")
      .find({ candidateId })
      .toArray();

    // Check if at least one application has all rounds completed
    const hasCompletedProcess = applications.some((app: any) => {
      return app.rounds.every(
        (r: any) => r.status === "submitted" || r.status === "completed"
      );
    });

    if (!hasCompletedProcess) {
      return NextResponse.json(
        { error: "Complete all rounds to access the WhatsApp group" },
        { status: 403 }
      );
    }

    // Fetch WhatsApp group
    const group = await db.collection("whatsapp_group").findOne({});

    if (!group || !group.groupLink) {
      return NextResponse.json(
        { error: "WhatsApp group not configured" },
        { status: 404 }
      );
    }

    // ✅ Return ONLY the group link, NOT admin details
    return NextResponse.json({
      groupLink: group.groupLink,
    });
  } catch (err) {
    console.error("Error fetching WhatsApp group:", err);
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp group" },
      { status: 500 }
    );
  }
}
