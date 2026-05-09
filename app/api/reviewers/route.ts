import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviewers = await prisma.reviewer.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { applications: true } },
      },
    });
    return NextResponse.json(reviewers);
  } catch (error) {
    console.error("GET /api/reviewers error:", error);
    return NextResponse.json({ error: "Failed to fetch reviewers" }, { status: 500 });
  }
}
