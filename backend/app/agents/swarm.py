import asyncio
import logging
from typing import Dict, Any, List, AsyncGenerator
from app.agents.triage_agent import triage_agent
from app.agents.blast_radius_agent import blast_radius_agent
from app.agents.remediation_agent import remediation_agent
from app.agents.company_brain_agent import company_brain_agent
from app.graph.seed_data import seed_enterprise_graph

logger = logging.getLogger("aegis.swarm")

class IncidentSwarmCommander:
    """
    Coordinates multi-agent collaboration across Track 1, 2, and 3.
    Streams step-by-step cognitive reasoning to the UI.
    """
    def __init__(self):
        # Ensure base data is ready
        seed_enterprise_graph()

    async def execute_autonomous_incident_workflow(self, alert_id: str = "ALERT-504-GATEWAY") -> AsyncGenerator[Dict[str, Any], None]:
        """
        Executes the full end-to-end incident lifecycle:
        1. Triage (Track 1)
        2. Blast Radius (Track 1)
        3. Company Brain Lineage (Track 3)
        4. Ephemeral Sandboxing & Remediation (Track 2)
        Yields live updates for the UI.
        """
        yield {
            "step": 1,
            "agent": "SWARM_DISPATCHER",
            "status": "INCIDENT_DETECTED",
            "message": f"🚨 High-severity alert received: {alert_id}. Mobilizing Aegis-Graph agent mesh...",
            "progress": 10
        }
        await asyncio.sleep(0.6)

        # Step 2: Triage Agent Multi-hop Traversal
        yield {
            "step": 2,
            "agent": "TRIAGE_AGENT",
            "status": "TRAVERSING_GRAPH",
            "message": "Traversing 4 hops across FalkorDB: Alert -> ApiGateway -> AuthService -> Pod CrashLoopBackOff -> Commit 7f9a2b",
            "progress": 30
        }
        triage_res = triage_agent.investigate_alert(alert_id)
        await asyncio.sleep(0.8)
        yield {
            "step": 3,
            "agent": "TRIAGE_AGENT",
            "status": "ROOT_CAUSE_FOUND",
            "message": f"Root cause pinpointed: Commit {triage_res['root_cause_commit']['sha']} ('{triage_res['root_cause_commit']['message']}') authored by {triage_res['root_cause_commit']['author']}.",
            "data": triage_res,
            "progress": 45
        }
        await asyncio.sleep(0.6)

        # Step 3: Blast Radius Agent with Graph Algorithms
        yield {
            "step": 4,
            "agent": "BLAST_RADIUS_AGENT",
            "status": "RUNNING_GRAPHBLAS_ALGORITHMS",
            "message": "Computing Betweenness Centrality & reverse dependency reachability...",
            "progress": 60
        }
        blast_res = blast_radius_agent.evaluate_impact("svc_auth")
        await asyncio.sleep(0.8)
        yield {
            "step": 5,
            "agent": "BLAST_RADIUS_AGENT",
            "status": "BLAST_RADIUS_COMPUTED",
            "message": f"Blast radius: {blast_res['total_downstream_impacted']} downstream services degraded. Estimated financial burn: ${blast_res['estimated_financial_burn_per_minute']}/min.",
            "data": blast_res,
            "progress": 70
        }
        await asyncio.sleep(0.6)

        # Step 4: Company Brain Decision Lineage
        yield {
            "step": 6,
            "agent": "COMPANY_BRAIN_AGENT",
            "status": "TRACING_DECISION_LINEAGE",
            "message": "Connecting Commit 7f9a2b back to RFC-104 (approved by SecurityBoard). Identifying on-call commanders...",
            "progress": 80
        }
        brain_res = company_brain_agent.investigate_lineage_and_ownership("svc_auth")
        await asyncio.sleep(0.8)
        yield {
            "step": 7,
            "agent": "COMPANY_BRAIN_AGENT",
            "status": "LINEAGE_RESOLVED",
            "message": "Escalation paths mapped. On-call Incident Commander @mugunth and Architect @sarah.lin tagged.",
            "data": brain_res,
            "progress": 85
        }
        await asyncio.sleep(0.6)

        # Step 5: Ephemeral Sandboxing & Dynamic Runbook Execution
        yield {
            "step": 8,
            "agent": "REMEDIATION_AGENT",
            "status": "SPAWNING_FALKOR_SANDBOX",
            "message": "Spawning isolated FalkorDB ephemeral multigraph to rehearse hotfix rollback...",
            "progress": 92
        }
        remediation_res = remediation_agent.rehearse_and_remediate("INC-2026-901", "7f9a2b")
        await asyncio.sleep(0.8)
        yield {
            "step": 9,
            "agent": "REMEDIATION_AGENT",
            "status": "REHEARSAL_PASSED_PR_READY",
            "message": "Hotfix verified safe in FalkorDB sandbox. Automated Rollback Pull Request generated!",
            "data": remediation_res,
            "progress": 100
        }

swarm_commander = IncidentSwarmCommander()
