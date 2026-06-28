import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(1),
  prospectProfile: z.object({
    name: z.string(),
    company: z.string(),
    role: z.string(),
    industry: z.string(),
    painPoints: z.string(),
  }),
  objective: z.string(),
  constraints: z.object({
    tone: z.string().optional(),
    length: z.string().optional(),
    doNotMention: z.string().optional(),
  }).optional(),
});

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Templates error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = templateSchema.safeParse(body);
    
    if (!parseResult.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ message: "Invalid input", errors: (parseResult.error as any).errors }, { status: 400 });
    }

    const data = parseResult.data;

    const template = await prisma.template.create({
      data: {
        name: data.name,
        prospectProfile: JSON.stringify(data.prospectProfile),
        objective: data.objective,
        constraints: data.constraints ? JSON.stringify(data.constraints) : null,
        createdBy: session.user.id
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
