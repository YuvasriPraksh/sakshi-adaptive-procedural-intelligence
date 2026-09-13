"""
dpog_templates.py — Procedural Obligation Templates for SAKSHI D-POG Engine.

Defines standardized statutory workflows, prerequisite dependencies, responsible roles,
and compliance constraints for sensitive investigation types.
"""
from typing import Dict, List, Any

# ── POCSO Act 2012 Standard Procedural Investigation Template ─────────────────
POCSO_TEMPLATE = {
    "templateId": "TPL-POCSO-V1",
    "crimeType": "POCSO",
    "name": "POCSO Act 2012 Standard Pre-Trial Investigation Procedure",
    "totalStages": 9,
    "statutoryInvestigationDeadlineDays": 60,  # Sec 35 POCSO: 60-day target for chargesheet
    "stages": [
        {
            "stageId": "stage_1",
            "order": 1,
            "title": "FIR Registration & Special Court Intimation",
            "description": "Registration of FIR under relevant POCSO sections and transmission of copy to Special Court / CWC within 24 hours.",
            "department": "police",
            "responsibleRole": "police",
            "isCriticalPath": True,
            "prerequisites": [],
            "statutoryDeadlineHours": 24,
            "deadlineLabel": "24 Hours from Report",
            "evidenceRequired": ["Written Complaint / Statement", "FIR Copy (Form 1)"],
        },
        {
            "stageId": "stage_2",
            "order": 2,
            "title": "Child Welfare Committee (CWC) Intake & Support Person",
            "description": "Production of child/report to CWC, assignment of support person, and preliminary care & protection order.",
            "department": "cwc",
            "responsibleRole": "cwc",
            "isCriticalPath": True,
            "prerequisites": ["stage_1"],
            "statutoryDeadlineHours": 24,
            "deadlineLabel": "24 Hours from FIR",
            "evidenceRequired": ["CWC Intimation Form", "Support Person Order"],
        },
        {
            "stageId": "stage_3",
            "order": 3,
            "title": "Mandatory Medical Examination",
            "description": "Medical examination of the victim by a registered female medical practitioner under Section 27 POCSO Act.",
            "department": "hospital",
            "responsibleRole": "hospital",
            "isCriticalPath": True,
            "prerequisites": ["stage_1"],
            "statutoryDeadlineHours": 24,
            "deadlineLabel": "24 Hours from Police Intimation",
            "evidenceRequired": ["Medical Examination Report (Form C)", "Emergency Treatment Record"],
        },
        {
            "stageId": "stage_4",
            "order": 4,
            "title": "Forensic Evidence Collection & Seizure",
            "description": "Collection of biological samples, clothing, and digital evidence following strict chain-of-custody protocols.",
            "department": "police",
            "responsibleRole": "police",
            "isCriticalPath": True,
            "prerequisites": ["stage_1", "stage_3"],
            "statutoryDeadlineDays": 3,
            "deadlineLabel": "72 Hours from Incident",
            "evidenceRequired": ["Seizure Memo (Panchnama)", "Evidence Chain of Custody Tag"],
        },
        {
            "stageId": "stage_5",
            "order": 5,
            "title": "FSL Sample Dispatch & Forwarding",
            "description": "Formal submission and secure transit of sealed forensic samples to the Forensic Science Laboratory (FSL).",
            "department": "police",
            "responsibleRole": "police",
            "isCriticalPath": True,
            "prerequisites": ["stage_4"],
            "statutoryDeadlineDays": 7,
            "deadlineLabel": "7 Days from Seizure",
            "evidenceRequired": ["FSL Forwarding Docket", "Courier / Escort Receipt"],
        },
        {
            "stageId": "stage_6",
            "order": 6,
            "title": "FSL Analysis & Forensic Report",
            "description": "Comprehensive biological, DNA, and toxicological analysis by certified FSL scientific officer.",
            "department": "fsl",
            "responsibleRole": "fsl",
            "isCriticalPath": True,
            "prerequisites": ["stage_5"],
            "statutoryDeadlineDays": 30,
            "deadlineLabel": "30 Days from FSL Receipt",
            "evidenceRequired": ["FSL Expert Report", "DNA Profile Summary"],
        },
        {
            "stageId": "stage_7",
            "order": 7,
            "title": "Comprehensive Evidence Review",
            "description": "Triangulation of FSL reports, medical evidence, victim statement (Sec 164 CrPC), and digital logs.",
            "department": "police",
            "responsibleRole": "police",
            "isCriticalPath": True,
            "prerequisites": ["stage_3", "stage_6"],
            "statutoryDeadlineDays": 45,
            "deadlineLabel": "45 Days from FIR",
            "evidenceRequired": ["Evidence Review Note", "Sec 164 Statement Copy"],
        },
        {
            "stageId": "stage_8",
            "order": 8,
            "title": "Supervisory & Legal Scrutiny",
            "description": "Review by Senior Police Officer (DCP/SP) and Public Prosecutor to ensure procedural integrity.",
            "department": "supervisor",
            "responsibleRole": "supervisor",
            "isCriticalPath": True,
            "prerequisites": ["stage_7"],
            "statutoryDeadlineDays": 50,
            "deadlineLabel": "50 Days from FIR",
            "evidenceRequired": ["Supervisory Inspection Memo", "Public Prosecutor Scrutiny Note"],
        },
        {
            "stageId": "stage_9",
            "order": 9,
            "title": "Final Chargesheet Filing (Sec 173 CrPC)",
            "description": "Submission of complete police report and final chargesheet before the Designated POCSO Special Court.",
            "department": "police",
            "responsibleRole": "police",
            "isCriticalPath": True,
            "prerequisites": ["stage_8"],
            "statutoryDeadlineDays": 60,
            "deadlineLabel": "60 Days Mandatory Statutory Target",
            "evidenceRequired": ["Final Form / Chargesheet (Sec 173)", "Court Acknowledgement Receipt"],
        },
    ],
}

TEMPLATES: Dict[str, Dict[str, Any]] = {
    "POCSO": POCSO_TEMPLATE,
}


def get_template(crime_type: str) -> Dict[str, Any]:
    """Retrieve the procedural template for a crime type (defaults to POCSO)."""
    normalized = crime_type.upper().strip() if crime_type else "POCSO"
    return TEMPLATES.get(normalized, POCSO_TEMPLATE)
