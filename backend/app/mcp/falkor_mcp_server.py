import json
from typing import Dict, Any, List
from app.graph.falkor_client import falkor_manager
from app.graph.algorithms import graph_algorithms
from app.config import settings

class FalkorMCPServer:
    """
    Model Context Protocol (MCP) server implementation exposing FalkorDB
    graph operations and native graph algorithms as standard MCP tools.
    """

    @classmethod
    def list_tools(cls) -> List[Dict[str, Any]]:
        return [
            {
                "name": "falkor_query_cypher",
                "description": "Execute an openCypher query directly against FalkorDB graph instances.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "graph_name": {"type": "string", "default": settings.MASTER_GRAPH},
                        "cypher": {"type": "string", "description": "The openCypher query to execute"}
                    },
                    "required": ["cypher"]
                }
            },
            {
                "name": "falkor_compute_blast_radius",
                "description": "Calculate upstream & downstream services and business risk if a given entity fails.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "node_id": {"type": "string", "description": "The root node ID to evaluate"},
                        "max_depth": {"type": "integer", "default": 4}
                    },
                    "required": ["node_id"]
                }
            },
            {
                "name": "falkor_find_shortest_path",
                "description": "Find the deterministic causal multi-hop path between two entities in the graph.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "source_id": {"type": "string"},
                        "target_id": {"type": "string"}
                    },
                    "required": ["source_id", "target_id"]
                }
            },
            {
                "name": "falkor_clone_sandbox_graph",
                "description": "Clone master graph into an ephemeral isolated multigraph for safe action rehearsal.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "sandbox_name": {"type": "string"}
                    },
                    "required": ["sandbox_name"]
                }
            }
        ]

    @classmethod
    def call_tool(cls, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if name == "falkor_query_cypher":
            graph = arguments.get("graph_name", settings.MASTER_GRAPH)
            cypher = arguments["cypher"]
            return falkor_manager.query(graph, cypher)

        elif name == "falkor_compute_blast_radius":
            node_id = arguments["node_id"]
            depth = arguments.get("max_depth", 4)
            return graph_algorithms.compute_blast_radius(node_id, depth)

        elif name == "falkor_find_shortest_path":
            src = arguments["source_id"]
            dst = arguments["target_id"]
            return graph_algorithms.compute_shortest_path(src, dst) or {"error": "No path found"}

        elif name == "falkor_clone_sandbox_graph":
            sandbox = arguments["sandbox_name"]
            success = falkor_manager.clone_graph(settings.MASTER_GRAPH, sandbox)
            return {"status": "cloned", "sandbox_graph": sandbox, "success": success}

        raise ValueError(f"Unknown MCP tool: {name}")

falkor_mcp = FalkorMCPServer()
