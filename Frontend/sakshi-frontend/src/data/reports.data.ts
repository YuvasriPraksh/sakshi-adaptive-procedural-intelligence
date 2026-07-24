export type ReportStatus = "ready" | "generating" | "scheduled";
export type ReportCategory = "case" | "investigation" | "risk" | "readiness" | "workflow" | "audit";

export interface ReportCard {
  id:          string;
  title:       string;
  description: string;
  category:    ReportCategory;
  status:      ReportStatus;
  generatedAt: string;
  period:      string;
  recordCount: number;
  icon:        string;
  color:       string;
  previewRows: string[][];
  previewHeaders: string[];
}

export const REPORTS: ReportCard[] = [
  {
    id:"r1", title:"Case Summary Report", category:"case", status:"ready",
    description:"Complete summary of all registered POCSO cases including status, priority, and officer assignments.",
    generatedAt:"2024-02-20T08:00:00Z", period:"Jan–Feb 2024", recordCount:100, icon:"folder", color:"bg-royal-50 text-royal-600 border-royal-200",
    previewHeaders:["Case #","Crime Type","Status","Priority","Officer","Updated"],
    previewRows:[
      ["001842","Sexual Assault","In Progress","Critical","SI Rajan Kumar","2h ago"],
      ["001841","Child Abuse","Pending","High","SI Priya Sharma","5h ago"],
      ["001839","Sexual Assault","Completed","High","SI Amit Verma","1d ago"],
      ["001837","Child Abuse","Escalated","Critical","DSP Kumar Rao","2d ago"],
      ["001835","Exploitation","In Progress","High","SI Deepa Menon","2d ago"],
    ],
  },
  {
    id:"r2", title:"Investigation Progress Report", category:"investigation", status:"ready",
    description:"Stage-by-stage progress analysis for all active cases with SLA compliance tracking.",
    generatedAt:"2024-02-20T09:30:00Z", period:"Jan–Feb 2024", recordCount:53, icon:"git-branch", color:"bg-emerald-50 text-emerald-600 border-emerald-200",
    previewHeaders:["Case #","Current Stage","Stage #","Officer","Days Active","SLA"],
    previewRows:[
      ["001842","Medical Examination","4/9","SI Rajan Kumar","36","⚠ Breached"],
      ["001841","Victim Statement","3/9","SI Priya Sharma","37","✓ On Track"],
      ["001835","FSL Examination","6/9","SI Deepa Menon","39","✓ On Track"],
      ["001832","FIR Registered","2/9","SI Kavitha Nair","43","⚠ Delayed"],
      ["001830","Complaint Registered","1/9","SI Rajan Kumar","45","✓ On Track"],
    ],
  },
  {
    id:"r3", title:"Risk Assessment Report", category:"risk", status:"ready",
    description:"AI-generated risk scores and factor analysis across all active investigations.",
    generatedAt:"2024-02-20T10:00:00Z", period:"Feb 2024", recordCount:53, icon:"shield", color:"bg-red-50 text-red-600 border-red-200",
    previewHeaders:["Case #","Risk Level","Score","Key Factor","Recommendation"],
    previewRows:[
      ["001842","Critical","92","Medical Delay","Immediate action required"],
      ["001837","Critical","88","Repeat Offender","Witness protection needed"],
      ["001821","High","76","Evidence Freshness","FSL submission urgent"],
      ["001810","High","71","Victim Age","CWC coordination needed"],
      ["001841","Medium","52","Victim Cooperation","Support person required"],
    ],
  },
  {
    id:"r4", title:"Readiness Report", category:"readiness", status:"ready",
    description:"Court readiness assessment for all cases with completed procedure checklists.",
    generatedAt:"2024-02-20T11:00:00Z", period:"Feb 2024", recordCount:100, icon:"target", color:"bg-amber-50 text-amber-600 border-amber-200",
    previewHeaders:["Case #","Readiness %","Completed","Pending","Status"],
    previewRows:[
      ["001839","100%","9/9","0","✅ Ready"],
      ["001826","100%","9/9","0","✅ Ready"],
      ["001824","78%","7/9","2","⚠ Partial"],
      ["001835","67%","6/9","3","⚠ Partial"],
      ["001842","44%","4/9","5","❌ Not Ready"],
    ],
  },
  {
    id:"r5", title:"Workflow Compliance Report", category:"workflow", status:"ready",
    description:"Procedural compliance analysis with overdue tasks and deadline breach tracking.",
    generatedAt:"2024-02-19T14:00:00Z", period:"Jan–Feb 2024", recordCount:100, icon:"clipboard-list", color:"bg-purple-50 text-purple-600 border-purple-200",
    previewHeaders:["Case #","Overdue Steps","Missed Deadlines","Avg Delay","Compliance"],
    previewRows:[
      ["001842","3","2","3.4 days","55%"],
      ["001832","2","1","1.8 days","72%"],
      ["001837","1","1","2.1 days","68%"],
      ["001830","1","0","0.5 days","89%"],
      ["001841","0","0","—","100%"],
    ],
  },
  {
    id:"r6", title:"Audit Trail Report", category:"audit", status:"ready",
    description:"Complete tamper-proof activity log for all system actions across all modules.",
    generatedAt:"2024-02-20T12:00:00Z", period:"Jan–Feb 2024", recordCount:487, icon:"clipboard", color:"bg-slate-50 text-slate-600 border-slate-200",
    previewHeaders:["Timestamp","User","Action","Module","Status"],
    previewRows:[
      ["20 Feb 14:20","SI Rajan Kumar","Workflow Updated","Cases","Success"],
      ["20 Feb 11:30","Dr. Priya Singh","Document Uploaded","Documents","Success"],
      ["20 Feb 09:00","System","AI Summary Generated","AI","Success"],
      ["19 Feb 16:45","DSP Kumar Rao","Case Escalated","Cases","Success"],
      ["19 Feb 14:00","SI Deepa Menon","FSL Report Submitted","Documents","Success"],
    ],
  },
];
