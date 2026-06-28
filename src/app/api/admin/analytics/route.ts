/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const totalGenerations = await prisma.generation.count();
    
    const feedbackAgg = await prisma.feedback.aggregate({
      _avg: { rating: true }
    });
    const avgRating = feedbackAgg._avg.rating || 0;

    const timeAgg = await prisma.generation.aggregate({
      _avg: { responseTimeMs: true }
    });
    const avgResponseTime = timeAgg._avg.responseTimeMs || 0;

    // Daily trend
    // SQLite doesn't have great date grouping, so we'll fetch feedback with dates and group in JS for this demo
    const allFeedback = await prisma.feedback.findMany({
      select: { createdAt: true, rating: true },
      orderBy: { createdAt: 'asc' }
    });

    const trendMap = new Map<string, { sum: number, count: number }>();
    for (const fb of allFeedback) {
      const dateStr = fb.createdAt.toISOString().split('T')[0];
      const current = trendMap.get(dateStr) || { sum: 0, count: 0 };
      current.sum += fb.rating;
      current.count += 1;
      trendMap.set(dateStr, current);
    }

    const qualityTrend = Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      avgRating: Number((data.sum / data.count).toFixed(2))
    }));

    // Objectives and Industries
    const allGenerations = await prisma.generation.findMany({
      select: { objective: true, prospectProfile: true }
    });

    const objMap = new Map<string, number>();
    const indMap = new Map<string, number>();

    for (const gen of allGenerations) {
      objMap.set(gen.objective, (objMap.get(gen.objective) || 0) + 1);
      
      try {
        const profile = JSON.parse(gen.prospectProfile);
        if (profile.industry) {
          indMap.set(profile.industry, (indMap.get(profile.industry) || 0) + 1);
        }
      } catch (e) {}
    }

    const topObjectives = Array.from(objMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topIndustries = Array.from(indMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalGenerations,
      avgRating: Number(avgRating.toFixed(2)),
      avgResponseTime,
      qualityTrend,
      topObjectives,
      topIndustries
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
