import logging
from typing import Dict, Any, List
from app.graph.falkor_client import falkor_manager
from app.config import settings

logger = logging.getLogger("aegis.seed")

# Canonical enterprise mock data representation
INITIAL_GRAPH_DATA: Dict[str, Any] = {
    "nodes": [
        # Services
        {"id": "svc_apigateway", "label": "Service", "name": "ApiGateway", "properties": {"tier": 0, "status": "DEGRADED", "latency_ms": 3200, "region": "us-east-1"}},
        {"id": "svc_checkout", "label": "Service", "name": "CheckoutService", "properties": {"tier": 1, "status": "FAILING", "latency_ms": 4800, "lang": "Go"}},
        {"id": "svc_auth", "label": "Service", "name": "AuthService", "properties": {"tier": 1, "status": "CRITICAL", "latency_ms": 5100, "lang": "Python"}},
        {"id": "svc_payment", "label": "Service", "name": "PaymentService", "properties": {"tier": 1, "status": "WARNING", "latency_ms": 1100, "lang": "Java"}},
        {"id": "svc_order", "label": "Service", "name": "OrderService", "properties": {"tier": 1, "status": "DEGRADED", "latency_ms": 2800, "lang": "Node.js"}},
        {"id": "svc_inventory", "label": "Service", "name": "InventoryService", "properties": {"tier": 2, "status": "HEALTHY", "latency_ms": 85, "lang": "Go"}},
        {"id": "svc_notification", "label": "Service", "name": "NotificationService", "properties": {"tier": 3, "status": "HEALTHY", "latency_ms": 120, "lang": "Python"}},

        # Databases
        {"id": "db_user_creds", "label": "Database", "name": "UserCredentialsDB", "properties": {"engine": "PostgreSQL", "port": 5432, "status": "HEALTHY"}},
        {"id": "db_payment_ledger", "label": "Database", "name": "PaymentLedger", "properties": {"engine": "Redis", "port": 6379, "status": "HEALTHY"}},
        {"id": "db_inventory", "label": "Database", "name": "InventoryDB", "properties": {"engine": "DynamoDB", "status": "HEALTHY"}},

        # Pods / Compute
        {"id": "pod_auth_1", "label": "Pod", "name": "auth-pod-7b94", "properties": {"cpu_percent": 98.4, "restarts": 14, "phase": "CrashLoopBackOff"}},
        {"id": "pod_auth_2", "label": "Pod", "name": "auth-pod-9c12", "properties": {"cpu_percent": 97.1, "restarts": 12, "phase": "CrashLoopBackOff"}},
        {"id": "pod_checkout_1", "label": "Pod", "name": "checkout-pod-3d44", "properties": {"cpu_percent": 74.0, "restarts": 2, "phase": "Running"}},

        # IAM & Security
        {"id": "iam_auth_proxy", "label": "IAMRole", "name": "AuthProxyServiceRole", "properties": {"arn": "arn:aws:iam::123456789:role/AuthProxyServiceRole", "max_session_s": 60}},
        {"id": "iam_payment_vault", "label": "IAMRole", "name": "PaymentVaultRole", "properties": {"arn": "arn:aws:iam::123456789:role/PaymentVaultRole", "max_session_s": 3600}},

        # Code & Commits
        {"id": "commit_broken", "label": "Commit", "name": "7f9a2b", "properties": {"sha": "7f9a2b", "message": "feat(iam): enforce zero-trust session expiry RFC-104", "author": "Devon", "timestamp": "12 mins ago"}},
        {"id": "commit_payment", "label": "Commit", "name": "8a1c3d", "properties": {"sha": "8a1c3d", "message": "fix: update stripe webhook handler", "author": "Elena", "timestamp": "3 hours ago"}},

        # People & Teams
        {"id": "eng_devon", "label": "Engineer", "name": "Devon Miller", "properties": {"role": "Senior Platform Eng", "slack": "@devon", "on_call": False}},
        {"id": "eng_sarah", "label": "Engineer", "name": "Sarah Lin", "properties": {"role": "Security Architect", "slack": "@sarah.lin", "on_call": True}},
        {"id": "eng_mugunth", "label": "Engineer", "name": "Mugunth", "properties": {"role": "Incident Commander / Staff SRE", "slack": "@mugunth", "on_call": True}},
        {"id": "eng_elena", "label": "Engineer", "name": "Elena Rostova", "properties": {"role": "Payments Lead", "slack": "@elena", "on_call": False}},
        {"id": "team_core_infra", "label": "Team", "name": "Core Platform Infra", "properties": {"slack_channel": "#core-platform"}},
        {"id": "team_checkout", "label": "Team", "name": "Checkout & Payments", "properties": {"slack_channel": "#checkout-war-room"}},

        # Decisions & RFCs
        {"id": "dec_rfc104", "label": "Decision", "name": "RFC-104: Zero-Trust IAM Policy", "properties": {"approved_by": "SecurityBoard", "date": "2026-09-24", "summary": "Revoke legacy wildcard IAM and reduce STS token ttl"}},
        {"id": "dec_rfc98", "label": "Decision", "name": "RFC-98: Checkout Decoupling", "properties": {"approved_by": "ArchCouncil", "date": "2026-08-15"}},

        # Active Alerts
        {"id": "alert_504", "label": "Alert", "name": "ALERT-504-GATEWAY", "properties": {"severity": "SEV-1", "source": "Datadog", "metric": "http.504_rate > 45%"}},
        {"id": "alert_auth_timeout", "label": "Alert", "name": "ALERT-AUTH-TIMEOUT", "properties": {"severity": "SEV-1", "source": "CloudWatch", "metric": "auth.latency > 4000ms"}},

        # Procedural Memory (Runbook Steps)
        {"id": "rb_triage", "label": "RunbookStep", "name": "Step 1: Check Pod CPU & Restarts", "properties": {"automated": True, "action": "GET_METRICS"}},
        {"id": "rb_rollback", "label": "RunbookStep", "name": "Step 2: Rollback Target Commit", "properties": {"automated": True, "action": "GIT_REVERT"}},
        {"id": "rb_scale", "label": "RunbookStep", "name": "Step 2b: Scale Replica Count", "properties": {"automated": True, "action": "K8S_SCALE"}}
    ],
    "edges": [
        # Microservice dependencies
        {"source": "svc_apigateway", "target": "svc_checkout", "type": "DEPENDS_ON", "properties": {"protocol": "HTTP/2", "critical": True}},
        {"source": "svc_apigateway", "target": "svc_auth", "type": "DEPENDS_ON", "properties": {"protocol": "gRPC", "critical": True}},
        {"source": "svc_checkout", "target": "svc_auth", "type": "DEPENDS_ON", "properties": {"protocol": "gRPC", "critical": True}},
        {"source": "svc_checkout", "target": "svc_payment", "type": "DEPENDS_ON", "properties": {"protocol": "HTTP", "critical": True}},
        {"source": "svc_checkout", "target": "svc_order", "type": "DEPENDS_ON", "properties": {"protocol": "gRPC", "critical": False}},
        {"source": "svc_checkout", "target": "svc_inventory", "type": "DEPENDS_ON", "properties": {"protocol": "HTTP", "critical": True}},
        {"source": "svc_order", "target": "svc_notification", "type": "DEPENDS_ON", "properties": {"protocol": "Kafka", "critical": False}},

        # Database connections
        {"source": "svc_auth", "target": "db_user_creds", "type": "CONNECTS_TO", "properties": {"pool_size": 50, "ssl": True}},
        {"source": "svc_payment", "target": "db_payment_ledger", "type": "CONNECTS_TO", "properties": {"pool_size": 20, "ssl": True}},
        {"source": "svc_inventory", "target": "db_inventory", "type": "CONNECTS_TO", "properties": {"region": "us-east-1"}},

        # Pods hosting services
        {"source": "pod_auth_1", "target": "svc_auth", "type": "RUNS_ON", "properties": {"cluster": "prod-useast1-eks"}},
        {"source": "pod_auth_2", "target": "svc_auth", "type": "RUNS_ON", "properties": {"cluster": "prod-useast1-eks"}},
        {"source": "pod_checkout_1", "target": "svc_checkout", "type": "RUNS_ON", "properties": {"cluster": "prod-useast1-eks"}},

        # IAM relations
        {"source": "svc_auth", "target": "iam_auth_proxy", "type": "ASSUMES_ROLE", "properties": {"scope": "DBReadWrite"}},
        {"source": "svc_payment", "target": "iam_payment_vault", "type": "ASSUMES_ROLE", "properties": {"scope": "VaultAccess"}},

        # Commit lineage
        {"source": "commit_broken", "target": "svc_auth", "type": "DEPLOYED_TO", "properties": {"pipeline": "prod-deploy-ci", "env": "production"}},
        {"source": "commit_payment", "target": "svc_payment", "type": "DEPLOYED_TO", "properties": {"pipeline": "prod-deploy-ci", "env": "production"}},
        {"source": "eng_devon", "target": "commit_broken", "type": "AUTHORED_BY", "properties": {"branch": "main"}},
        {"source": "eng_elena", "target": "commit_payment", "type": "AUTHORED_BY", "properties": {"branch": "main"}},

        # Org & Team membership
        {"source": "eng_devon", "target": "team_checkout", "type": "MEMBER_OF", "properties": {}},
        {"source": "eng_sarah", "target": "team_core_infra", "type": "MEMBER_OF", "properties": {}},
        {"source": "eng_mugunth", "target": "team_core_infra", "type": "MEMBER_OF", "properties": {}},
        {"source": "eng_elena", "target": "team_checkout", "type": "MEMBER_OF", "properties": {}},

        # Decisions & Corporate Context
        {"source": "dec_rfc104", "target": "commit_broken", "type": "ENFORCED_IN", "properties": {}},
        {"source": "eng_sarah", "target": "dec_rfc104", "type": "AUTHORED_BY", "properties": {}},

        # Alerts to Services
        {"source": "alert_504", "target": "svc_apigateway", "type": "TRIGGERED_BY", "properties": {}},
        {"source": "alert_auth_timeout", "target": "svc_auth", "type": "TRIGGERED_BY", "properties": {}},

        # Procedural Runbook links
        {"source": "rb_triage", "target": "rb_rollback", "type": "ON_SUCCESS", "properties": {"condition": "cause_identified"}},
        {"source": "rb_rollback", "target": "rb_scale", "type": "ON_FAILURE", "properties": {"condition": "rollback_failed"}}
    ]
}


def seed_enterprise_graph(graph_name: str = settings.MASTER_GRAPH) -> Dict[str, Any]:
    """
    Populates FalkorDB with the full enterprise topology.
    Executes Cypher batch inserts and registers in-memory fallback.
    """
    logger.info(f"Seeding graph '{graph_name}' with enterprise digital twin...")
    
    # Register fallback
    falkor_manager._in_memory_graphs[graph_name] = INITIAL_GRAPH_DATA
    
    if not falkor_manager.is_connected or not falkor_manager._client:
        logger.info(f"FalkorDB native unavailable; loaded {len(INITIAL_GRAPH_DATA['nodes'])} nodes into memory proxy.")
        return {"status": "seeded_in_memory", "nodes": len(INITIAL_GRAPH_DATA["nodes"]), "edges": len(INITIAL_GRAPH_DATA["edges"])}
        
    try:
        g = falkor_manager.get_graph(graph_name)
        # Clear existing
        try:
            g.delete()
        except Exception:
            pass
        g = falkor_manager.get_graph(graph_name)

        # 1. Create Nodes
        for node in INITIAL_GRAPH_DATA["nodes"]:
            lbl = node["label"]
            nid = node["id"]
            name = node["name"]
            props = node.get("properties", {})
            props["id"] = nid
            props["name"] = name
            
            # Parametrized Cypher node creation
            query = f"CREATE (n:{lbl} $props)"
            g.query(query, {"props": props})

        # 2. Create Edges
        for edge in INITIAL_GRAPH_DATA["edges"]:
            src = edge["source"]
            dst = edge["target"]
            rel = edge["type"]
            props = edge.get("properties", {})
            
            query = f"""
                MATCH (a {{id: $src}}), (b {{id: $dst}})
                CREATE (a)-[:{rel} $props]->(b)
            """
            g.query(query, {"src": src, "dst": dst, "props": props})

        logger.info(f"Successfully seeded native FalkorDB graph '{graph_name}'!")
        return {"status": "seeded_falkordb_native", "nodes": len(INITIAL_GRAPH_DATA["nodes"]), "edges": len(INITIAL_GRAPH_DATA["edges"])}
    except Exception as e:
        logger.error(f"Error seeding native FalkorDB: {e}")
        return {"status": "seeded_with_fallback", "error": str(e)}
