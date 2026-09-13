"""
dpog_service.py — Dynamic Procedural Obligation Graph (D-POG) & Procedural Digital Twin Engine.

Provides deterministic procedural state evaluation, backward root blocker analysis,
forward downstream impact propagation, and explainable Procedural Readiness calculations.
"""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple
from collections import deque

from app.core.dpog_templates import get_template


class DPOGEngine:
    """Deterministic Procedural Dependency & State Engine."""

    def __init__(self, crime_type: str = "POCSO"):
        self.template = get_template(crime_type)
        self.template_stages = {s["stageId"]: s for s in self.template["stages"]}
        self.stage_order_map = {s["stageId"]: s["order"] for s in self.template["stages"]}
        
        # Build adjacency maps from template
        self.prereq_map: Dict[str, List[str]] = {s["stageId"]: s.get("prerequisites", []) for s in self.template["stages"]}
        self.dependent_map: Dict[str, List[str]] = {s["stageId"]: [] for s in self.template["stages"]}
        for stage_id, prereqs in self.prereq_map.items():
            for p in prereqs:
                if p in self.dependent_map:
                    self.dependent_map[p].append(stage_id)

    def evaluate_graph(self, case_id: str, case_number: str, db_stages: List[Any]) -> Dict[str, Any]:
        """
        Evaluate full D-POG state for a case based on real PostgreSQL workflow records.
        """
        # Map database records by stage_id
        db_stage_map: Dict[str, Any] = {}
        for stg in db_stages:
            stage_key = getattr(stg, "stageId", None) or f"stage_{getattr(stg, 'order', 1)}"
            db_stage_map[stage_key] = stg

        # Evaluate initial completion state
        completed_set: Set[str] = set()
        for s_id, t_info in self.template_stages.items():
            db_stg = db_stage_map.get(s_id)
            if db_stg and getattr(db_stg, "status", "").lower() == "completed":
                completed_set.add(s_id)

        # Evaluate node states
        evaluated_nodes: List[Dict[str, Any]] = []
        node_status_map: Dict[str, str] = {}

        for t_stage in self.template["stages"]:
            s_id = t_stage["stageId"]
            db_stg = db_stage_map.get(s_id)
            prereqs = self.prereq_map.get(s_id, [])

            # Check prerequisite satisfaction
            incomplete_prereqs = [p for p in prereqs if p not in completed_set]
            is_blocked = len(incomplete_prereqs) > 0

            # Determine procedural status
            db_status = getattr(db_stg, "status", "pending").lower() if db_stg else "pending"
            
            if db_status == "completed":
                calculated_status = "COMPLETED"
            elif is_blocked:
                calculated_status = "BLOCKED"
            elif db_status == "in_progress":
                calculated_status = "IN_PROGRESS"
            else:
                calculated_status = "READY"

            node_status_map[s_id] = calculated_status

            # Extract metadata
            officer = getattr(db_stg, "officer", None)
            completed_date = getattr(db_stg, "completedDate", None)
            remarks = getattr(db_stg, "remarks", None)
            deadline = getattr(db_stg, "deadline", t_stage.get("deadlineLabel"))

            evaluated_nodes.append({
                "id": s_id,
                "dbId": str(getattr(db_stg, "id", "")) if db_stg else None,
                "stageId": s_id,
                "order": t_stage["order"],
                "title": t_stage["title"],
                "description": t_stage["description"],
                "department": t_stage["department"],
                "responsibleRole": t_stage["responsibleRole"],
                "rawStatus": db_status,
                "calculatedStatus": calculated_status,
                "isCompleted": calculated_status == "COMPLETED",
                "isBlocked": calculated_status == "BLOCKED",
                "isActionable": calculated_status in ("READY", "IN_PROGRESS"),
                "isCriticalPath": t_stage.get("isCriticalPath", True),
                "deadline": deadline,
                "statutoryDeadlineLabel": t_stage.get("deadlineLabel", "Standard statutory timeline"),
                "officer": officer,
                "completedDate": completed_date,
                "remarks": remarks,
                "evidenceRequired": t_stage.get("evidenceRequired", []),
                "prerequisites": prereqs,
                "incompletePrerequisites": incomplete_prereqs,
                "directDependents": self.dependent_map.get(s_id, []),
            })

        # Calculate Root Blockers and Downstream Impacts for all nodes
        nodes_with_analysis: List[Dict[str, Any]] = []
        for node in evaluated_nodes:
            s_id = node["stageId"]
            
            # 1. Root Blocker Analysis
            blocker_info = self._analyze_root_blocker(s_id, node_status_map, completed_set)
            
            # 2. Downstream Impact Analysis
            downstream_info = self._analyze_downstream_impact(s_id, node_status_map)

            node["rootBlockerInfo"] = blocker_info
            node["downstreamImpactInfo"] = downstream_info
            nodes_with_analysis.append(node)

        # Build Graph Edges
        edges = self._build_graph_edges(evaluated_nodes, node_status_map)

        # Calculate Procedural Readiness Indicator
        readiness = self._calculate_readiness(evaluated_nodes)

        # Compute Active Blockers Summary & Next Actionable Tasks
        active_blockers = [
            {
                "stageId": n["stageId"],
                "title": n["title"],
                "department": n["department"],
                "rootBlocker": n["rootBlockerInfo"].get("rootBlockerTitle") if n["rootBlockerInfo"] else None,
                "affectedDownstreamCount": n["downstreamImpactInfo"]["totalAffectedCount"],
            }
            for n in evaluated_nodes if n["isBlocked"]
        ]

        next_actionable = [
            {
                "stageId": n["stageId"],
                "title": n["title"],
                "department": n["department"],
                "status": n["calculatedStatus"],
                "deadline": n["deadline"],
            }
            for n in evaluated_nodes if n["isActionable"]
        ]

        return {
            "caseId": str(case_id),
            "caseNumber": case_number,
            "templateId": self.template["templateId"],
            "crimeType": self.template["crimeType"],
            "totalStages": len(evaluated_nodes),
            "readiness": readiness,
            "nodes": nodes_with_analysis,
            "edges": edges,
            "summary": {
                "activeBlockers": active_blockers,
                "nextActionable": next_actionable,
                "isProcedurallyIntact": len(active_blockers) == 0,
            },
        }

    def _analyze_root_blocker(self, stage_id: str, status_map: Dict[str, str], completed_set: Set[str]) -> Optional[Dict[str, Any]]:
        """
        Traverse prerequisite DAG backwards to identify immediate blocker, root blocker, and chain.
        """
        if status_map.get(stage_id) != "BLOCKED":
            return None

        immediate_prereqs = self.prereq_map.get(stage_id, [])
        incomplete_immediate = [p for p in immediate_prereqs if p not in completed_set]
        
        if not incomplete_immediate:
            return None

        immediate_blocker_id = incomplete_immediate[0]
        immediate_stage_info = self.template_stages.get(immediate_blocker_id, {})

        # Find Root Blocker (furthest uncompleted ancestor with no uncompleted prerequisites)
        visited = set()
        queue = deque([immediate_blocker_id])
        blocker_chain: List[str] = []
        root_blocker_id = immediate_blocker_id

        while queue:
            curr = queue.popleft()
            if curr in visited:
                continue
            visited.add(curr)
            blocker_chain.append(curr)

            curr_prereqs = [p for p in self.prereq_map.get(curr, []) if p not in completed_set]
            if curr_prereqs:
                for cp in curr_prereqs:
                    queue.append(cp)
            else:
                # Node with no incomplete prerequisites is the root cause
                root_blocker_id = curr

        root_stage_info = self.template_stages.get(root_blocker_id, {})

        # Count total downstream obligations blocked by this root blocker
        downstream_affected = self._get_all_descendants(root_blocker_id)

        return {
            "immediateBlockerId": immediate_blocker_id,
            "immediateBlockerTitle": immediate_stage_info.get("title", immediate_blocker_id),
            "immediateBlockerDepartment": immediate_stage_info.get("department", "police"),
            "rootBlockerId": root_blocker_id,
            "rootBlockerTitle": root_stage_info.get("title", root_blocker_id),
            "rootBlockerDepartment": root_stage_info.get("department", "police"),
            "blockerChain": blocker_chain,
            "explanation": f"{self.template_stages.get(stage_id, {}).get('title')} is blocked because {root_stage_info.get('title')} is pending ({root_stage_info.get('department', 'external').upper()}).",
            "downstreamImpactCount": len(downstream_affected),
        }

    def _analyze_downstream_impact(self, stage_id: str, status_map: Dict[str, str]) -> Dict[str, Any]:
        """
        Calculate direct and indirect downstream dependent obligations affected by a stage.
        """
        direct = self.dependent_map.get(stage_id, [])
        all_descendants = self._get_all_descendants(stage_id)
        
        # Check if final/critical stage is affected (stage_9)
        affects_chargesheet = "stage_9" in all_descendants or stage_id == "stage_9"

        return {
            "directDependentIds": direct,
            "totalAffectedCount": len(all_descendants),
            "affectedStageIds": list(all_descendants),
            "affectsStatutoryChargesheet": affects_chargesheet,
        }

    def _get_all_descendants(self, stage_id: str) -> Set[str]:
        """Collect all reachable downstream descendants via BFS."""
        descendants: Set[str] = set()
        queue = deque(self.dependent_map.get(stage_id, []))
        while queue:
            curr = queue.popleft()
            if curr not in descendants:
                descendants.add(curr)
                for child in self.dependent_map.get(curr, []):
                    queue.append(child)
        return descendants

    def _build_graph_edges(self, nodes: List[Dict[str, Any]], status_map: Dict[str, str]) -> List[Dict[str, Any]]:
        """Construct React Flow edges representing procedural dependencies."""
        edges: List[Dict[str, Any]] = []
        edge_idx = 1

        for node in nodes:
            target_id = node["stageId"]
            prereqs = node.get("prerequisites", [])

            for src_id in prereqs:
                src_status = status_map.get(src_id, "PENDING")
                target_status = status_map.get(target_id, "PENDING")

                is_blocked_path = (target_status == "BLOCKED" and src_status != "COMPLETED")
                is_active_path = (src_status == "COMPLETED" and target_status in ("IN_PROGRESS", "READY"))
                is_completed_path = (src_status == "COMPLETED" and target_status == "COMPLETED")

                if is_completed_path:
                    stroke = "#10b981"  # Emerald
                elif is_blocked_path:
                    stroke = "#ef4444"  # Red
                elif is_active_path:
                    stroke = "#38bdf8"  # Sky/Royal
                else:
                    stroke = "#475569"  # Slate

                edges.append({
                    "id": f"edge_{src_id}_{target_id}",
                    "source": src_id,
                    "target": target_id,
                    "type": "smoothstep",
                    "animated": is_active_path,
                    "isBlockedPath": is_blocked_path,
                    "style": {
                        "stroke": stroke,
                        "strokeWidth": 2.5 if (is_active_path or is_blocked_path) else 1.5,
                        "strokeDasharray": "5,5" if is_blocked_path else "none",
                    },
                    "markerEnd": {
                        "type": "arrowclosed",
                        "color": stroke,
                        "width": 16,
                        "height": 16,
                    },
                })
                edge_idx += 1

        return edges

    def _calculate_readiness(self, nodes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Deterministic calculation of the Procedural Readiness Indicator (0 - 100%).
        Considers stage completion, critical path compliance, and blocker penalties.
        """
        total = len(nodes)
        if total == 0:
            return {"score": 0, "percentage": 0, "status": "INACTIVE"}

        completed = sum(1 for n in nodes if n["isCompleted"])
        blocked = sum(1 for n in nodes if n["isBlocked"])
        in_progress = sum(1 for n in nodes if n["calculatedStatus"] == "IN_PROGRESS")
        actionable = sum(1 for n in nodes if n["isActionable"])

        # Base progress: 70% of score from completed stages
        base_completion_ratio = (completed / total) * 70.0
        
        # In-progress bonus: up to 10%
        in_progress_ratio = (in_progress / total) * 10.0

        # Unblocked critical path score: 20% if no blockers, penalized by number of blockers
        blocker_penalty = min(20.0, blocked * 5.0)
        path_integrity_score = max(0.0, 20.0 - blocker_penalty)

        readiness_score = int(round(base_completion_ratio + in_progress_ratio + path_integrity_score))
        readiness_score = max(0, min(100, readiness_score))

        if readiness_score >= 85:
            status_label = "HIGH_READINESS"
        elif readiness_score >= 50:
            status_label = "MODERATE_PROGRESS"
        elif blocked > 0:
            status_label = "PROCEDURALLY_BOTTLENECKED"
        else:
            status_label = "EARLY_STAGE"

        return {
            "score": readiness_score,
            "percentage": f"{readiness_score}%",
            "status": status_label,
            "completedStages": completed,
            "totalStages": total,
            "blockedStages": blocked,
            "actionableStages": actionable,
            "inProgressStages": in_progress,
            "factorBreakdown": {
                "baseCompletionPoints": round(base_completion_ratio, 1),
                "activeProgressPoints": round(in_progress_ratio, 1),
                "pathIntegrityPoints": round(path_integrity_score, 1),
                "blockerDeductions": round(blocker_penalty, 1),
            },
            "explanation": f"{completed} of {total} procedural obligations completed. {blocked} downstream obligations currently blocked by pending prerequisites.",
        }
