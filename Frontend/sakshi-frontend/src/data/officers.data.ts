import type { Officer } from "@/types/case.types";

export const OFFICERS: Officer[] = [
  { id: "o1",  name: "SI Rajan Kumar",    designation: "Sub-Inspector",        station: "South Delhi PS",        badge: "DL-2341", phone: "9811234567", email: "rajan.kumar@delhipolice.gov.in",    department: "police",     activeCases: 8  },
  { id: "o2",  name: "SI Priya Sharma",   designation: "Sub-Inspector",        station: "East Mumbai PS",        badge: "MH-4521", phone: "9822345678", email: "priya.sharma@mumbaipolice.gov.in",   department: "police",     activeCases: 6  },
  { id: "o3",  name: "SI Amit Verma",     designation: "Sub-Inspector",        station: "Bengaluru South PS",    badge: "KA-1234", phone: "9833456789", email: "amit.verma@karnatakapolice.gov.in",  department: "police",     activeCases: 5  },
  { id: "o4",  name: "DSP Kumar Rao",     designation: "Dy. Superintendent",   station: "Chennai Central PS",    badge: "TN-5678", phone: "9844567890", email: "kumar.rao@tnpolice.gov.in",          department: "supervisor", activeCases: 12 },
  { id: "o5",  name: "SI Deepa Menon",    designation: "Sub-Inspector",        station: "Hyderabad West PS",     badge: "TS-9012", phone: "9855678901", email: "deepa.menon@tspolice.gov.in",        department: "police",     activeCases: 7  },
  { id: "o6",  name: "Dr. Priya Singh",   designation: "Medical Officer",      station: "AIIMS Delhi",           badge: "MO-1001", phone: "9866789012", email: "priya.singh@aiims.edu",             department: "hospital",   activeCases: 5  },
  { id: "o7",  name: "Dr. Amit Patel",    designation: "Forensic Examiner",    station: "FSL Hyderabad",         badge: "FS-2002", phone: "9877890123", email: "amit.patel@fslhyd.gov.in",          department: "fsl",        activeCases: 4  },
  { id: "o8",  name: "Adv. Sunita Rao",   designation: "CWC Member",           station: "CWC Karnataka",         badge: "CW-3003", phone: "9888901234", email: "sunita.rao@cwckarnata.gov.in",      department: "cwc",        activeCases: 6  },
  { id: "o9",  name: "SI Rahul Mehta",    designation: "Sub-Inspector",        station: "Pune City PS",          badge: "MH-7890", phone: "9899012345", email: "rahul.mehta@punepolice.gov.in",     department: "police",     activeCases: 9  },
  { id: "o10", name: "SI Kavitha Nair",   designation: "Sub-Inspector",        station: "Kochi South PS",        badge: "KL-3456", phone: "9810123456", email: "kavitha.nair@keralapolice.gov.in",  department: "police",     activeCases: 4  },
];
