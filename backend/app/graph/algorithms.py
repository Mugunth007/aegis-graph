import networkx as nx
from typing import Dict, Any, List, Optional
from app.graph.falkor_client import falkor_manager
from app.config import settings

class GraphAlgorithms:
    """
    Executes graph algorithms (Betweenness Centrality, Shortest Path, 
    Blast Radius calculation) directly over FalkorDB data models.
    """

    @staticmethod
    def get_nx_graph(graph_name: str = settings.MASTER_GRAPH) -> nx.DiGraph:
        """Constructs a NetworkX directed graph from FalkorDB graph state."""
        G = nx.DiGraph()
        
        # Pull all nodes and edges
        if falkor_manager.is_connected and falkor_manager._client:
            g = falkor_manager.get_graph(graph_name)
            node_res = g.query("MATCH (n) RETURN n.id AS id, labels(n)[0] AS lbl, n.name AS name, properties(n) AS props")
            for row in node_res.result_set:
                nid, lbl, name, props = row[0], row[1], row[2], row[3]
                G.add_node(nid, label=lbl, name=name, **(props or {}))
                
            edge_res = g.query("MATCH (a)-[r]->(b) RETURN a.id AS src, b.id AS dst, type(r) AS rel, properties(r) AS props")
            for row in edge_res.result_set:
                src, dst, rel, props = row[0], row[1], row[2], row[3]
                G.add_edge(src, dst, rel=rel, **(props or {}))
        else:
            # In memory proxy
            data = falkor_manager._in_memory_graphs.get(graph_name, {})
            for n in data.get("nodes", []):
                G.add_node(n["id"], label=n["label"], name=n["name"], **n.get("properties", {}))
            for e in data.get("edges", []):
                G.add_edge(e["source"], e["target"], rel=e["type"], **e.get("properties", {}))
                
        return G

    @classmethod
    def compute_betweenness_centrality(cls, graph_name: str = settings.MASTER_GRAPH) -> List[Dict[str, Any]]:
        """
        Calculates Betweenness Centrality to find single points of failure (choke points).
        High score = critical choke point in enterprise topology.
        """
        G = cls.get_nx_graph(graph_name)
        if len(G) == 0:
            return []
            
        centrality = nx.betweenness_centrality(G)
        ranked = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        
        results = []
        for node_id, score in ranked[:10]:
            node_data = G.nodes[node_id]
            results.append({
                "node_id": node_id,
                "name": node_data.get("name", node_id),
                "label": node_data.get("label", "Unknown"),
                "centrality_score": round(score, 4),
                "is_choke_point": score > 0.15
            })
        return results

    @classmethod
    def compute_shortest_path(cls, source_id: str, target_id: str, graph_name: str = settings.MASTER_GRAPH) -> Optional[Dict[str, Any]]:
        """
        Finds the shortest causal path between a root symptom/alert and a potential culprit.
        Used by the Triage Agent for deterministic multi-hop reasoning.
        """
        # First try Cypher shortestPath if native FalkorDB is live
        if falkor_manager.is_connected and falkor_manager._client:
            try:
                g = falkor_manager.get_graph(graph_name)
                cypher = """
                    MATCH p = shortestPath((a {id: $source})-[:DEPENDS_ON|CONNECTS_TO|DEPLOYED_TO|TRIGGERED_BY*]-(b {id: $target}))
                    RETURN [n in nodes(p) | n.id] AS path_nodes, [r in relationships(p) | type(r)] AS path_rels
                """
                res = g.query(cypher, {"source": source_id, "target": target_id})
                if res.result_set:
                    return {
                        "path_nodes": res.result_set[0][0],
                        "relationships": res.result_set[0][1],
                        "hops": len(res.result_set[0][0]) - 1,
                        "source": "falkordb_cypher_native"
                    }
            except Exception:
                pass

        # NetworkX fallback
        G = cls.get_nx_graph(graph_name)
        U = G.to_undirected()
        try:
            path = nx.shortest_path(U, source=source_id, target=target_id)
            return {
                "path_nodes": path,
                "hops": len(path) - 1,
                "source": "algorithmic_matrix_eval"
            }
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    @classmethod
    def compute_blast_radius(cls, root_node_id: str, max_depth: int = 4, graph_name: str = settings.MASTER_GRAPH) -> Dict[str, Any]:
        """
        Calculates all upstream and downstream services, databases, and teams
        impacted if root_node_id fails or is modified.
        """
        G = cls.get_nx_graph(graph_name)
        if root_node_id not in G:
            return {"error": f"Node {root_node_id} not found", "impacted_count": 0, "impacted_nodes": []}

        # Downstream dependencies (what breaks if root breaks)
        # In a dependency graph: A -> DEPENDS_ON -> B. If B fails, A is broken!
        # Reverse edges to find who depends on root_node_id
        R = G.reverse(copy=True)
        
        lengths = nx.single_source_shortest_path_length(R, source=root_node_id, cutoff=max_depth)
        
        impacted = []
        tier1_affected = 0
        
        for nid, depth in lengths.items():
            if nid == root_node_id:
                continue
            data = G.nodes[nid]
            tier = data.get("tier", 3)
            if tier == 1 or tier == 0:
                tier1_affected += 1
                
            impacted.append({
                "id": nid,
                "name": data.get("name", nid),
                "label": data.get("label", "Unknown"),
                "depth": depth,
                "tier": tier,
                "status": data.get("status", "HEALTHY")
            })

        return {
            "root_node": root_node_id,
            "impacted_count": len(impacted),
            "tier1_services_affected": tier1_affected,
            "risk_level": "CRITICAL" if tier1_affected > 0 else "ELEVATED",
            "impacted_nodes": sorted(impacted, key=lambda x: x["depth"])
        }

graph_algorithms = GraphAlgorithms()
