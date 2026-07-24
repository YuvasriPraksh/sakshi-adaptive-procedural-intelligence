import type {
  AISummary, RiskReport, ReadinessReport,
  MissingProcedure, AIRecommendation, AppNotification,
} from "@/types/ai.types";

// ─── Suggested prompts ────────────────────────────────────────────────────────
export const SUGGESTED_PROMPTS = [
  { icon: "📋", text: "Summarize the current case status", category: "summary"   },
  { icon: "🔍", text: "What is the next required investigation step?", category: "procedure" },
  { icon: "⚠️",  text: "Show all missing procedures and documents", category: "missing" },
  { icon: "⏰", text: "Why is this case delayed?", category: "delay"     },
  { icon: "📄", text: "Which documents are still required?", category: "documents" },
  { icon: "💡", text: "Give AI recommendations for this case", category: "recommend" },
  { icon: "🎯", text: "What is the overall risk level?", category: "risk"      },
  { icon: "✅", text: "Check investigation readiness for court", category: "readiness" },
  { icon: "👤", text: "Who should handle the next step?", category: "assign"    },
  { icon: "📊", text: "Show case analytics and timeline gaps", category: "analytics" },
];

// ─── Mock AI responses keyed by keyword ──────────────────────────────────────
export const AI_RESPONSES: Record<string, string> = {
  summarize: `**Case Summary — SAKSHI/2024/001842**

The case involves a 12-year-old female victim (VIC-DL-2024-842) from South Delhi. The investigation is currently at Stage 4 — **Medical Examination**, with 3 of 9 stages completed.

**Current Status:** In Progress  
**Priority:** Critical  
**Assigned Officer:** SI Rajan Kumar, South Delhi PS

**Completed Stages:**
- ✅ Complaint Registered (Jan 15, 2024)
- ✅ FIR Registered — FIR/DL/2024/00892 (Jan 16, 2024)
- ✅ Victim Statement recorded under Sec 164 CrPC (Jan 18, 2024)

**Pending:** Medical Examination report awaited from AIIMS. FSL coordination not yet initiated.

**Risk Level:** HIGH — Victim is a minor under 14 years. CWC has been notified and shelter care is in place.`,

  "next step": `**Next Required Investigation Step**

Based on the current workflow stage, the next required action is:

**Stage 4: Medical Examination** *(Currently Active)*

**Mandatory Requirements:**
1. Medical examination must be conducted by an authorized doctor under POCSO Sec 27
2. Examination report must be prepared in the prescribed format
3. Consent of the victim/guardian must be documented
4. Blood/DNA samples must be collected and sealed for FSL
5. Report must be submitted within 72 hours of FIR registration

**Responsible:** Dr. Priya Singh, AIIMS Delhi (Medical Officer)  
**Deadline:** 48 hours from now (BREACHED — 3 days overdue)

⚠️ **URGENT:** This stage is overdue by 3 days. Escalation to Supervising Officer recommended.`,

  missing: `**Missing Procedures & Documents Detected**

The AI analysis has identified **4 critical gaps** in the investigation:

**Missing Procedures:**
1. 🔴 **Medical Examination** — Overdue by 3 days (CRITICAL)
2. 🟠 **FSL Sample Submission** — Not yet initiated (HIGH)
3. 🟡 **CWC Counseling Session Record** — Pending documentation (MEDIUM)

**Missing Documents:**
1. 🔴 **Medical Examination Report** — Required for court admissibility
2. 🟠 **FSL Evidence Receipt** — Required before forensic analysis
3. 🟡 **Victim Support Person Consent Form** — Required under POCSO rules

**Action Required:** Contact Dr. Priya Singh (AIIMS) immediately to schedule the medical examination.`,

  delay: `**Case Delay Analysis**

This case is currently **3 days behind schedule**. Root cause analysis:

**Primary Delay Reasons:**
1. **Medical Officer Unavailability** — Dr. Priya Singh was on leave from Jan 18–20. No backup doctor was assigned.
2. **Communication Gap** — Police station did not coordinate with hospital within the mandatory 24-hour window.
3. **Documentation Pending** — Victim guardian contact form not completed by field officer.

**Impact Assessment:**
- Medical evidence quality may be compromised (biological evidence degrades over time)
- Violation of POCSO mandatory timeline guidelines
- Risk of case weakening at judicial stage

**Recommended Actions:**
1. Immediately schedule medical examination with available POCSO-trained doctor
2. Document delay reasons in the official case file
3. Notify supervising officer DSP Kumar Rao
4. Initiate disciplinary record for procedural lapse`,

  documents: `**Required Documents Checklist**

Here is the complete document requirement status for this case:

| Document | Status | Urgency |
|----------|--------|---------|
| FIR Copy | ✅ Uploaded | — |
| Victim Statement (Sec 164) | ✅ Uploaded | — |
| Medical Examination Report | ❌ Missing | 🔴 Critical |
| FSL Evidence Receipt | ❌ Missing | 🟠 High |
| DNA Sample Custody Record | ❌ Missing | 🔴 Critical |
| CWC Referral Letter | ✅ Uploaded | — |
| Witness Statement 1 | ❌ Pending | 🟡 Medium |
| Charge Sheet (Challan) | ❌ Not Started | ⬜ Pending |

**Total: 3 of 8 documents complete (37.5%)**

Upload the Medical Examination Report immediately to unblock the investigation workflow.`,

  recommendations: `**AI Recommendations for This Case**

Based on procedural analysis and case data, here are the top recommendations:

**🔴 Critical (Immediate Action Required):**
1. **Schedule Medical Examination** — Contact AIIMS Duty Officer: 011-26588500. Request emergency POCSO examination slot.
2. **Collect DNA/Biological Evidence** — Initiate FSL coordination within next 6 hours to prevent evidence degradation.

**🟠 High Priority:**
3. **Update CWC on Case Progress** — CWC Officer Adv. Sunita Rao requires a case update within 24 hours per protocol.
4. **Record Witness Statements** — 2 potential witnesses identified at incident location. Field visit required.

**🟡 Medium Priority:**
5. **Digital Evidence Preservation** — CCTV footage from Lajpat Nagar Metro station may contain relevant footage. Preservation request must be sent within 7 days.

**Compliance Note:** Failure to complete Stage 4 within mandated timeframe constitutes a procedural lapse under POCSO Act monitoring guidelines.`,

  risk: `**Risk Assessment Report**

**Overall Risk Level: 🔴 HIGH (Score: 78/100)**

**Risk Breakdown:**

| Factor | Impact | Score |
|--------|--------|-------|
| Victim Age (12 years) | Critical | +25 |
| Evidence Freshness | High | +20 |
| Medical Delay (3 days) | High | +18 |
| Procedural Compliance | Medium | +15 |
| Officer Workload | Low | +8 |

**Key Risk Indicators:**
- ⚠️ Victim under 14 — higher evidentiary standards required
- ⚠️ Biological evidence degradation window closing rapidly
- ⚠️ 3 mandatory procedures overdue
- ✅ Victim in safe custody (CWC shelter home)
- ✅ Primary suspect identified and FIR filed

**Recommendation:** Immediate intervention required. Escalate to District Supervisor.`,

  readiness: `**Court Readiness Assessment**

**Overall Readiness: 44% — NOT READY FOR COURT SUBMISSION**

**Completed Requirements (4/9):**
- ✅ FIR filed and registered
- ✅ Victim statement under Sec 164 CrPC
- ✅ Accused identified and FIR registered
- ✅ Victim in protective custody

**Pending Requirements (5/9):**
- ❌ Medical examination report (CRITICAL)
- ❌ FSL forensic analysis (HIGH)
- ❌ Witness statements (HIGH)
- ❌ Digital/physical evidence list (MEDIUM)
- ❌ Charge sheet preparation (PENDING)

**Estimated Completion:** 18–22 days if all critical tasks completed immediately.

To improve readiness, prioritize medical examination and FSL coordination this week.`,

  assign: `**Officer Assignment Analysis**

Based on current workload and case requirements, here are the recommendations:

**Current Assigned Officer:**
- SI Rajan Kumar — 8 active cases (HIGH LOAD)

**Recommended for Reassignment/Support:**
1. **SI Priya Sharma** — 6 active cases, POCSO-trained, available for medical coordination
2. **DSP Kumar Rao** — Supervisor available for escalation handling

**For Medical Examination Coordination:**
- Contact Dr. Priya Singh (AIIMS) — POCSO-designated medical officer
- Backup: Dr. Ritu Verma, Safdarjung Hospital — POCSO trained, available today

**Recommendation:** Assign SI Priya Sharma as co-investigator for Stage 4 (Medical) and Stage 5 (Evidence Collection) to reduce bottleneck risk.`,

  analytics: `**Case Analytics & Timeline Gap Analysis**

**Timeline Performance:**

| Stage | Expected | Actual | Variance |
|-------|----------|--------|----------|
| Complaint Registration | Day 0 | Day 0 | ✅ On time |
| FIR Registration | Day 1 | Day 1 | ✅ On time |
| Victim Statement | Day 2 | Day 3 | ⚠️ +1 day |
| Medical Examination | Day 3 | Day 6 | 🔴 +3 days |
| Evidence Collection | Day 4 | Pending | — |

**SLA Compliance:** 55% (Target: 90%)

**Bottleneck Identified:** Medical examination coordination gap between Police Station and Hospital. Recommend automated notification system between agencies.

**Projected Case Completion:** March 15, 2024 (if delays resolved immediately)`,

  default: `**SAKSHI AI Assistant**

I'm here to help with your POCSO investigation procedures. I can assist with:

- 📋 **Case summaries** and status reports
- 🔍 **Procedural guidance** based on POCSO Act 2012
- ⚠️ **Missing procedure detection** and alerts
- 💡 **AI recommendations** for next steps
- 📊 **Risk assessment** and readiness analysis
- 📄 **Document checklist** management

Please ask a specific question about your case, or select one of the suggested prompts above to get started.`,
};

// ─── Case AI Summary ─────────────────────────────────────────────────────────
export const CASE_AI_SUMMARIES: AISummary[] = [
  {
    caseId: "c1", caseNumber: "SAKSHI/2024/001842",
    summary: "Critical POCSO case involving a 12-year-old female victim from South Delhi. Investigation is at Stage 4 (Medical Examination) with a 3-day delay. Immediate medical examination coordination is required to prevent evidence degradation.",
    currentStage: "Medical Examination",
    investigationStatus: "delayed",
    pendingTasks: ["Complete medical examination", "Initiate FSL coordination", "Record CWC counseling session", "Submit medical report to court"],
    missingDocuments: ["Medical Examination Report", "FSL Evidence Receipt", "DNA Sample Custody Record", "Witness Statement 1"],
    delayReasons: ["Medical officer unavailability (3 days)", "Coordination gap between PS and hospital", "Guardian contact form incomplete"],
    suggestedNextStep: "Immediately contact AIIMS Duty Officer (011-26588500) to schedule POCSO medical examination. Escalate to DSP Kumar Rao if not resolved within 6 hours.",
    generatedAt: new Date().toISOString(),
  },
  {
    caseId: "c2", caseNumber: "SAKSHI/2024/001841",
    summary: "Child abuse case with a 9-year-old male victim from East Mumbai. Case is at Stage 3 (Victim Statement) with pending CWC coordination. Victim is currently in shelter home custody.",
    currentStage: "Victim Statement",
    investigationStatus: "on_track",
    pendingTasks: ["Record victim statement under Sec 164", "CWC counseling session", "Medical examination scheduling"],
    missingDocuments: ["Victim Statement Recording", "CWC Referral Acknowledgment"],
    delayReasons: ["Victim cooperation challenges", "Support person availability"],
    suggestedNextStep: "Coordinate with CWC Officer to arrange support person for victim statement recording under Sec 164 CrPC.",
    generatedAt: new Date().toISOString(),
  },
];

// ─── Risk Reports ─────────────────────────────────────────────────────────────
export const RISK_REPORTS: RiskReport[] = [
  {
    caseId: "c1", riskLevel: "high", riskScore: 78,
    riskFactors: [
      { id:"r1", factor:"Victim Age", impact:"high", description:"Victim is 12 years old — higher evidentiary standards and mandatory CWC involvement required under POCSO Sec 26" },
      { id:"r2", factor:"Medical Delay", impact:"high", description:"Medical examination overdue by 3 days — biological evidence quality deteriorating rapidly" },
      { id:"r3", factor:"Procedural Non-Compliance", impact:"medium", description:"3 mandatory POCSO timelines breached — risk of judicial challenge to investigation validity" },
      { id:"r4", factor:"Evidence Freshness", impact:"high", description:"Biological and digital evidence collection window closing — CCTV footage retention risk (7-day limit)" },
      { id:"r5", factor:"Officer Workload", impact:"low", description:"SI Rajan Kumar has 8 active cases — risk of procedural oversight due to high workload" },
    ],
    summary: "High risk case requiring immediate supervisor intervention. Primary risk is evidence degradation due to medical examination delay. Three mandatory POCSO timelines breached.",
    generatedAt: new Date().toISOString(),
  },
  {
    caseId: "c2", riskLevel: "medium", riskScore: 52,
    riskFactors: [
      { id:"r1", factor:"Victim Age", impact:"high", description:"9-year-old male victim requires specialized interview techniques and support person throughout" },
      { id:"r2", factor:"Victim Cooperation", impact:"medium", description:"Victim cooperation challenges noted — trauma-informed approach required" },
      { id:"r3", factor:"Shelter Care", impact:"low", description:"Victim in CWC shelter home — safety secured, regular welfare checks required" },
    ],
    summary: "Medium risk case with manageable procedural steps. Victim safety is secured. Primary focus should be on trauma-informed victim statement collection.",
    generatedAt: new Date().toISOString(),
  },
  {
    caseId: "c4", riskLevel: "critical", riskScore: 92,
    riskFactors: [
      { id:"r1", factor:"Repeat Offender", impact:"high", description:"Accused has prior POCSO conviction — heightened risk of witness intimidation and evidence tampering" },
      { id:"r2", factor:"Escalation", impact:"high", description:"Case officially escalated by DSP Kumar Rao — multiple procedural issues identified" },
      { id:"r3", factor:"Evidence Collection Delay", impact:"high", description:"Stage 5 (Evidence Collection) significantly delayed — risk of crime scene contamination" },
      { id:"r4", factor:"Victim Age", impact:"high", description:"11-year-old female victim — mandatory psychological support required throughout" },
    ],
    summary: "Critical risk case. Accused is a repeat offender. Immediate action required to prevent evidence tampering. Victim and witness protection measures must be activated.",
    generatedAt: new Date().toISOString(),
  },
];

// ─── Readiness Reports ────────────────────────────────────────────────────────
export const READINESS_REPORTS: ReadinessReport[] = [
  {
    caseId: "c1", overallPercent: 44, completedCount: 4, totalCount: 9,
    items: [
      { id:"ri1",  label:"FIR Filed & Registered",                      done:true,  priority:"required",    category:"procedure" },
      { id:"ri2",  label:"Victim Statement (Sec 164 CrPC)",              done:true,  priority:"required",    category:"procedure" },
      { id:"ri3",  label:"Accused Identified in FIR",                   done:true,  priority:"required",    category:"document" },
      { id:"ri4",  label:"Victim in Protective Custody",                 done:true,  priority:"required",    category:"approval"  },
      { id:"ri5",  label:"Medical Examination Completed",                done:false, priority:"required",    category:"procedure" },
      { id:"ri6",  label:"Medical Examination Report Submitted",         done:false, priority:"required",    category:"document"  },
      { id:"ri7",  label:"FSL Evidence Submitted & Analyzed",            done:false, priority:"required",    category:"evidence"  },
      { id:"ri8",  label:"Witness Statements Recorded (min 2)",          done:false, priority:"required",    category:"procedure" },
      { id:"ri9",  label:"Charge Sheet Prepared & Reviewed",             done:false, priority:"required",    category:"document"  },
    ],
    recommendations: [
      "Complete medical examination immediately — highest priority action",
      "Initiate FSL sample submission within 48 hours",
      "Schedule witness interviews at earliest availability",
      "Assign second officer for parallel task execution",
    ],
    generatedAt: new Date().toISOString(),
  },
];

// ─── Missing Procedures ────────────────────────────────────────────────────────
export const MISSING_PROCEDURES: MissingProcedure[] = [
  { id:"mp1", type:"overdue_task",       caseId:"c1", title:"Medical Examination",       description:"POCSO Sec 27 medical examination not completed. 3 days overdue.", priority:"critical", suggestedAction:"Contact AIIMS Duty Officer immediately. Schedule emergency slot.", daysOverdue:3 },
  { id:"mp2", type:"missing_document",   caseId:"c1", title:"Medical Examination Report",description:"Report required for court admissibility of physical evidence.", priority:"critical", suggestedAction:"Obtain completed report from examining doctor within 24 hours." },
  { id:"mp3", type:"missing_evidence",   caseId:"c1", title:"DNA Sample Collection",      description:"Biological evidence not yet collected. Degradation risk is high.", priority:"critical", suggestedAction:"Collect samples immediately during medical examination. Seal and submit to FSL." },
  { id:"mp4", type:"missing_document",   caseId:"c1", title:"FSL Evidence Receipt",       description:"FSL has not acknowledged receipt of evidence from the case.", priority:"high",     suggestedAction:"Initiate FSL coordination through the police station FSL liaison officer." },
  { id:"mp5", type:"overdue_task",       caseId:"c1", title:"CWC Counseling Session",     description:"CWC counseling session not documented. Required under POCSO Sec 26.", priority:"high",  suggestedAction:"Contact CWC Officer Adv. Sunita Rao to schedule and document session.", daysOverdue:2 },
  { id:"mp6", type:"missing_document",   caseId:"c1", title:"Victim Support Person Consent",description:"Support person consent form not filed with the case record.", priority:"medium",   suggestedAction:"Obtain signed consent from victim's support person. File with case documents." },
  { id:"mp7", type:"delayed_approval",   caseId:"c1", title:"Supervisor Case Review",     description:"Mandatory 7-day supervisor review not completed on schedule.", priority:"medium",   suggestedAction:"Request case review from DSP Kumar Rao within 24 hours.", daysOverdue:1 },
  { id:"mp8", type:"missing_evidence",   caseId:"c2", title:"CCTV Footage Preservation",  description:"7-day CCTV retention window may expire. Preservation request not filed.", priority:"high", suggestedAction:"Send preservation request to CCTV operators immediately." },
];

// ─── AI Recommendations ────────────────────────────────────────────────────────
export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { id:"ar1", caseId:"c1", title:"Schedule Medical Examination",   priority:"critical", category:"procedure",    description:"Medical examination is 3 days overdue. Victim is a minor (12F). Biological evidence is degrading.", suggestedAction:"Call AIIMS Duty Officer at 011-26588500. Reference POCSO emergency protocol. Get examination done today.",       deadline:"Overdue" },
  { id:"ar2", caseId:"c1", title:"Initiate FSL Sample Submission", priority:"critical", category:"evidence",     description:"FSL samples cannot be collected until medical examination is completed. Pre-arrange FSL coordination.", suggestedAction:"Contact FSL Hyderabad liaison officer. Prepare evidence packaging per FSL SOP.",                                  deadline:"Within 24 hrs" },
  { id:"ar3", caseId:"c1", title:"Escalate to Supervisor",         priority:"high",     category:"coordination", description:"3 mandatory timelines breached. Supervisor escalation required per POCSO monitoring guidelines.",  suggestedAction:"Send formal escalation note to DSP Kumar Rao with delay documentation.",                                          deadline:"Within 6 hrs" },
  { id:"ar4", caseId:"c1", title:"Record Witness Statements",      priority:"high",     category:"procedure",    description:"2 potential witnesses identified at Lajpat Nagar. Statements not yet recorded.",                    suggestedAction:"Assign field officer for witness interview. Use Form 16 under POCSO Rules.",                                       deadline:"Within 48 hrs" },
  { id:"ar5", caseId:"c1", title:"Preserve Digital Evidence",      priority:"high",     category:"evidence",     description:"CCTV footage from nearby locations within 7-day retention window. Immediate action required.",       suggestedAction:"File CCTV preservation request to Lajpat Nagar Metro & nearby shops. Use prescribed legal notice format.",       deadline:"Today" },
  { id:"ar6", caseId:"c1", title:"Submit Charge Sheet",            priority:"medium",   category:"legal",        description:"Charge sheet preparation should begin in parallel with ongoing investigation to meet 60-day deadline.", suggestedAction:"Assign charge sheet drafting to designated legal officer. Begin document compilation.",                          deadline:"30 days" },
  { id:"ar7", caseId:"c2", title:"Arrange Support Person for Victim",priority:"high",   category:"coordination", description:"Victim statement recording requires a qualified support person present under POCSO Sec 26.",          suggestedAction:"Contact CWC for approved support person list. Assign one before scheduling victim interview.",                    deadline:"Before interview" },
  { id:"ar8", caseId:"c4", title:"Activate Witness Protection",    priority:"critical", category:"legal",        description:"Accused is a repeat offender. Risk of witness intimidation is high per threat assessment.",            suggestedAction:"File application for witness protection scheme with POCSO Special Court.",                                         deadline:"Immediate" },
];

// ─── App Notifications ────────────────────────────────────────────────────────
export const APP_NOTIFICATIONS: AppNotification[] = [
  { id:"n1",  type:"high_risk",         title:"🔴 Critical Risk Alert",            message:"Case SAKSHI/2024/001842 has been flagged as CRITICAL RISK. Medical examination is 3 days overdue. Immediate action required.",        priority:"critical", read:false, caseId:"c1", caseNumber:"SAKSHI/2024/001842", createdAt:new Date(Date.now()-1800000),   actionUrl:"/cases/c1" },
  { id:"n2",  type:"deadline",          title:"⏰ Deadline Breach — Stage 4",      message:"Medical Examination for SAKSHI/2024/001842 was due Jan 19, 2024. Currently 3 days overdue. Violation of POCSO mandatory timeline.",   priority:"critical", read:false, caseId:"c1", caseNumber:"SAKSHI/2024/001842", createdAt:new Date(Date.now()-3600000),   actionUrl:"/cases/c1" },
  { id:"n3",  type:"escalation",        title:"📢 Case Escalated",                 message:"Case SAKSHI/2024/001837 has been escalated by DSP Kumar Rao. Accused is a repeat offender. Witness protection measures recommended.", priority:"critical", read:false, caseId:"c4", caseNumber:"SAKSHI/2024/001837", createdAt:new Date(Date.now()-7200000),   actionUrl:"/cases/c4" },
  { id:"n4",  type:"ai_recommendation", title:"💡 AI Recommendation",              message:"AI analysis identified 4 missing procedures in case SAKSHI/2024/001842. Review recommended actions in the AI Assistant.",             priority:"high",     read:false, caseId:"c1", caseNumber:"SAKSHI/2024/001842", createdAt:new Date(Date.now()-10800000),  actionUrl:"/ai-assistant" },
  { id:"n5",  type:"case_assigned",     title:"📁 Case Assigned",                  message:"You have been assigned Case SAKSHI/2024/001832 — Sexual Assault, Kochi South. Please review and initiate investigation procedures.", priority:"high",     read:false, caseId:"c7", caseNumber:"SAKSHI/2024/001832", createdAt:new Date(Date.now()-14400000),  actionUrl:"/cases/c7" },
  { id:"n6",  type:"workflow_updated",  title:"✅ Workflow Stage Completed",        message:"Stage 6 (FSL Examination) completed for Case SAKSHI/2024/001835 by SI Deepa Menon. Next: Witness Statements.",                      priority:"medium",   read:false, caseId:"c5", caseNumber:"SAKSHI/2024/001835", createdAt:new Date(Date.now()-18000000),  actionUrl:"/cases/c5" },
  { id:"n7",  type:"document_uploaded", title:"📄 Document Uploaded",              message:"FSL Analysis Report uploaded to Case SAKSHI/2024/001839 by Dr. Amit Patel. Please review and acknowledge receipt.",                  priority:"medium",   read:true,  caseId:"c3", caseNumber:"SAKSHI/2024/001839", createdAt:new Date(Date.now()-86400000),  actionUrl:"/cases/c3" },
  { id:"n8",  type:"deadline",          title:"⏰ Deadline Reminder — 48 hrs",     message:"Charge sheet for Case SAKSHI/2024/001824 is due in 48 hours. 8 supporting documents still required.",                               priority:"high",     read:true,  caseId:"c11",caseNumber:"SAKSHI/2024/001824", createdAt:new Date(Date.now()-90000000),  actionUrl:"/cases/c11" },
  { id:"n9",  type:"workflow_updated",  title:"✅ Stage Completed — Court Submission",message:"Case SAKSHI/2024/001839 successfully submitted to POCSO Special Court by SI Amit Verma. Court date pending assignment.",         priority:"medium",   read:true,  caseId:"c3", caseNumber:"SAKSHI/2024/001839", createdAt:new Date(Date.now()-172800000), actionUrl:"/cases/c3" },
  { id:"n10", type:"ai_recommendation", title:"💡 New AI Risk Assessment",          message:"AI has completed risk analysis for 3 new cases. 1 case flagged CRITICAL, 2 cases flagged HIGH risk. Review the Risk Dashboard.",    priority:"high",     read:true,  caseId:undefined, caseNumber:undefined,             createdAt:new Date(Date.now()-180000000), actionUrl:"/ai-assistant" },
  { id:"n11", type:"case_assigned",     title:"📁 Mass Assignment — 2 Cases",      message:"2 new POCSO cases assigned to your jurisdiction: SAKSHI/2024/001808 (Ranchi) and SAKSHI/2024/001804 (Manipur). Immediate attention required.", priority:"high", read:true,caseId:undefined,caseNumber:undefined, createdAt:new Date(Date.now()-259200000), actionUrl:"/cases" },
  { id:"n12", type:"general",           title:"📢 System Update",                   message:"SAKSHI platform updated to v1.2.0. New features: Enhanced AI risk scoring, improved FSL coordination workflow, mobile app support.", priority:"low",      read:true,  caseId:undefined, caseNumber:undefined,             createdAt:new Date(Date.now()-345600000), actionUrl:undefined },
];
