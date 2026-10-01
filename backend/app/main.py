import json
import asyncio
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.graph.falkor_client import falkor_manager
from app.graph.seed_data import seed_enterprise_graph, INITIAL_GRAPH_DATA
from app.graph.algorithms import graph_algorithms
from app.agents.swarm import swarm_commander
from app.mcp.falkor_mcp_server import falkor_mcp
from app.config import settings

app = FastAPI(
    title="AEGIS-GRAPH Core Engine",
    description="Autonomous Enterprise Blast-Radius & Self-Healing Incident Mesh powered by FalkorDB",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize connection and seed initial topology
    seed_enterprise_graph()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "falkordb_connected": falkor_manager.is_connected,
        "master_graph": settings.MASTER_GRAPH
    }

@app.get("/api/graph/topology")
def get_graph_topology(graph_name: str = settings.MASTER_GRAPH):
    """
    Returns the complete node and edge topology for visual graph rendering.
    """
    # Return topology from FalkorDB or fallback proxy
    if falkor_manager.is_connected and falkor_manager._client:
        try:
            g = falkor_manager.get_graph(graph_name)
            node_res = g.query("MATCH (n) RETURN n.id AS id, labels(n)[0] AS label, n.name AS name, properties(n) AS properties")
            nodes = []
            for r in node_res.result_set:
                nodes.append({
                    "id": r[0] or r[2],
                    "label": r[1],
                    "name": r[2],
                    "properties": r[3] or {}
                })
                
            edge_res = g.query("MATCH (a)-[r]->(b) RETURN a.id AS source, b.id AS target, type(r) AS type, properties(r) AS properties")
            edges = []
            for r in edge_res.result_set:
                edges.append({
                    "source": r[0],
                    "target": r[1],
                    "type": r[2],
                    "properties": r[3] or {}
                })
            return {"nodes": nodes, "edges": edges, "source": "falkordb_native"}
        except Exception:
            pass

    # In-memory proxy data
    data = falkor_manager._in_memory_graphs.get(graph_name, INITIAL_GRAPH_DATA)
    return {"nodes": data["nodes"], "edges": data["edges"], "source": "memory_proxy"}

@app.get("/api/graph/centrality")
def get_centrality(graph_name: str = settings.MASTER_GRAPH):
    """Returns Betweenness Centrality rankings to show critical choke points."""
    return graph_algorithms.compute_betweenness_centrality(graph_name)

@app.get("/api/graph/blast-radius")
def get_blast_radius(node_id: str = "svc_auth"):
    """Calculates algorithmic blast radius."""
    return graph_algorithms.compute_blast_radius(node_id)

@app.get("/api/incident/stream")
async def stream_incident(alert_id: str = "ALERT-504-GATEWAY"):
    """
    Server-Sent Events (SSE) stream delivering real-time agent swarm reasoning.
    """
    async def event_generator():
        async for update in swarm_commander.execute_autonomous_incident_workflow(alert_id):
            yield f"data: {json.dumps(update)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

class CypherQueryRequest(BaseModel):
    query: str
    graph: Optional[str] = settings.MASTER_GRAPH

@app.post("/api/graph/query")
def execute_cypher(req: CypherQueryRequest):
    """Executes arbitrary openCypher for agent or user inspection."""
    return falkor_manager.query(req.graph, req.query)

@app.get("/api/mcp/tools")
def get_mcp_tools():
    """Lists MCP tools available to agents."""
    return falkor_mcp.list_tools()

class MCPCallRequest(BaseModel):
    tool: str
    arguments: Dict[str, Any]

@app.post("/api/mcp/call")
def call_mcp_tool(req: MCPCallRequest):
    """Invokes an MCP tool directly."""
    try:
        res = falkor_mcp.call_tool(req.tool, req.arguments)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
