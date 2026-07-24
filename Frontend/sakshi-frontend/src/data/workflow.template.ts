import type { WorkflowStage } from "@/types/case.types";

export function buildWorkflow(completedUpTo: number): WorkflowStage[] {
  const stages: Omit<WorkflowStage, "status" | "completedDate" | "officer" | "remarks">[] = [
    { id: "s1", order: 1, title: "Complaint Registered",   description: "Initial complaint received and logged in the system",      deadline: "", department: "police"   },
    { id: "s2", order: 2, title: "FIR Registered",         description: "First Information Report filed at the police station",     deadline: "", department: "police"   },
    { id: "s3", order: 3, title: "Victim Statement",       description: "Statement recorded under Sec 164 CrPC before magistrate",  deadline: "", department: "police"   },
    { id: "s4", order: 4, title: "Medical Examination",    description: "Medical examination by authorized doctor (POCSO Sec 27)",  deadline: "", department: "hospital" },
    { id: "s5", order: 5, title: "Evidence Collection",    description: "Physical evidence collected from crime scene",             deadline: "", department: "police"   },
    { id: "s6", order: 6, title: "FSL Examination",        description: "Forensic examination of collected evidence",              deadline: "", department: "fsl"      },
    { id: "s7", order: 7, title: "Witness Statements",     description: "Statements of witnesses recorded",                        deadline: "", department: "police"   },
    { id: "s8", order: 8, title: "Charge Sheet",           description: "Charge sheet (challan) prepared and filed",               deadline: "", department: "police"   },
    { id: "s9", order: 9, title: "Court Submission",       description: "Case submitted to Special POCSO Court",                   deadline: "", department: "court"    },
  ];

  const officers = ["SI Rajan Kumar", "SI Priya Sharma", "Dr. Priya Singh", "Dr. Amit Patel", "SI Amit Verma"];
  const dates = ["2024-01-15","2024-01-16","2024-01-18","2024-01-20","2024-01-22","2024-02-01","2024-02-05","2024-02-10","2024-02-15"];
  const remarks = [
    "Complaint received and registered in portal",
    "FIR No. filed under POCSO Act Sec 4",
    "Statement recorded in presence of support person",
    "Examination completed, report submitted",
    "CCTV footage and physical evidence secured",
    "DNA analysis report received from FSL",
    "3 witness statements recorded",
    "Charge sheet filed with 42 documents",
    "Case submitted to POCSO Special Court",
  ];

  return stages.map((s) => ({
    ...s,
    status: s.order < completedUpTo ? "completed" : s.order === completedUpTo ? "in_progress" : "pending",
    completedDate: s.order < completedUpTo ? dates[s.order - 1] : undefined,
    officer: s.order <= completedUpTo ? officers[(s.order - 1) % officers.length] : undefined,
    remarks: s.order < completedUpTo ? remarks[s.order - 1] : undefined,
  }));
}
