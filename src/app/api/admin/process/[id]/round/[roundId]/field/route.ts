import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest, { params }: any) {
  try {
    // 🔹 Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id: processId, roundId } = params;
    const db = await connectDB();

    // Fetch process
    const process = await db.collection("processes").findOne({
      _id: new ObjectId(processId),
    });

    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    // Find round manually
    const round = process.rounds.find(
      (r: any) =>
        r._id?.toString() === roundId || r._id?.equals?.(new ObjectId(roundId))
    );

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    // Ensure fields always come back as an array
    const fields = Array.isArray(round.fields) ? round.fields : [];

    return NextResponse.json({
      message: "Fields fetched successfully",
      fields,
    });
  } catch (err) {
    console.error("Error fetching fields:", err);
    return NextResponse.json(
      { error: "Failed to fetch fields" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    // 🔹 Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id: processId, roundId } = await context.params;
    const body = await req.json();

    // ✅ Extract and validate fields
    const { question, description, subType, options } = body;

    // Validation
    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (!subType) {
      return NextResponse.json(
        { error: "Field type is required" },
        { status: 400 }
      );
    }

    // Validate options for choice fields
    if (
      (subType === "singleChoice" || subType === "multipleChoice") &&
      (!options || !Array.isArray(options) || options.length < 2)
    ) {
      return NextResponse.json(
        { error: "At least 2 options are required for choice fields" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // ✅ Create field object
    const field: any = {
      _id: new ObjectId(),
      question: question.trim(),
      subType,
      createdAt: new Date(),
    };

    // ✅ Add description if it has content (handles both string and object)
    if (description) {
      if (typeof description === "string") {
        const stripped = description.replace(/<[^>]*>/g, "").trim();
        if (stripped.length > 0 && description !== "<p></p>") {
          field.description = description;
        }
      } else if (typeof description === "object") {
        // Store Tiptap JSON as-is
        field.description = description;
      }
    }

    // ✅ Add options for choice fields
    if (subType === "singleChoice" || subType === "multipleChoice") {
      field.options = options.filter((opt: string) => opt.trim());
    }

    // 🔹 Push the new field into the correct round
    const result = await db.collection("processes").updateOne(
      {
        _id: new ObjectId(processId),
        "rounds._id": new ObjectId(roundId).toString(),
      },
      { $push: { "rounds.$.fields": field } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Round not found or field not added" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Field added successfully",
      field,
    });
  } catch (err) {
    console.error("Error adding field:", err);
    return NextResponse.json({ error: "Failed to add field" }, { status: 500 });
  }
}
