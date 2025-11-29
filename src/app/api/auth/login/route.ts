// src/app/api/auth/login/route.ts
import { CandidateService } from "@/lib/candidateService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    const { token } = await CandidateService.login(email, password);

    return NextResponse.json({ token, message: "Login successful!" });
  } catch (err: any) {
    console.error("Login error:", err);

    // ✅ Handle BLOCKED specifically
    if (err.message === "account_blocked") {
      return NextResponse.json(
        {
          error: "account_blocked",
          message: err.details?.message || "Account blocked",
          reason: err.details?.reason,
          blockedUntil: err.details?.blockedUntil,
          timeRemaining: err.details?.timeRemaining,
        },
        { status: 403 }
      );
    }

    // ✅ Invalid credentials (email/password wrong)
    if (err.message === "Invalid credentials") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ All other errors
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
