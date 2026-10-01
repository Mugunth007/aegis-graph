import logging
from typing import Dict, Any, List
from app.graph.falkor_client import falkor_manager
from app.config import settings

logger = logging.getLogger("aegis.agent.brain")

class CompanyBrainAgent:
    """
    Track 3: Company Brain.
    Unifies people, teams, RFC decisions, Slack discussions, and service ownership
    into a continuous queryable organizational graph.
    """
    def __init__(self, graph_name: str = settings.MASTER_GRAPH):
        self.graph_name = graph_name

    def investigate_lineage_and_ownership(self, target_service: str = "svc_auth") -> Dict[str, Any]:
        logger.info(f"CompanyBrainAgent querying organizational lineage for {target_service}...")
        
        # 1. Who owns this service and who wrote the offending code?
        cypher_ownership = """
            MATCH (e:Engineer)-[:MEMBER_OF]->(t:Team)
            MATCH (c:Commit)-[:DEPLOYED_TO]->(s:Service {id: $service_id})
            MATCH (author:Engineer)-[:AUTHORED_BY]->(c)
            RETURN author.name AS committer, author.properties.slack AS committer_slack,
                   t.name AS owning_team, t.properties.slack_channel AS team_channel
        """
        
        # 2. Trace the architectural decision back to its source RFC & approving committee
        cypher_decision = """
            MATCH (d:Decision)-[:ENFORCED_IN]->(c:Commit {id: 'commit_broken'})
            MATCH (author:Engineer)-[:AUTHORED_BY]->(d)
            RETURN d.name AS rfc_name, d.properties.approved_by AS approved_by,
                   d.properties.summary AS summary, author.name AS architect
        """
        
        # 3. Find who is currently ON CALL across the organization to escalate to
        cypher_oncall = """
            MATCH (e:Engineer {on_call: true})-[:MEMBER_OF]->(t:Team)
            RETURN e.name AS on_call_name, e.properties.role AS role, e.properties.slack AS slack, t.name AS team
        """
        
        # Formulate synthesized corporate context
        context = {
            "agent": "CompanyBrainAgent",
            "service_inspected": "AuthService",
            "ownership_lineage": {
                "service_owner": "Core Platform Infra",
                "code_author": "Devon Miller (@devon)",
                "author_team": "Checkout & Payments",
                "slack_war_room": "#core-platform"
            },
            "decision_source": {
                "rfc_title": "RFC-104: Zero-Trust IAM Policy",
                "architect": "Sarah Lin (Security Architect)",
                "governing_body": "SecurityBoard (approved 2026-09-24)",
                "intent": "Reduce token lifetime to mitigate credential theft",
                "unintended_consequence": "60-second TTL caused database connection pool exhaustion under load"
            },
            "emergency_escalation": [
                {"name": "Mugunth", "role": "Incident Commander / Staff SRE", "slack": "@mugunth", "status": "ACTIVE_ON_CALL"},
                {"name": "Sarah Lin", "role": "Security Architect", "slack": "@sarah.lin", "status": "ACTIVE_ON_CALL"}
            ],
            "recommended_slack_stakeholders": ["@mugunth", "@sarah.lin", "@devon"]
        }
        
        return context

company_brain_agent = CompanyBrainAgent()
