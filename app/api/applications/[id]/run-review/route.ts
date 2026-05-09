import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runMockAIReview } from "@/lib/ai-review";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const aiResult = runMockAIReview(
      application.rawApplicationText ?? "",
      application.applicantName,
      application.organizationName,
      application.grantProgram,
      application.requestedAmount
    );

    const updated = await prisma.application.update({
      where: { id },
      data: {
        riskLevel: aiResult.riskLevel,
        eligibilityScore: aiResult.eligibilityScore,
        riskScore: aiResult.riskScore,
        aiSummary: aiResult.summary,
        extractedFields: JSON.stringify(aiResult.extractedFields),
        missingDocuments: JSON.stringify(aiResult.missingDocuments),
      },
      include: { assignedReviewer: true },
    });

    await prisma.auditLog.create({
      data: {
        applicationId: id,
        actor: "AI Engine",
        action: "AI Review Re-generated",
        details: `Eligibility score: ${aiResult.eligibilityScore} | Risk score: ${aiResult.riskScore} | Recommended: ${aiResult.recommendedAction}`,
      },
    });

    return NextResponse.json({ application: updated, aiResult });
  } catch (error) {
    console.error("POST /api/applications/[id]/run-review error:", error);
    return NextResponse.json({ error: "Failed to run AI review" }, { status: 500 });
  }
}
