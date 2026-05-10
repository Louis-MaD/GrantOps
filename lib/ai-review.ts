export interface AIReviewResult {
  summary: string;
  eligibilityScore: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  missingDocuments: string[];
  extractedFields: Record<string, string>;
  recommendedAction: string;
}

const REQUIRED_DOCS = [
  "IRS 501(c)(3) determination letter",
  "Most recent audited financial statements",
  "Board of directors list",
  "Project budget breakdown",
  "Letters of support",
  "Prior year tax returns (Form 990)",
];

const GRANT_PROGRAM_REQUIREMENTS: Record<string, string[]> = {
  "Community Health Innovation Fund": [
    "Community health needs assessment",
    "Clinical partnership agreements",
    "HIPAA compliance documentation",
  ],
  "Climate Resilience Microgrant": [
    "Environmental impact assessment",
    "Carbon footprint baseline report",
    "Community engagement plan",
  ],
  "STEM Access Fellowship": [
    "Institutional accreditation certificate",
    "Student diversity demographics",
    "Academic partnership MOUs",
  ],
  "Small Business Recovery Grant": [
    "Business license and registration",
    "Proof of revenue loss (12-month comparison)",
    "Employee headcount documentation",
  ],
  "Rural Connectivity Initiative": [
    "FCC broadband mapping data",
    "Municipal partnership letters",
    "Infrastructure deployment timeline",
  ],
};

function extractMentionedDocs(text: string): string[] {
  const mentioned: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("501(c)(3)") || lower.includes("tax exempt")) mentioned.push("IRS 501(c)(3) determination letter");
  if (lower.includes("audit") || lower.includes("financial statement")) mentioned.push("Most recent audited financial statements");
  if (lower.includes("board") || lower.includes("director")) mentioned.push("Board of directors list");
  if (lower.includes("budget") || lower.includes("expenditure")) mentioned.push("Project budget breakdown");
  if (lower.includes("tax return") || lower.includes("form 990")) mentioned.push("Prior year tax returns (Form 990)");
  if (lower.includes("support letter") || lower.includes("letter of support")) mentioned.push("Letters of support");
  return mentioned;
}

function computeWordScore(text: string): number {
  const words = text.trim().split(/\s+/).length;
  if (words < 50) return 30;
  if (words < 150) return 55;
  if (words < 300) return 70;
  if (words < 500) return 82;
  return 90;
}

function extractFields(text: string, applicantName: string, orgName: string, grantProgram: string, amount: number): Record<string, string> {
  const lower = text.toLowerCase();

  const timelineMatch = text.match(/(\d+)\s*(month|year|week)/i);
  const teamMatch = text.match(/(\d+)\s*(staff|employee|team member|person)/i);
  const beneficiaryMatch = text.match(/(\d+[,\d]*)\s*(people|individual|student|resident|household)/i);

  return {
    "Applicant Name": applicantName,
    Organization: orgName,
    "Grant Program": grantProgram,
    "Requested Amount": `$${amount.toLocaleString()}`,
    "Project Timeline": timelineMatch ? `${timelineMatch[1]} ${timelineMatch[2]}s` : "Not specified",
    "Team Size": teamMatch ? `${teamMatch[1]} ${teamMatch[2]}s` : "Not specified",
    "Beneficiaries Served": beneficiaryMatch ? beneficiaryMatch[0] : "Not specified",
    "Geographic Focus": lower.includes("national") ? "National" : lower.includes("state") ? "Statewide" : lower.includes("rural") ? "Rural communities" : lower.includes("urban") ? "Urban areas" : "Local/Regional",
    "Project Category": lower.includes("health") ? "Public Health" : lower.includes("education") || lower.includes("stem") ? "Education" : lower.includes("environment") || lower.includes("climate") ? "Environmental" : lower.includes("business") || lower.includes("economic") ? "Economic Development" : "Community Services",
    "Prior Grant History": lower.includes("previously funded") || lower.includes("prior grant") ? "Yes — prior funding mentioned" : "Not mentioned",
  };
}

function generateSummary(applicantName: string, orgName: string, grantProgram: string, amount: number, eligScore: number, riskScore: number, missingDocs: string[]): string {
  const amountStr = `$${amount.toLocaleString()}`;

  const openings = [
    `${orgName}, led by ${applicantName}, has submitted an application for ${amountStr} under the ${grantProgram} program.`,
    `This application from ${orgName} (contact: ${applicantName}) requests ${amountStr} in funding through the ${grantProgram}.`,
    `${applicantName} of ${orgName} is seeking ${amountStr} in grant support via the ${grantProgram}.`,
  ];

  const opening = openings[Math.floor(eligScore % openings.length)];

  let assessment = "";
  if (eligScore >= 80) {
    assessment = `The application demonstrates strong alignment with program objectives and provides substantive documentation of organizational capacity. Mission fit appears high.`;
  } else if (eligScore >= 60) {
    assessment = `The application shows moderate alignment with program goals. Core eligibility criteria appear to be met, though additional supporting documentation would strengthen the submission.`;
  } else {
    assessment = `The application is incomplete or lacks sufficient detail to fully assess program alignment. Key narrative sections and supporting documents are missing, limiting reviewers' ability to evaluate eligibility.`;
  }

  let riskNote = "";
  if (riskScore >= 75) {
    riskNote = ` Several risk factors have been identified, including ${amount > 200000 ? "the high requested amount relative to typical grant ranges" : "documentation gaps"} and ${missingDocs.length > 2 ? "multiple missing required documents" : "insufficient financial transparency"}. Enhanced due diligence is recommended.`;
  } else if (riskScore >= 45) {
    riskNote = ` Moderate risk indicators are present. The reviewer should verify organizational financial health and confirm the applicant's capacity to manage grant funds at the requested scale.`;
  } else {
    riskNote = ` Risk indicators are within acceptable parameters. The organization appears stable and the requested scope is commensurate with demonstrated capacity.`;
  }

  let action = "";
  if (eligScore >= 75 && riskScore < 50) {
    action = `Recommendation: Advance to full review panel. This application meets threshold criteria and presents a favorable risk profile.`;
  } else if (missingDocs.length > 0) {
    action = `Recommendation: Request additional information. ${missingDocs.length} required document(s) are missing. Applicant should be contacted to submit outstanding materials before review proceeds.`;
  } else {
    action = `Recommendation: Assign to senior reviewer for manual assessment. The application requires human judgment on eligibility questions that cannot be resolved from available materials.`;
  }

  return `${opening} ${assessment}${riskNote} ${action}`;
}

export function runMockAIReview(
  rawText: string,
  applicantName: string,
  orgName: string,
  grantProgram: string,
  requestedAmount: number
): AIReviewResult {
  const wordScore = computeWordScore(rawText);
  const mentionedDocs = extractMentionedDocs(rawText);
  const programDocs = GRANT_PROGRAM_REQUIREMENTS[grantProgram] ?? [];

  const allRequired = [...REQUIRED_DOCS.slice(0, 4), ...programDocs.slice(0, 2)];
  const missingDocs = allRequired.filter(
    (doc) => !mentionedDocs.some((m) => m.toLowerCase().includes(doc.toLowerCase().split(" ")[0]))
  );

  let eligibilityScore = wordScore;
  if (mentionedDocs.length >= 3) eligibilityScore = Math.min(100, eligibilityScore + 8);
  if (rawText.length > 800) eligibilityScore = Math.min(100, eligibilityScore + 5);
  if (missingDocs.length === 0) eligibilityScore = Math.min(100, eligibilityScore + 10);
  eligibilityScore = Math.max(20, Math.min(100, eligibilityScore + Math.floor(Math.random() * 6) - 3));

  let riskScore = 20;
  if (requestedAmount > 500000) riskScore += 30;
  else if (requestedAmount > 200000) riskScore += 18;
  else if (requestedAmount > 100000) riskScore += 10;
  if (missingDocs.length > 3) riskScore += 20;
  else if (missingDocs.length > 1) riskScore += 10;
  if (rawText.length < 100) riskScore += 15;
  riskScore = Math.max(5, Math.min(99, riskScore + Math.floor(Math.random() * 8) - 4));

  const riskLevel: "Low" | "Medium" | "High" =
    riskScore >= 65 ? "High" : riskScore >= 40 ? "Medium" : "Low";

  const extractedFields = extractFields(rawText, applicantName, orgName, grantProgram, requestedAmount);

  let recommendedAction: string;
  if (eligibilityScore >= 75 && riskScore < 50) {
    recommendedAction = "Advance to Review Panel";
  } else if (missingDocs.length > 0) {
    recommendedAction = "Request Additional Documents";
  } else if (riskScore >= 65) {
    recommendedAction = "Escalate for Senior Review";
  } else {
    recommendedAction = "Assign to Reviewer";
  }

  const summary = generateSummary(applicantName, orgName, grantProgram, requestedAmount, eligibilityScore, riskScore, missingDocs);

  return {
    summary,
    eligibilityScore,
    riskScore,
    riskLevel,
    missingDocuments: missingDocs,
    extractedFields,
    recommendedAction,
  };
}
