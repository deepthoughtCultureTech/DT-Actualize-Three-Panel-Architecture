import { NextRequest, NextResponse } from "next/server";
import { CandidateService } from "@/lib/candidateService";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // ✅ reuse service instead of duplicating logic
    const { token, candidateId } = await CandidateService.login(
      email,
      password
    );

    return NextResponse.json({ token, candidateId });
  } catch (err: any) {
    console.error("Login error:", err.message);

    // ✅ Check if it's a block error and return full details
    if (err.code === "ACCOUNT_BLOCKED") {
      try {
        const db = await connectDB();
        const whatsappGroup = await db.collection("whatsapp_group").findOne({});
        const adminContacts = whatsappGroup?.admins || [];
        return NextResponse.json(
          {
            error: "account_blocked",
            message: err.details.message,
            reason: err.details.reason,
            blockedUntil: err.details.blockedUntil,
            timeRemaining: err.details.timeRemaining,
            adminContacts,
          },
          { status: 403 }
        );
      } catch (err: any) {
        console.error("Failed to fetch admin contacts:", err);
        return NextResponse.json(
          {
            error: "account_blocked",
            message: err.details.message,
            reason: err.details.reason,
            blockedUntil: err.details.blockedUntil,
            timeRemaining: err.details.timeRemaining,
            adminContacts: [],
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
