import heapq

def dijkstra(graph, start, target, ignore_nodes=set()):
    """
    Compute the shortest path from start to target using Dijkstra's algorithm.
    
    :param graph: Graph object
    :param start: Starting node
    :param target: Destination node
    :param ignore_nodes: Set of nodes to ignore
    :return: List representing the shortest path
    """
    INF = float('inf')
    dist = {vertex: INF for vertex in graph.get_vertices()}
    predV = {vertex: None for vertex in graph.get_vertices()}
    
    if start not in dist or target not in dist:
        print("⚠️ Error: Start or target node not found in graph!")
        return []

    dist[start] = 0
    pq = [(0, start)]  # (distance, node)
    
    while pq:
        current_dist, current_v = heapq.heappop(pq)

        if current_v in ignore_nodes and current_v not in {start, target}:
            continue

        if current_v == target:
            break

        for neighbor in graph.neighbors(current_v):
            weight = graph.get_weight(current_v, neighbor)
            new_dist = current_dist + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                predV[neighbor] = current_v
                heapq.heappush(pq, (new_dist, neighbor))

    # Reconstruct path
    path = []
    v = target
    while v is not None:
        path.append(v)
        v = predV[v]

    if not path or path[-1] != start:
        print(f"⚠️ Error: No valid path found from {start} to {target}!")
        return []

    return path[::-1]

