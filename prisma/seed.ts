import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const filePart = rawUrl.startsWith("file:") ? rawUrl.slice(5) : rawUrl;
const absolutePath = path.isAbsolute(filePart) ? filePart : path.join(process.cwd(), filePart);

const adapter = new PrismaBetterSqlite3({ url: absolutePath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.reviewer.deleteMany();

  // Create reviewers
  const reviewers = await Promise.all([
    prisma.reviewer.create({
      data: {
        name: "Sarah Chen",
        email: "sarah.chen@grantops.org",
        role: "Senior Reviewer",
        active: true,
      },
    }),
    prisma.reviewer.create({
      data: {
        name: "Marcus Williams",
        email: "marcus.williams@grantops.org",
        role: "Reviewer",
        active: true,
      },
    }),
    prisma.reviewer.create({
      data: {
        name: "Dr. Priya Nair",
        email: "priya.nair@grantops.org",
        role: "Senior Reviewer",
        active: true,
      },
    }),
    prisma.reviewer.create({
      data: {
        name: "James Okafor",
        email: "james.okafor@grantops.org",
        role: "Analyst",
        active: true,
      },
    }),
    prisma.reviewer.create({
      data: {
        name: "Elena Vasquez",
        email: "elena.vasquez@grantops.org",
        role: "Reviewer",
        active: false,
      },
    }),
  ]);

  console.log(`✅ Created ${reviewers.length} reviewers`);

  const applicationsData = [
    {
      applicantName: "Dr. Amara Osei",
      organizationName: "Brightwater Community Health Center",
      grantProgram: "Community Health Innovation Fund",
      requestedAmount: 287500,
      status: "Approved",
      riskLevel: "Low",
      eligibilityScore: 91,
      riskScore: 18,
      assignedReviewerIdx: 0,
      reviewerNotes: "Exceptional community reach and strong clinical partnerships. Board is experienced and financials are sound. Recommend full approval.",
      rawApplicationText: "Brightwater Community Health Center has served the underinsured population of Riverside County for 14 years. Our proposed telehealth expansion will connect 2,400 patients with remote specialist consultations, reducing ER visits by an estimated 34%. We have a signed MOU with St. Luke's Medical Group, a 501(c)(3) determination letter on file, audited financials for 2022-2024, and a board of 11 directors with combined healthcare administration experience exceeding 80 years. The $287,500 request covers equipment procurement, HIPAA-compliant software licensing, staff training (6 employees), and a 12-month community outreach campaign.",
      aiSummary: "Brightwater Community Health Center, led by Dr. Amara Osei, has submitted an application for $287,500 under the Community Health Innovation Fund program. The application demonstrates strong alignment with program objectives and provides substantive documentation of organizational capacity. Mission fit appears high. Risk indicators are within acceptable parameters. The organization appears stable and the requested scope is commensurate with demonstrated capacity. Recommendation: Advance to full review panel. This application meets threshold criteria and presents a favorable risk profile.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Dr. Amara Osei",
        Organization: "Brightwater Community Health Center",
        "Grant Program": "Community Health Innovation Fund",
        "Requested Amount": "$287,500",
        "Project Timeline": "12 months",
        "Team Size": "6 employees",
        "Beneficiaries Served": "2,400 patients",
        "Geographic Focus": "Local/Regional",
        "Project Category": "Public Health",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Community health needs assessment"]),
    },
    {
      applicantName: "Kenji Matsuda",
      organizationName: "Pacific Rim Climate Solutions",
      grantProgram: "Climate Resilience Microgrant",
      requestedAmount: 48000,
      status: "In Review",
      riskLevel: "Low",
      eligibilityScore: 84,
      riskScore: 22,
      assignedReviewerIdx: 2,
      reviewerNotes: "Strong technical proposal. Awaiting final environmental impact assessment before proceeding.",
      rawApplicationText: "Pacific Rim Climate Solutions is a nonprofit established in 2019 focused on coastal resilience in low-income fishing communities. Our proposal installs 120 solar-powered weather monitoring stations across 15 villages in coastal Oregon, providing real-time storm data to over 8,000 residents. We hold a valid 501(c)(3) determination, have audited statements through FY2024, and maintain a board of directors of 8 members. The $48,000 budget covers hardware ($31,000), installation labor ($9,000), and data platform subscription ($8,000) for a 24-month project.",
      aiSummary: "Pacific Rim Climate Solutions, led by Kenji Matsuda, is seeking $48,000 in grant support via the Climate Resilience Microgrant. The application demonstrates strong alignment with program objectives and provides substantive documentation of organizational capacity. Mission fit appears high. Risk indicators are within acceptable parameters. Recommendation: Advance to full review panel.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Kenji Matsuda",
        Organization: "Pacific Rim Climate Solutions",
        "Grant Program": "Climate Resilience Microgrant",
        "Requested Amount": "$48,000",
        "Project Timeline": "24 months",
        "Team Size": "Not specified",
        "Beneficiaries Served": "8,000 residents",
        "Geographic Focus": "Local/Regional",
        "Project Category": "Environmental",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Environmental impact assessment", "Carbon footprint baseline report"]),
    },
    {
      applicantName: "Fatima Al-Rashid",
      organizationName: "Desert Stars STEM Academy",
      grantProgram: "STEM Access Fellowship",
      requestedAmount: 125000,
      status: "Needs Info",
      riskLevel: "Medium",
      eligibilityScore: 67,
      riskScore: 44,
      assignedReviewerIdx: 1,
      reviewerNotes: "Program curriculum looks strong but we need the institutional accreditation cert and student diversity breakdown before we can move forward.",
      rawApplicationText: "Desert Stars STEM Academy operates after-school coding and engineering programs for Title I middle school students in Tucson, AZ. We serve 340 students annually across 7 partner schools. The fellowship funding will allow us to hire 3 additional instructors and expand to 4 new campuses, reaching an additional 220 students by year two.",
      aiSummary: "This application from Desert Stars STEM Academy (contact: Fatima Al-Rashid) requests $125,000 in funding through the STEM Access Fellowship. The application shows moderate alignment with program goals. Core eligibility criteria appear to be met, though additional supporting documentation would strengthen the submission. Moderate risk indicators are present. The reviewer should verify organizational financial health. Recommendation: Request additional information.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Fatima Al-Rashid",
        Organization: "Desert Stars STEM Academy",
        "Grant Program": "STEM Access Fellowship",
        "Requested Amount": "$125,000",
        "Project Timeline": "2 years",
        "Team Size": "3 additional instructors",
        "Beneficiaries Served": "340 students (220 additional)",
        "Geographic Focus": "Local/Regional",
        "Project Category": "Education",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Institutional accreditation certificate", "Student diversity demographics", "Prior year tax returns (Form 990)"]),
    },
    {
      applicantName: "Roberto Salazar",
      organizationName: "Gulf Coast Artisan Collective",
      grantProgram: "Small Business Recovery Grant",
      requestedAmount: 75000,
      status: "Rejected",
      riskLevel: "High",
      eligibilityScore: 31,
      riskScore: 81,
      assignedReviewerIdx: 0,
      reviewerNotes: "Application is significantly underdetailed. No revenue loss documentation provided. Organization appears to have fewer than 3 full-time employees, which does not meet minimum threshold. Rejected per program guidelines.",
      rawApplicationText: "We are a small artisan collective in New Orleans. We need funding to recover from Hurricane impact on our business.",
      aiSummary: "Roberto Salazar of Gulf Coast Artisan Collective is seeking $75,000 in grant support via the Small Business Recovery Grant. The application is incomplete or lacks sufficient detail to fully assess program alignment. Key narrative sections and supporting documents are missing. Several risk factors have been identified, including documentation gaps and insufficient financial transparency. Enhanced due diligence is recommended. Recommendation: Request Additional Documents.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Roberto Salazar",
        Organization: "Gulf Coast Artisan Collective",
        "Grant Program": "Small Business Recovery Grant",
        "Requested Amount": "$75,000",
        "Project Timeline": "Not specified",
        "Team Size": "Not specified",
        "Beneficiaries Served": "Not specified",
        "Geographic Focus": "Local/Regional",
        "Project Category": "Economic Development",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Business license and registration", "Proof of revenue loss (12-month comparison)", "Employee headcount documentation", "IRS 501(c)(3) determination letter", "Most recent audited financial statements", "Project budget breakdown"]),
    },
    {
      applicantName: "Nadia Okonkwo",
      organizationName: "Heartland Digital Bridge Initiative",
      grantProgram: "Rural Connectivity Initiative",
      requestedAmount: 410000,
      status: "In Review",
      riskLevel: "Medium",
      eligibilityScore: 73,
      riskScore: 51,
      assignedReviewerIdx: 2,
      reviewerNotes: "Large ask but the technical plan is solid. Need to verify municipal partnership letters are properly executed.",
      rawApplicationText: "Heartland Digital Bridge Initiative is a nonprofit technology organization serving rural Kansas counties. Our proposal establishes fiber-optic last-mile connectivity for 1,200 households across 6 townships that currently have no broadband access. We have executed municipal partnership letters with all 6 township governments, FCC broadband mapping data confirming service gaps, and a detailed 18-month infrastructure deployment timeline. Our board of directors includes three former telecommunications engineers. Audited financials and 501(c)(3) documentation are enclosed. The budget covers fiber installation ($310,000), equipment ($60,000), and community education ($40,000).",
      aiSummary: "Nadia Okonkwo of Heartland Digital Bridge Initiative is seeking $410,000 via the Rural Connectivity Initiative. The application demonstrates strong alignment with program objectives. Moderate risk indicators are present given the high requested amount relative to typical grant ranges. The reviewer should verify organizational financial health and confirm the applicant's capacity to manage grant funds at the requested scale. Recommendation: Assign to Reviewer.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Nadia Okonkwo",
        Organization: "Heartland Digital Bridge Initiative",
        "Grant Program": "Rural Connectivity Initiative",
        "Requested Amount": "$410,000",
        "Project Timeline": "18 months",
        "Team Size": "Not specified",
        "Beneficiaries Served": "1,200 households",
        "Geographic Focus": "Rural communities",
        "Project Category": "Community Services",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Community engagement plan"]),
    },
    {
      applicantName: "Thomas Brennan",
      organizationName: "Great Lakes Watershed Alliance",
      grantProgram: "Climate Resilience Microgrant",
      requestedAmount: 62000,
      status: "Approved",
      riskLevel: "Low",
      eligibilityScore: 88,
      riskScore: 14,
      assignedReviewerIdx: 3,
      reviewerNotes: "Clean application, strong track record, excellent community engagement plan. Fast-tracked for approval.",
      rawApplicationText: "Great Lakes Watershed Alliance has protected freshwater ecosystems across Michigan and Wisconsin since 2007. Our proposed shoreline restoration project will plant 15,000 native species along 8 miles of degraded lakefront, sequestering an estimated 240 tons of carbon and reducing phosphorus runoff by 40%. We maintain a 501(c)(3) status, audited financials reviewed by Deloitte, a 15-member board of directors, and partnerships with three state universities. Carbon footprint baseline data is available. Community engagement plan spans 24 months.",
      aiSummary: "Great Lakes Watershed Alliance, led by Thomas Brennan, requests $62,000 under the Climate Resilience Microgrant. The application demonstrates strong alignment with program objectives and provides substantive documentation. Risk indicators are within acceptable parameters. Recommendation: Advance to full review panel.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Thomas Brennan",
        Organization: "Great Lakes Watershed Alliance",
        "Grant Program": "Climate Resilience Microgrant",
        "Requested Amount": "$62,000",
        "Project Timeline": "24 months",
        "Team Size": "Not specified",
        "Beneficiaries Served": "Not specified",
        "Geographic Focus": "Statewide",
        "Project Category": "Environmental",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify([]),
    },
    {
      applicantName: "Ingrid Hoffman",
      organizationName: "Northshore Pediatric Wellness Network",
      grantProgram: "Community Health Innovation Fund",
      requestedAmount: 194000,
      status: "New",
      riskLevel: "Low",
      eligibilityScore: 79,
      riskScore: 27,
      assignedReviewerIdx: null,
      reviewerNotes: null,
      rawApplicationText: "Northshore Pediatric Wellness Network provides integrated mental and physical health services to children ages 4-17 in underserved communities across northern Illinois. We are requesting $194,000 to launch a school-based mental health pilot in 12 elementary schools, employing 4 licensed clinical social workers and implementing trauma-informed care curricula for 3,200 students. Our HIPAA-compliant telehealth platform and clinical partnership agreement with Children's Memorial Hospital are in place. Board of directors includes 9 healthcare professionals. IRS determination letter and 2023 audit are enclosed.",
      aiSummary: "Ingrid Hoffman of Northshore Pediatric Wellness Network is seeking $194,000 via the Community Health Innovation Fund. The application demonstrates strong alignment with program objectives. Risk indicators are within acceptable parameters. Recommendation: Advance to full review panel.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Ingrid Hoffman",
        Organization: "Northshore Pediatric Wellness Network",
        "Grant Program": "Community Health Innovation Fund",
        "Requested Amount": "$194,000",
        "Project Timeline": "Not specified",
        "Team Size": "4 licensed clinical social workers",
        "Beneficiaries Served": "3,200 students",
        "Geographic Focus": "Statewide",
        "Project Category": "Public Health",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Community health needs assessment", "HIPAA compliance documentation"]),
    },
    {
      applicantName: "Darius Kim",
      organizationName: "Silicon Valley Code Corps",
      grantProgram: "STEM Access Fellowship",
      requestedAmount: 220000,
      status: "In Review",
      riskLevel: "Medium",
      eligibilityScore: 71,
      riskScore: 48,
      assignedReviewerIdx: 1,
      reviewerNotes: "Strong program model. Financial runway concerns given recent staff expansion. Need updated 990.",
      rawApplicationText: "Silicon Valley Code Corps trains unemployed and underemployed adults from low-income backgrounds in software engineering fundamentals. Our 16-week intensive bootcamp has placed 847 graduates in tech jobs paying an average of $68,000/year since 2018. The fellowship request of $220,000 funds 40 full scholarships for participants from communities of color, covering tuition, laptops, and a $500/month living stipend for the 4-month program. We hold 501(c)(3) status, have institutional accreditation from ACCET, and maintain a diverse board of 12 directors. Student diversity demographics are available.",
      aiSummary: "Darius Kim of Silicon Valley Code Corps is seeking $220,000 under the STEM Access Fellowship. The application shows moderate alignment with program goals. Moderate risk indicators are present. The reviewer should verify organizational financial health and confirm the applicant's capacity to manage grant funds at the requested scale. Recommendation: Assign to Reviewer.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Darius Kim",
        Organization: "Silicon Valley Code Corps",
        "Grant Program": "STEM Access Fellowship",
        "Requested Amount": "$220,000",
        "Project Timeline": "4 months per cohort",
        "Team Size": "Not specified",
        "Beneficiaries Served": "40 scholarship recipients",
        "Geographic Focus": "Local/Regional",
        "Project Category": "Education",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Prior year tax returns (Form 990)", "Academic partnership MOUs"]),
    },
    {
      applicantName: "Yolanda Pierce",
      organizationName: "Midwest Food Security Coalition",
      grantProgram: "Community Health Innovation Fund",
      requestedAmount: 98500,
      status: "Needs Info",
      riskLevel: "Medium",
      eligibilityScore: 62,
      riskScore: 39,
      assignedReviewerIdx: 3,
      reviewerNotes: "Application addresses food insecurity and chronic disease — borderline for this fund. Need clarification on clinical component.",
      rawApplicationText: "Midwest Food Security Coalition operates 14 community food pantries and a mobile nutrition education program in rural Iowa. We are requesting $98,500 to launch a Medically Tailored Meals program connecting food-insecure patients with diet-specific food boxes prescribed by partnering clinicians. We have a clinical partnership agreement with Iowa Rural Health Partners and a 501(c)(3) determination. Our board of 7 directors includes two registered dietitians. Audit from FY2023 is available.",
      aiSummary: "Yolanda Pierce of Midwest Food Security Coalition is seeking $98,500 via the Community Health Innovation Fund. The application shows moderate alignment with program goals. Core eligibility criteria appear to be met, though additional supporting documentation would strengthen the submission. Moderate risk indicators are present. Recommendation: Request Additional Documents.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Yolanda Pierce",
        Organization: "Midwest Food Security Coalition",
        "Grant Program": "Community Health Innovation Fund",
        "Requested Amount": "$98,500",
        "Project Timeline": "Not specified",
        "Team Size": "Not specified",
        "Beneficiaries Served": "Not specified",
        "Geographic Focus": "Rural communities",
        "Project Category": "Public Health",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Community health needs assessment", "HIPAA compliance documentation", "Project budget breakdown"]),
    },
    {
      applicantName: "Clarence Webb",
      organizationName: "Appalachian Venture Forward",
      grantProgram: "Small Business Recovery Grant",
      requestedAmount: 55000,
      status: "New",
      riskLevel: "Low",
      eligibilityScore: 77,
      riskScore: 28,
      assignedReviewerIdx: null,
      reviewerNotes: null,
      rawApplicationText: "Appalachian Venture Forward is a CDFI-certified community development organization serving small businesses in Eastern Kentucky. We are requesting $55,000 to provide direct recovery grants of $5,000-$10,000 each to 8-11 small businesses that suffered documented revenue losses exceeding 30% due to regional flooding in 2023. We have business license and registration documentation for all applicant businesses, proof of revenue loss via 12-month tax comparison, employee headcount documentation, and our Form 990 on file. Our board of directors has 6 members with combined finance and community development experience.",
      aiSummary: "Clarence Webb of Appalachian Venture Forward is seeking $55,000 via the Small Business Recovery Grant. The application demonstrates strong alignment with program objectives. Risk indicators are within acceptable parameters. Recommendation: Advance to full review panel.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Clarence Webb",
        Organization: "Appalachian Venture Forward",
        "Grant Program": "Small Business Recovery Grant",
        "Requested Amount": "$55,000",
        "Project Timeline": "Not specified",
        "Team Size": "Not specified",
        "Beneficiaries Served": "8-11 small businesses",
        "Geographic Focus": "Local/Regional",
        "Project Category": "Economic Development",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Most recent audited financial statements"]),
    },
    {
      applicantName: "Mei-Ling Torres",
      organizationName: "Southwest Digital Futures",
      grantProgram: "Rural Connectivity Initiative",
      requestedAmount: 670000,
      status: "In Review",
      riskLevel: "High",
      eligibilityScore: 68,
      riskScore: 74,
      assignedReviewerIdx: 0,
      reviewerNotes: "Very large ask. Municipal partnerships confirmed but financial transparency needs improvement. High-risk flag triggered automatically.",
      rawApplicationText: "Southwest Digital Futures proposes to deploy a community mesh network serving 4,200 households across remote Navajo Nation communities in New Mexico and Arizona. The $670,000 request funds satellite backhaul equipment ($420,000), ground installation ($180,000), and a 3-year technical support contract ($70,000). We have executed municipal partnership letters with 3 tribal governments, FCC broadband mapping data, and board support. Infrastructure deployment timeline is 24 months.",
      aiSummary: "Mei-Ling Torres of Southwest Digital Futures is seeking $670,000 via the Rural Connectivity Initiative. The application shows moderate alignment with program goals. Several risk factors have been identified, including the high requested amount relative to typical grant ranges. Enhanced due diligence is recommended. Recommendation: Escalate for Senior Review.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Mei-Ling Torres",
        Organization: "Southwest Digital Futures",
        "Grant Program": "Rural Connectivity Initiative",
        "Requested Amount": "$670,000",
        "Project Timeline": "24 months",
        "Team Size": "Not specified",
        "Beneficiaries Served": "4,200 households",
        "Geographic Focus": "Rural communities",
        "Project Category": "Community Services",
        "Prior Grant History": "Not mentioned",
      }),
      missingDocuments: JSON.stringify(["Community engagement plan", "Most recent audited financial statements", "Prior year tax returns (Form 990)"]),
    },
    {
      applicantName: "Anastasia Volkov",
      organizationName: "Arctic Circle Youth Science Foundation",
      grantProgram: "STEM Access Fellowship",
      requestedAmount: 88000,
      status: "Approved",
      riskLevel: "Low",
      eligibilityScore: 93,
      riskScore: 11,
      assignedReviewerIdx: 2,
      reviewerNotes: "Outstanding application. Clean documentation, deep community ties, verified track record. Unanimous approval.",
      rawApplicationText: "Arctic Circle Youth Science Foundation has operated residential STEM programs for Indigenous youth in Alaska since 2011. Over 1,200 students have participated in our science fellowships, and 74% have pursued post-secondary STEM education. The $88,000 fellowship request funds 22 fully-sponsored residential science camps for Indigenous high school students ages 14-18, including transportation, lodging, meals, and laboratory materials. We hold 501(c)(3) status with a 7-member board, ACCET accreditation, current audited financials, a student diversity demographics report, and academic partnership MOUs with University of Alaska Fairbanks and UAA.",
      aiSummary: "Anastasia Volkov of Arctic Circle Youth Science Foundation is seeking $88,000 under the STEM Access Fellowship. The application demonstrates strong alignment with program objectives and provides substantive documentation of organizational capacity. Mission fit appears high. Risk indicators are within acceptable parameters. Recommendation: Advance to full review panel.",
      extractedFields: JSON.stringify({
        "Applicant Name": "Anastasia Volkov",
        Organization: "Arctic Circle Youth Science Foundation",
        "Grant Program": "STEM Access Fellowship",
        "Requested Amount": "$88,000",
        "Project Timeline": "Not specified",
        "Team Size": "Not specified",
        "Beneficiaries Served": "22 residential science camp cohorts",
        "Geographic Focus": "Statewide",
        "Project Category": "Education",
        "Prior Grant History": "Yes — prior funding mentioned",
      }),
      missingDocuments: JSON.stringify([]),
    },
  ];

  const applications = [];
  for (const appData of applicationsData) {
    const { assignedReviewerIdx, ...rest } = appData;
    const app = await prisma.application.create({
      data: {
        ...rest,
        assignedReviewerId: assignedReviewerIdx !== null ? reviewers[assignedReviewerIdx].id : undefined,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    applications.push(app);
  }

  console.log(`✅ Created ${applications.length} applications`);

  // Create audit logs
  const now = Date.now();

  const auditData = [
    { appIdx: 0, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 28 },
    { appIdx: 0, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 91 | Risk score: 18 | Status: Low Risk", daysAgo: 28 },
    { appIdx: 0, actor: "Sarah Chen", action: "Reviewer Assigned", details: "Application assigned to Sarah Chen (Senior Reviewer)", daysAgo: 27 },
    { appIdx: 0, actor: "Sarah Chen", action: "Status Changed", details: "Status changed from 'New' to 'In Review'", daysAgo: 26 },
    { appIdx: 0, actor: "Sarah Chen", action: "Reviewer Notes Added", details: "Reviewer submitted assessment notes", daysAgo: 24 },
    { appIdx: 0, actor: "Sarah Chen", action: "Application Approved", details: "Application approved by Senior Reviewer. Funding recommendation: $287,500", daysAgo: 22 },
    { appIdx: 1, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 21 },
    { appIdx: 1, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 84 | Risk score: 22 | Status: Low Risk", daysAgo: 21 },
    { appIdx: 1, actor: "Dr. Priya Nair", action: "Reviewer Assigned", details: "Application assigned to Dr. Priya Nair (Senior Reviewer)", daysAgo: 20 },
    { appIdx: 1, actor: "Dr. Priya Nair", action: "Status Changed", details: "Status changed from 'New' to 'In Review'", daysAgo: 19 },
    { appIdx: 1, actor: "System", action: "Missing Document Flagged", details: "Environmental impact assessment not found in submission", daysAgo: 19 },
    { appIdx: 2, actor: "System", action: "Application Submitted", details: "New application received via portal upload", daysAgo: 18 },
    { appIdx: 2, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 67 | Risk score: 44 | Status: Medium Risk", daysAgo: 18 },
    { appIdx: 2, actor: "Marcus Williams", action: "Reviewer Assigned", details: "Application assigned to Marcus Williams (Reviewer)", daysAgo: 17 },
    { appIdx: 2, actor: "Marcus Williams", action: "Status Changed", details: "Status changed from 'New' to 'In Review'", daysAgo: 16 },
    { appIdx: 2, actor: "System", action: "Missing Document Flagged", details: "Institutional accreditation certificate not found; Student diversity demographics missing", daysAgo: 16 },
    { appIdx: 2, actor: "Marcus Williams", action: "Additional Info Requested", details: "Email sent to applicant requesting 3 outstanding documents", daysAgo: 14 },
    { appIdx: 2, actor: "Marcus Williams", action: "Status Changed", details: "Status changed from 'In Review' to 'Needs Info'", daysAgo: 14 },
    { appIdx: 3, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 16 },
    { appIdx: 3, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 31 | Risk score: 81 | Status: High Risk — Escalation recommended", daysAgo: 16 },
    { appIdx: 3, actor: "System", action: "High Risk Alert Triggered", details: "Risk score exceeded threshold (80+). Alert sent to admin team.", daysAgo: 16 },
    { appIdx: 3, actor: "Sarah Chen", action: "Reviewer Assigned", details: "High-risk application escalated to Sarah Chen (Senior Reviewer)", daysAgo: 15 },
    { appIdx: 3, actor: "Sarah Chen", action: "Application Rejected", details: "Application rejected — insufficient documentation, did not meet minimum employee threshold", daysAgo: 13 },
    { appIdx: 4, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 15 },
    { appIdx: 4, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 73 | Risk score: 51 | Status: Medium Risk", daysAgo: 15 },
    { appIdx: 4, actor: "Dr. Priya Nair", action: "Reviewer Assigned", details: "Application assigned to Dr. Priya Nair (Senior Reviewer)", daysAgo: 14 },
    { appIdx: 5, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 12 },
    { appIdx: 5, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 88 | Risk score: 14 | Status: Low Risk", daysAgo: 12 },
    { appIdx: 5, actor: "James Okafor", action: "Reviewer Assigned", details: "Application assigned to James Okafor (Analyst)", daysAgo: 11 },
    { appIdx: 5, actor: "James Okafor", action: "Status Changed", details: "Status changed from 'New' to 'In Review'", daysAgo: 10 },
    { appIdx: 5, actor: "James Okafor", action: "Application Approved", details: "Application approved — clean documentation, strong track record", daysAgo: 8 },
    { appIdx: 6, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 7 },
    { appIdx: 6, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 79 | Risk score: 27 | Status: Low Risk", daysAgo: 7 },
    { appIdx: 7, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 10 },
    { appIdx: 7, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 71 | Risk score: 48 | Status: Medium Risk", daysAgo: 10 },
    { appIdx: 7, actor: "Marcus Williams", action: "Reviewer Assigned", details: "Application assigned to Marcus Williams (Reviewer)", daysAgo: 9 },
    { appIdx: 10, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 5 },
    { appIdx: 10, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 68 | Risk score: 74 | Status: High Risk", daysAgo: 5 },
    { appIdx: 10, actor: "System", action: "High Risk Alert Triggered", details: "Risk score exceeded threshold (70+). Alert sent to admin team.", daysAgo: 5 },
    { appIdx: 10, actor: "Sarah Chen", action: "Reviewer Assigned", details: "High-risk application escalated to Sarah Chen (Senior Reviewer)", daysAgo: 4 },
    { appIdx: 11, actor: "System", action: "Application Submitted", details: "New application received via online intake form", daysAgo: 3 },
    { appIdx: 11, actor: "AI Engine", action: "AI Review Generated", details: "Eligibility score: 93 | Risk score: 11 | Status: Low Risk", daysAgo: 3 },
    { appIdx: 11, actor: "Dr. Priya Nair", action: "Reviewer Assigned", details: "Application assigned to Dr. Priya Nair (Senior Reviewer)", daysAgo: 2 },
    { appIdx: 11, actor: "Dr. Priya Nair", action: "Status Changed", details: "Status changed from 'New' to 'In Review'", daysAgo: 2 },
    { appIdx: 11, actor: "Dr. Priya Nair", action: "Application Approved", details: "Unanimous approval — outstanding application", daysAgo: 1 },
  ];

  for (const log of auditData) {
    await prisma.auditLog.create({
      data: {
        applicationId: applications[log.appIdx].id,
        actor: log.actor,
        action: log.action,
        details: log.details,
        createdAt: new Date(now - log.daysAgo * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 8 * 60 * 60 * 1000)),
      },
    });
  }

  console.log(`✅ Created ${auditData.length} audit logs`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
