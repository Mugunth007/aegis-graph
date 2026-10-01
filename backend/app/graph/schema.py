from enum import Enum
from typing import Dict, List, Any
from pydantic import BaseModel

class NodeLabel(str, Enum):
    SERVICE = "Service"
    DATABASE = "Database"
    POD = "Pod"
    COMMIT = "Commit"
    ENGINEER = "Engineer"
    INCIDENT = "Incident"
    ALERT = "Alert"
    IAM_ROLE = "IAMRole"
    DECISION = "Decision"
    RUNBOOK_STEP = "RunbookStep"
    TEAM = "Team"

class RelType(str, Enum):
    DEPENDS_ON = "DEPENDS_ON"
    CONNECTS_TO = "CONNECTS_TO"
    RUNS_ON = "RUNS_ON"
    DEPLOYED_TO = "DEPLOYED_TO"
    AUTHORED_BY = "AUTHORED_BY"
    TRIGGERED_BY = "TRIGGERED_BY"
    AFFECTS = "AFFECTS"
    ASSUMES_ROLE = "ASSUMES_ROLE"
    ENFORCED_IN = "ENFORCED_IN"
    DISCUSSED_IN = "DISCUSSED_IN"
    ON_SUCCESS = "ON_SUCCESS"
    ON_FAILURE = "ON_FAILURE"
    MEMBER_OF = "MEMBER_OF"

class NodeData(BaseModel):
    id: str
    label: str
    name: str
    properties: Dict[str, Any] = {}

class EdgeData(BaseModel):
    source: str
    target: str
    type: str
    properties: Dict[str, Any] = {}

class GraphTopology(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]
