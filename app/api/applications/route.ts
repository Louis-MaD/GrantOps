import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runMockAIReview } from "@/lib/ai-review";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const riskLevel = searchParams.get("riskLevel");
    const grantProgram = searchParams.get("grantProgram");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (riskLevel && riskLevel !== "all") where.riskLevel = riskLevel;
    if (grantProgram && grantProgram !== "all") where.grantProgram = grantProgram;
    if (search) {
      where.OR = [
        { applicantName: { contains: search } },
        { organizationName: { contains: search } },
        { grantProgram: { contains: search } },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      include: { assignedReviewer: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantName, organizationName, grantProgram, requestedAmount, rawApplicationText } = body;

    const aiResult = runMockAIReview(
      rawApplicationText ?? "",
      applicantName,
      organizationName,
      grantProgram,
      Number(requestedAmount)
    );

    const application = await prisma.application.create({
      data: {
        applicantName,
        organizationName,
        grantProgram,
        requestedAmount: Number(requestedAmount),
        rawApplicationText: rawApplicationText ?? "",
        status: "New",
        riskLevel: aiResult.riskLevel,
        eligibilityScore: aiResult.eligibilityScore,
        riskScore: aiResult.riskScore,
        aiSummary: aiResult.summary,
        extractedFields: JSON.stringify(aiResult.extractedFields),
        missingDocuments: JSON.stringify(aiResult.missingDocuments),
      },
    });

    await prisma.auditLog.createMany({
      data: [
        {
          applicationId: application.id,
          actor: "System",
          action: "Application Submitted",
          details: `New application received for ${grantProgram} — $${Number(requestedAmount).toLocaleString()} requested`,
        },
        {
          applicationId: application.id,
          actor: "AI Engine",
          action: "AI Review Generated",
          details: `Eligibility score: ${aiResult.eligibilityScore} | Risk score: ${aiResult.riskScore} | Risk level: ${aiResult.riskLevel} | Recommended action: ${aiResult.recommendedAction}`,
        },
      ],
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
