import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const feedbackSchema = z.object({
  generationId: z.string(),
  rating: z.number().min(1).max(5),
  thumbsUp: z.boolean().optional(),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = feedbackSchema.safeParse(body);
    
    if (!parseResult.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ message: "Invalid input", errors: (parseResult.error as any).errors }, { status: 400 });
    }

    const { generationId, rating, thumbsUp, comment } = parseResult.data;

    // Verify ownership
    const generation = await prisma.generation.findUnique({
      where: { id: generationId }
    });

    if (!generation || generation.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden or Not Found" }, { status: 403 });
    }

    const feedback = await prisma.feedback.upsert({
      where: { generationId },
      update: {
        rating,
        thumbsUp,
        comment
      },
      create: {
        generationId,
        userId: session.user.id,
        rating,
        thumbsUp,
        comment
      }
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
