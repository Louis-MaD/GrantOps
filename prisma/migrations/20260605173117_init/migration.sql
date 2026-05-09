-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantName" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "grantProgram" TEXT NOT NULL,
    "requestedAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "riskLevel" TEXT NOT NULL DEFAULT 'Low',
    "eligibilityScore" INTEGER,
    "riskScore" INTEGER,
    "aiSummary" TEXT,
    "rawApplicationText" TEXT,
    "extractedFields" TEXT,
    "missingDocuments" TEXT,
    "reviewerNotes" TEXT,
    "assignedReviewerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "Reviewer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reviewer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Reviewer',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Reviewer_email_key" ON "Reviewer"("email");
