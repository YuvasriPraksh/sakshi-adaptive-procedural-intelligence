// ─── Derived from CASES for chart consumption ────────────────────────────────
export const MONTHLY_TREND = [
  { month:"Aug",registered:62,resolved:48,escalated:4 },
  { month:"Sep",registered:71,resolved:55,escalated:6 },
  { month:"Oct",registered:84,resolved:61,escalated:5 },
  { month:"Nov",registered:93,resolved:74,escalated:8 },
  { month:"Dec",registered:102,resolved:82,escalated:7 },
  { month:"Jan",registered:128,resolved:104,escalated:11},
  { month:"Feb",registered:134,resolved:119,escalated:9 },
];

export const CRIME_TYPE_DATA = [
  { name:"Sexual Assault",value:42 },
  { name:"Child Abuse",   value:28 },
  { name:"Exploitation",  value:14 },
  { name:"Trafficking",   value:10 },
  { name:"Cybercrime",    value:4  },
  { name:"Other",         value:2  },
];

export const STATUS_DIST = [
  { label:"In Progress",  value:38, color:"#3b82f6" },
  { label:"Pending",      value:22, color:"#f59e0b" },
  { label:"Under Review", value:15, color:"#8b5cf6" },
  { label:"Completed",    value:14, color:"#10b981" },
  { label:"Escalated",    value:7,  color:"#ef4444" },
  { label:"Closed",       value:4,  color:"#64748b" },
];

export const RISK_DIST = [
  { label:"Critical", value:18, color:"#dc2626" },
  { label:"High",     value:31, color:"#f59e0b" },
  { label:"Medium",   value:34, color:"#3b82f6" },
  { label:"Low",      value:17, color:"#10b981" },
];

export const READINESS_DIST = [
  { label:"Not Ready (<40%)", value:28, color:"#ef4444" },
  { label:"Partial (40-79%)", value:44, color:"#f59e0b" },
  { label:"Ready (≥80%)",     value:28, color:"#10b981" },
];

export const OFFICER_PERF = [
  { name:"SI Rajan K.",    cases:8, resolved:5, avgDays:18 },
  { name:"SI Priya S.",    cases:6, resolved:4, avgDays:22 },
  { name:"SI Amit V.",     cases:5, resolved:5, avgDays:16 },
  { name:"DSP Kumar R.",   cases:12,resolved:7, avgDays:14 },
  { name:"SI Deepa M.",    cases:7, resolved:4, avgDays:20 },
  { name:"SI Rahul M.",    cases:9, resolved:5, avgDays:19 },
  { name:"SI Kavitha N.",  cases:4, resolved:3, avgDays:17 },
];

export const DEPT_CASES = [
  { dept:"Police",   cases:348 },
  { dept:"Hospital", cases:214 },
  { dept:"FSL",      cases:189 },
  { dept:"CWC",      cases:156 },
  { dept:"Court",    cases:89  },
];

export const KPI_STATS = {
  totalCases:        100,
  activeCases:       53,
  closedCases:       21,
  highRiskCases:     18,
  avgInvestigationDays: 19,
  pendingStages:     47,
  slaCompliance:     78,
  escalatedCases:    8,
};
