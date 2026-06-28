import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const generation = await prisma.generation.findUnique({
      where: { id: params.id },
      include: { feedback: true }
    });

    if (!generation) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (generation.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(generation);
  } catch (error) {
    console.error("History detail error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const generation = await prisma.generation.findUnique({
      where: { id: params.id },
    });

    if (!generation) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (generation.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.feedback.deleteMany({
      where: { generationId: params.id }
    });

    await prisma.generation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete generation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
