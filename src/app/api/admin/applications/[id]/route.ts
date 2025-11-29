import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";

/**
 * Get single application details
 */
export async function GET(req: NextRequest, { params }: any) {
  try {
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

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    const application = await db
      .collection("applications")
      .aggregate([
        { $match: { _id: applicationId } },
        {
          $lookup: {
            from: "candidates",
            localField: "candidateId",
            foreignField: "_id",
            as: "candidate",
          },
        },
        {
          $lookup: {
            from: "processes",
            localField: "processId",
            foreignField: "_id",
            as: "process",
          },
        },
        { $unwind: "$candidate" },
        { $unwind: "$process" },
      ])
      .toArray();

    if (!application || application.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application[0]);
  } catch (err) {
    console.error("Error fetching application:", err);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

/**
 * Update application - Block candidate, unblock, or change status
 */
export async function PATCH(req: NextRequest, { params }: any) {
  try {
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

    const body = await req.json();
    const { action, status, reason, blockDurationHours = 24 } = body;

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    // ✅ BLOCK CANDIDATE ACTION - FIXED
    if (action === "blockCandidate") {
      const application = await db
        .collection("applications")
        .findOne({ _id: applicationId });

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      const currentRoundIndex = application.currentRoundIndex;

      // Clear timeline for current round only
      const updatedRounds = application.rounds.map(
        (round: any, index: number) => {
          if (index === currentRoundIndex) {
            return {
              ...round,
              timeline: null,
              timelineDate: null,
            };
          }
          return round;
        }
      );

      const now = new Date();
      const blockedUntil = new Date(
        now.getTime() + blockDurationHours * 60 * 60 * 1000
      );

      // ✅ FIXED: Block CANDIDATE with isBlocked: true
      await db.collection("candidates").updateOne(
        { _id: application.candidateId },
        {
          $set: {
            isBlocked: true, // ✅ CRITICAL: Blocks login
            blockedUntil: blockedUntil,
            blockedReason: reason || "Missed self-defined timeline deadline",
            blockedBy: decoded.id,
            blockedAt: now,
            updatedAt: now,
          },
        }
      );

      // Update APPLICATION
      await db.collection("applications").updateOne(
        { _id: applicationId },
        {
          $set: {
            status: "blocked",
            blockedUntil: blockedUntil,
            blockReason: reason || "Missed self-defined timeline deadline",
            blockedBy: decoded.id,
            blockedAt: now,
            rounds: updatedRounds,
            updatedAt: now,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: `Candidate blocked until ${blockedUntil.toISOString()}`,
        blockedUntil: blockedUntil.toISOString(),
        blockDurationHours,
      });
    }

    // ✅ UNBLOCK CANDIDATE ACTION - FIXED
    if (action === "unblockCandidate") {
      const application = await db
        .collection("applications")
        .findOne({ _id: applicationId });

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      // ✅ FIXED: Unblock CANDIDATE
      await db.collection("candidates").updateOne(
        { _id: application.candidateId },
        {
          $set: {
            isBlocked: false, // ✅ CRITICAL: Allows login
            blockedUntil: null,
            blockedReason: null,
            blockedBy: null,
            blockedAt: null,
            updatedAt: new Date(),
          },
        }
      );

      // Update APPLICATION
      await db.collection("applications").updateOne(
        { _id: applicationId },
        {
          $set: {
            status: "in-progress",
            blockedUntil: null,
            blockReason: null,
            blockedBy: null,
            blockedAt: null,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Candidate unblocked successfully. Must set new timeline.",
      });
    }

    // ✅ UPDATE STATUS ACTION
    if (status) {
      const validStatuses = [
        "applied",
        "in-progress",
        "completed",
        "expired",
        "rejected",
        "blocked",
      ];

      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      await db.collection("applications").updateOne(
        { _id: applicationId },
        {
          $set: {
            status: status,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Application status updated",
      });
    }

    return NextResponse.json(
      { error: "No valid action provided" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Error updating application:", err);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

/**
 * Delete/Archive application
 */
export async function DELETE(req: NextRequest, { params }: any) {
  try {
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

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    // Archive before deleting
    const application = await db
      .collection("applications")
      .findOne({ _id: applicationId });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Archive
    await db.collection("archived_applications").insertOne({
      ...application,
      archivedAt: new Date(),
      archivedBy: new ObjectId(decoded.id),
      archivedReason: "admin_removal",
    });

    // Delete
    await db.collection("applications").deleteOne({ _id: applicationId });

    return NextResponse.json({
      success: true,
      message: "Application archived and removed successfully",
    });
  } catch (err) {
    console.error("Error deleting application:", err);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
