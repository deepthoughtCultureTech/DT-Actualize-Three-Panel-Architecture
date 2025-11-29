import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<>
) {
  try {
    // ✅ Await params
    const { id } = await params; // ✅ NEW LINE

    // ✅ Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Not an admin" },
        { status: 403 }
      );
    }

    // ✅ Parse request body
    const { title } = await req.json();
    const db = await connectDB();
    const processId = new ObjectId(id); // ✅ Use awaited id

    // ✅ Fetch original process (with all fields)
    const original = await db
      .collection("processes")
      .findOne({ _id: processId });

    if (!original) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    // ✅ Create clone with new ID + draft status
    const clonedProcess = {
      ...original, // Copy ALL fields (questions, stages, etc.)
      _id: new ObjectId(), // ✅ New unique ID
      title: title || `${original.title} (Copy)`, // ✅ New title
      status: "draft", // ✅ Always draft
      clonedFrom: processId, // ✅ Track origin
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ✅ Insert clone
    const result = await db.collection("processes").insertOne(clonedProcess);

    if (!result.acknowledged) {
      throw new Error("Failed to insert cloned process");
    }

    return NextResponse.json({
      success: true,
      title: clonedProcess.title,
      id: clonedProcess._id.toString(),
      message: "Process cloned successfully",
    });
  } catch (err: any) {
    console.error("Clone process error:", err);
    return NextResponse.json(
      { error: "Failed to clone process" },
      { status: 500 }
    );
  }
}
