import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { uploadFile, uploadImage, uploadAudio } from "@/lib/uploadService";

export async function POST(req: NextRequest, context: any) {
  try {
    const { id, roundId } = context.params;

    // ✅ Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appId = new ObjectId(id);
    const candidateId = new ObjectId(payload.id);

    // ✅ Handle multipart/form-data for file uploads
    const contentType = req.headers.get("content-type") || "";
    let answers: any[] = [];

    if (contentType.includes("multipart/form-data")) {
      console.log("📤 Processing multipart upload");

      try {
        const formData = await req.formData();
        console.log("✅ FormData parsed");

        const answersJson = formData.get("answers") as string;
        answers = JSON.parse(answersJson || "[]");
        console.log("✅ Answers parsed:", answers.length);

        for (const answer of answers) {
          const fileKey = `file_${answer.fieldId}`;
          const file = formData.get(fileKey) as File | null;

          if (file) {
            console.log(`📁 Processing file:`, {
              name: file.name,
              size: file.size,
              type: file.type,
              fieldId: answer.fieldId,
            });

            try {
              console.log("🔄 Converting to buffer...");
              const bytes = await file.arrayBuffer();
              const buffer = Buffer.from(bytes);
              console.log(`✅ Buffer created: ${buffer.length} bytes`);

              console.log("📤 Calling upload function...");
              let uploadResult;

              if (file.type.startsWith("image/")) {
                console.log("📸 Uploading as IMAGE");
                uploadResult = await uploadImage(buffer);
              } else if (file.type.startsWith("audio/")) {
                console.log("🎵 Uploading as AUDIO");
                uploadResult = await uploadAudio(buffer);
              } else {
                console.log("📄 Uploading as FILE");
                uploadResult = await uploadFile(buffer, file.name);
              }

              console.log("✅✅✅ UPLOAD SUCCESS:", uploadResult.secure_url);
              answer.answer = uploadResult.secure_url;
            } catch (uploadError: any) {
              console.error("❌❌❌ UPLOAD ERROR:", {
                message: uploadError.message,
                name: uploadError.name,
                http_code: uploadError.http_code,
                error: uploadError.error,
                stack: uploadError.stack?.substring(0, 500),
              });

              return NextResponse.json(
                {
                  error: "Cloudinary upload failed",
                  message: uploadError.message,
                  file: file.name,
                },
                { status: 500 }
              );
            }
          }
        }

        console.log("✅ All files processed successfully");
      } catch (formError: any) {
        console.error("❌ FormData processing error:", formError);
        return NextResponse.json(
          { error: "FormData processing failed", details: formError.message },
          { status: 400 }
        );
      }
    } else {
      // ✅ JSON body (no files)
      const body = await req.json();
      answers = body.answers || [];
    }

    const db = await connectDB();

    // ✅ Fetch application
    const app = await db.collection("applications").findOne({
      processId: appId,
      candidateId: candidateId,
    });
    if (!app)
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );

    // ✅ Fetch process to get round order
    const process = await db
      .collection("processes")
      .findOne({ _id: app.processId });
    if (!process)
      return NextResponse.json({ error: "Process not found" }, { status: 404 });

    // Check if current round exists
    const roundExists = app.rounds.some((r: any) => r.roundId === roundId);

    if (roundExists) {
      // ✅ Update current round to 'submitted' with answers
      const updateFields: any = { "rounds.$.status": "submitted" };
      if (answers && Array.isArray(answers)) {
        updateFields["rounds.$.answers"] = answers.map((a: any) => ({
          fieldId: new ObjectId(a.fieldId),
          answer: a.answer,
        }));
      }

      await db.collection("applications").updateOne(
        {
          processId: appId,
          candidateId: candidateId,
          "rounds.roundId": roundId,
        },
        { $set: updateFields }
      );
    } else {
      // ✅ Add new round entry if it doesn't exist
      const roundData: any = {
        roundId,
        status: "submitted",
        answers:
          answers?.map((a: any) => ({
            fieldId: new ObjectId(a.fieldId),
            answer: a.answer,
          })) || [],
      };

      await db
        .collection("applications")
        .updateOne(
          { processId: appId, candidateId: candidateId },
          { $push: { rounds: roundData } }
        );
    }

    // Reload updated application
    const updatedApp = await db.collection("applications").findOne({
      processId: appId,
      candidateId: candidateId,
    });
    if (!updatedApp)
      return NextResponse.json(
        { error: "Failed to reload application" },
        { status: 500 }
      );

    // ✅ Map roundId → status
    const roundStatusMap = new Map(
      updatedApp.rounds.map((r: any) => [r.roundId, r.status])
    );

    // ✅ Count submitted rounds
    const submittedRoundsCount = process.rounds.filter(
      (r: any) => roundStatusMap.get(r._id) === "submitted"
    ).length;

    // ✅ If all rounds submitted → mark application completed
    if (submittedRoundsCount === process.rounds.length) {
      await db.collection("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        {
          $set: {
            status: "completed",
            currentRoundIndex: null,
            currentRoundTitle: null,
          },
        }
      );
      return NextResponse.json({ success: true, nextRoundIndex: null });
    }

    // ✅ Find next round in process order
    const nextRoundInProcessOrder = process.rounds.find((r: any) => {
      const status = roundStatusMap.get(r._id);
      return status !== "submitted";
    });

    if (nextRoundInProcessOrder) {
      const nextAppRound = updatedApp.rounds.find(
        (r: any) => r.roundId === nextRoundInProcessOrder._id
      );

      // ✅ Only update to 'in-progress' if not submitted already
      if (
        nextAppRound &&
        nextAppRound.status !== "submitted" &&
        nextAppRound.status !== "in-progress"
      ) {
        await db.collection("applications").updateOne(
          {
            processId: appId,
            candidateId: candidateId,
            "rounds.roundId": nextAppRound.roundId,
          },
          { $set: { "rounds.$.status": "in-progress" } }
        );
      }

      const nextIndex = process.rounds.findIndex(
        (r: any) => r._id === nextRoundInProcessOrder._id
      );

      await db.collection("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        {
          $set: {
            currentRoundIndex: nextIndex,
            currentRoundTitle: nextRoundInProcessOrder.title,
            status:
              updatedApp.status === "applied"
                ? "in-progress"
                : updatedApp.status,
          },
        }
      );

      return NextResponse.json({ success: true, nextRoundIndex: nextIndex });
    }

    // Fallback if next round not found
    return NextResponse.json({ success: true, nextRoundIndex: null });
  } catch (err: any) {
    console.error("❌ Submit round error:", err);
    return NextResponse.json(
      { error: "Failed to submit round", details: err.message },
      { status: 500 }
    );
  }
}

/**
 * Autosave round (keep answers, but not submit)
 */
export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appId = new ObjectId(params.id);
    const candidateId = new ObjectId(payload.id);
    const roundId = params.roundId;

    const body = await req.json();
    const { answers } = body;

    const db = await connectDB();

    // 🔹 Get current application
    const application = await db
      .collection<Application>("applications")
      .findOne({
        processId: appId,
        candidateId,
        "rounds.roundId": roundId,
      });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // 🔹 Find the round
    const round = application.rounds.find((r) => r.roundId === roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    // 🔹 Existing answers
    const existingAnswers = round.answers || [];

    // 🔹 Merge logic (replace if exists, otherwise keep old + add new)
    const mergedAnswers = [
      ...existingAnswers.filter(
        (ea) =>
          !answers.some(
            (na: { fieldId: string }) => na.fieldId === ea.fieldId.toString()
          )
      ),
      ...answers.map((a: { fieldId: string; answer: any }) => ({
        fieldId: new ObjectId(a.fieldId),
        answer: a.answer,
      })),
    ];

    // 🔹 Save merged answers
    const result = await db.collection<Application>("applications").updateOne(
      {
        processId: appId,
        candidateId,
        "rounds.roundId": roundId,
      },
      {
        $set: {
          "rounds.$.answers": mergedAnswers,
          "rounds.$.status": "in-progress",
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Autosave error:", err);
    return NextResponse.json(
      { error: "Failed to autosave answers" },
      { status: 500 }
    );
  }
}
