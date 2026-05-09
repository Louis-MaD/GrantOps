import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        assignedReviewer: true,
        auditLogs: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedReviewerId, reviewerNotes, actor = "System" } = body;

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const auditEntries: Array<{ action: string; details: string }> = [];

    if (status && status !== existing.status) {
      updateData.status = status;
      auditEntries.push({
        action: "Status Changed",
        details: `Status changed from '${existing.status}' to '${status}'`,
      });

      if (status === "Approved") {
        auditEntries.push({
          action: "Application Approved",
          details: `Application approved by ${actor}`,
        });
      } else if (status === "Rejected") {
        auditEntries.push({
          action: "Application Rejected",
          details: `Application rejected by ${actor}`,
        });
      } else if (status === "Needs Info") {
        auditEntries.push({
          action: "Additional Info Requested",
          details: `Additional information requested by ${actor}`,
        });
      }
    }

    if (assignedReviewerId !== undefined && assignedReviewerId !== existing.assignedReviewerId) {
      updateData.assignedReviewerId = assignedReviewerId;
      if (assignedReviewerId) {
        const reviewer = await prisma.reviewer.findUnique({ where: { id: assignedReviewerId } });
        auditEntries.push({
          action: "Reviewer Assigned",
          details: `Application assigned to ${reviewer?.name ?? "reviewer"} by ${actor}`,
        });
      }
    }

    if (reviewerNotes !== undefined) {
      updateData.reviewerNotes = reviewerNotes;
      auditEntries.push({
        action: "Reviewer Notes Added",
        details: `Reviewer submitted assessment notes`,
      });
    }

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: { assignedReviewer: true },
    });

    if (auditEntries.length > 0) {
      await prisma.auditLog.createMany({
        data: auditEntries.map((entry) => ({
          applicationId: id,
          actor,
          ...entry,
        })),
      });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("PATCH /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
