import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const generations = await prisma.generation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        prospectProfile: true,
        objective: true,
        createdAt: true,
      }
    });

    const total = await prisma.generation.count({ where: whereClause });

    return NextResponse.json({
      generations,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
