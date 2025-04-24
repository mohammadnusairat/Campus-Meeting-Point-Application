from flask import Flask, request, jsonify
from graph import Graph
from dijkstra import dijkstra
from fermat import geodesic_fermat_point
from osm_parser import load_open_street_map, ReadMapNodes, ReadFootways, load_buildings, get_building_coordinates
from geopy.distance import geodesic
import os
from scipy.spatial import KDTree
from flask_cors import CORS
import trie

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILDINGS_FILE = os.path.join(BASE_DIR, "data", "buildings.json")

app = Flask(__name__)
CORS(app)

# global trie for lookup
autocomplete_trie = trie.build_trie_from_buildings(BUILDINGS_FILE)

# Global graph instance
G = Graph()
Nodes = {}  # {id: (lat, lon)}

# Load OSM data
def initialize_data():
    global Nodes, G, node_components
    print("Loading OpenStreetMap data...")

    filename = os.path.join(BASE_DIR, "data", "uic-2024.osm")
    xml_root = load_open_street_map(filename)

    if xml_root is None:
        raise Exception("Error loading OSM data")

    Footways = []
    ReadMapNodes(xml_root, Nodes)
    ReadFootways(xml_root, Nodes, Footways)

    # Initialize graph
    for node_id in Nodes:
        G.add_vertex(node_id)

    # Add edges between consecutive footway nodes
    for footway in Footways:
        for i in range(len(footway) - 1):
            from_node = footway[i]
            to_node = footway[i + 1]
            if from_node in Nodes and to_node in Nodes:
                from_coords = Nodes[from_node]
                to_coords = Nodes[to_node]
                weight = geodesic(from_coords, to_coords).meters
                G.add_edge(from_node, to_node, weight)
                G.add_edge(to_node, from_node, weight)  # bidirectional

    # Compute connected components
    def compute_components(graph):
        visited = set()
        components = {}
        component_id = 0

        for node in graph.get_vertices():
            if node in visited:
                continue
            queue = [node]
            while queue:
                current = queue.pop()
                if current in visited:
                    continue
                visited.add(current)
                components[current] = component_id
                for neighbor in graph.neighbors(current):
                    if neighbor not in visited:
                        queue.append(neighbor)
            component_id += 1

        return components

    node_components = compute_components(G)

    # Find largest component
    from collections import Counter
    component_counts = Counter(node_components.values())
    main_component_id = component_counts.most_common(1)[0][0]

    # Sample some main component nodes for faster lookups
    import random
    main_nodes = [n for n, c in node_components.items() if c ==
                  main_component_id]
    sampled_main = random.sample(main_nodes, min(150, len(main_nodes)))

    # Create KD-Tree for main component
    main_nodes = [n for n, c in node_components.items() if c ==
                  main_component_id]
    main_coords = [Nodes[n] for n in main_nodes if n in Nodes]
    tree = KDTree(main_coords)

    # Map index back to node IDs
    coord_to_node = {Nodes[n]: n for n in main_nodes if n in Nodes}

    # Add artificial edges for disconnected nodes
    for node in G.get_vertices():
        if node_components.get(node) != main_component_id and node in Nodes:
            latlon = Nodes[node]
            distance, index = tree.query(latlon)
            nearest_coords = main_coords[index]
            nearest_node = coord_to_node[nearest_coords]
            dist = geodesic(latlon, nearest_coords).meters
            G.add_edge(node, nearest_node, dist)
            G.add_edge(nearest_node, node, dist)

class UnionFind:
    def __init__(self):
        self.parent = {}

    def find(self, u):
        if self.parent[u] != u:
            self.parent[u] = self.find(self.parent[u])
        return self.parent[u]

    def union(self, u, v):
        u_root = self.find(u)
        v_root = self.find(v)
        if u_root != v_root:
            self.parent[v_root] = u_root

    def add(self, u):
        if u not in self.parent:
            self.parent[u] = u

    def connected_components(self):
        groups = {}
        for u in self.parent:
            root = self.find(u)
            if root not in groups:
                groups[root] = []
            groups[root].append(u)
        return groups

def compute_connected_components_with_union_find(graph):
    uf = UnionFind()

    for u in graph.get_vertices():
        uf.add(u)
        for v in graph.neighbors(u):
            uf.add(v)
            uf.union(u, v)

    components = {}
    for u in graph.get_vertices():
        root = uf.find(u)
        components[u] = root

    return components

initialize_data()
# Right after initialize_data(), add this new global dictionary
node_components = compute_connected_components_with_union_find(G)
# Use buildings json to build trie load_buildings()

def calculate_path_distance(path, Nodes):
    total = 0.0
    for i in range(len(path) - 1):
        if path[i] in Nodes and path[i + 1] in Nodes:
            total += geodesic(Nodes[path[i]], Nodes[path[i + 1]]).meters
    return total

# We’ll assume a standard walking speed of: 1.4 m/s (~5 km/h or 3.1 mph — typical for campus walking pace)
def estimate_walk_time_mins(distance_meters, speed_mps=1.4):
    seconds = distance_meters / speed_mps
    minutes = round(seconds / 60, 1)
    return minutes

def find_nearest_node(graph, lat, lon, nodes):
    """
    Find the nearest node in the graph to a given lat/lon location.
    """
    min_dist = float('inf')
    nearest_node = None

    for node_id, (node_lat, node_lon) in nodes.items():
        d = geodesic((lat, lon), (node_lat, node_lon)).meters
        if d < min_dist:
            min_dist = d
            nearest_node = node_id

    return nearest_node


@app.route("/")
def home():
    return jsonify({"message": "Geodesic Meeting Point API is running!"})

@app.route("/graph/nodes", methods=["GET"])
def get_nodes():
    """
    Retrieve all graph nodes.
    """
    return jsonify({"nodes": Nodes})

@app.route("/graph/edges", methods=["GET"])
def get_edges():
    """
    Retrieve all edges from the graph.
    """
    edges = []
    for node in G.get_vertices():
        for neighbor in G.neighbors(node):
            weight = G.get_weight(node, neighbor)
            edges.append({"from": node, "to": neighbor, "weight": weight})

    return jsonify({"edges": edges})

# Not accepting lat/lon input from user
"""
@app.route("/compute_meeting", methods=["POST"])
def compute_meeting():
    # Compute the best meeting point and paths for three people.
    # Expects a JSON payload with 'locations': [(lat1, lon1), (lat2, lon2), (lat3, lon3)]
    data = request.json
    people_locations = data.get("locations")

    if not people_locations or len(people_locations) != 3:
        return jsonify({"error": "Please provide exactly 3 locations"}), 400

    # Step 1: Compute Geodesic Fermat Point
    fermat_lat, fermat_lon = geodesic_fermat_point(people_locations)

    # Step 2: Find the nearest graph node
    meeting_node = find_nearest_node(G, fermat_lat, fermat_lon, Nodes)

    # Step 3: Compute shortest paths to meeting node
    paths = []
    for person_location in people_locations:
        start_node = find_nearest_node(G, person_location[0], person_location[1], Nodes)
        path = dijkstra(G, start_node, meeting_node)
        paths.append(path)

    return jsonify({
        "fermat_point": {"lat": fermat_lat, "lon": fermat_lon},
        "meeting_node": meeting_node,
        "paths": paths
    })
"""

# Compute meeting (without filters)
"""
@app.route("/compute_meeting_by_buildings", methods=["POST"])
def compute_meeting_by_buildings():
    data = request.json
    building_names = data.get("buildings")

    if not building_names or not isinstance(building_names, list) or len(building_names) < 2:
        return jsonify({"error": "Please provide at least two building names"}), 400

    buildings = load_buildings()
    locations = []

    for name in building_names:
        coords = get_building_coordinates(name, buildings)
        if coords is None:
            return jsonify({"error": f"Building '{name}' not found"}), 404
        locations.append(coords)

    # Compute Fermat point from N users
    fermat_lat, fermat_lon = geodesic_fermat_point(locations)

    # Find closest walkable node to the Fermat point
    meeting_node = find_nearest_node(G, fermat_lat, fermat_lon, Nodes)

    # Map each user to a start node
    start_nodes = [find_nearest_node(G, lat, lon, Nodes) for lat, lon in locations]

    # Run Dijkstra from each person
    paths = [dijkstra(G, start, meeting_node) for start in start_nodes]
    path_distances = [calculate_path_distance(p, Nodes) for p in paths]
    etas = [estimate_walk_time_mins(d) for d in path_distances]

    summaries = [
        f"You will walk ~{eta} minutes ({round(dist)} meters)."
        for eta, dist in zip(etas, path_distances)
    ]

    return jsonify({
        "fermat_point": {"lat": fermat_lat, "lon": fermat_lon},
        "meeting_node": meeting_node,
        "paths": paths,
        "distances_meters": path_distances,
        "etas_minutes": etas,
        "summaries": summaries
    })
"""

@app.route("/compute_meeting_by_buildings_with_filters", methods=["POST"])
def compute_meeting_by_buildings_with_filters():
    data = request.json
    building_names = data.get("buildings", [])
    required_tags = set(tag.lower() for tag in data.get("filters", []))

    if not building_names or not isinstance(building_names, list) or len(building_names) < 2:
        return jsonify({"error": "Please provide at least two building names"}), 400

    buildings = load_buildings()
    locations = []

    for name in building_names:
        coords = get_building_coordinates(name, buildings)
        if coords is None:
            return jsonify({"error": f"Building '{name}' not found"}), 404
        locations.append(coords)

    fermat_lat, fermat_lon = geodesic_fermat_point(locations)

    # Step 1: Filter buildings by required tags
    candidates = []
    for b in buildings:
        tags = [t.lower() for t in b.get("tags", [])]
        if required_tags.intersection(tags):
            dist = geodesic((fermat_lat, fermat_lon), (b["lat"], b["lon"])).meters
            candidates.append((dist, b))

    if not candidates:
        return jsonify({"error": "No buildings match the selected filters."}), 404

    # Step 2: Find the building closest to the Fermat point among matches
    _, best_building = min(candidates, key=lambda x: x[0])
    meeting_coords = (best_building["lat"], best_building["lon"])
    meeting_node = find_nearest_node(G, *meeting_coords, Nodes)

    start_nodes = [find_nearest_node(G, lat, lon, Nodes) for lat, lon in locations]
    paths = [dijkstra(G, start, meeting_node) for start in start_nodes]
    path_distances = [calculate_path_distance(p, Nodes) for p in paths]
    etas = [estimate_walk_time_mins(d) for d in path_distances]
    summaries = [
        f"You will walk ~{eta} minutes ({round(dist)} meters)."
        for eta, dist in zip(etas, path_distances)
    ]

    return jsonify({
        "fermat_point": {"lat": fermat_lat, "lon": fermat_lon},
        "meeting_building": best_building["name"],
        "meeting_node": meeting_node,
        "paths": paths,
        "distances_meters": path_distances,
        "etas_minutes": etas,
        "summaries": summaries,
        "filters_applied": list(required_tags)
    })

@app.route("/autocomplete")
def autocomplete():
    prefix = request.args.get("prefix", "").strip().lower()
    filters = request.args.get("filters", "")
    # Split the comma-separated filters into a list
    filters_list = filters.split(",") if filters else []
    print(f"Prefix: {prefix}")
    print(f"Filters: {filters_list}")
    # Check if prefix is not empty
    if not prefix:
        return jsonify([])
    
    result = autocomplete_trie.search(prefix, filters_list)
    # just to show filters work
    print(len(result))
    return jsonify(result)

@app.route("/building_info")
def building_info():
    name = request.args.get("name", "").strip().lower()
    if not name:
        return jsonify({"error": "Missing building name"}), 400

    buildings = load_buildings()
    for b in buildings:
        if name == b["name"].lower() or name in [alias.lower() for alias in b.get("aliases", [])]:
            return jsonify({
                "name": b["name"],
                "lat": b["lat"],
                "lon": b["lon"],
                "aliases": b.get("aliases", []),
                "tags": b.get("tags", [])
            })

    return jsonify({"error": f"Building '{name}' not found"}), 404

@app.route("/buildings_by_filter")
def buildings_by_filter():
    tag = request.args.get("type", "").strip().lower()
    if not tag:
        # No filter specified; return all buildings
        return jsonify(load_buildings())

    buildings = load_buildings()
    filtered = []

    for b in buildings:
        tags = b.get("tags", [])
        if any(tag == t.lower() for t in tags):
            filtered.append({
                "name": b["name"],
                "lat": b["lat"],
                "lon": b["lon"],
                "aliases": b.get("aliases", []),
                "tags": tags
            })

    return jsonify(filtered)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
