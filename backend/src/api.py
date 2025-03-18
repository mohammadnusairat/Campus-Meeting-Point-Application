from flask import Flask, request, jsonify
from graph import Graph
from dijkstra import dijkstra
from fermat import geodesic_fermat_point
from osm_parser import load_open_street_map
from geopy.distance import geodesic

app = Flask(__name__)

# Global graph instance
G = Graph()
Nodes = {}  # {id: (lat, lon)}

# Load OSM data
def initialize_data():
    global Nodes, G
    print("Loading OpenStreetMap data...")
    
    filename = "../data/uic-2024.osm"
    xml_root = load_open_street_map(filename)

    if xml_root is None:
        raise Exception("Error loading OSM data")
    
    # Example: Nodes should be populated by parsing OSM data
    # ReadMapNodes(xml_root, Nodes)
    # ReadFootways(xml_root, Nodes, Footways)
    # ReadUniversityBuildings(xml_root, Nodes, Buildings)

    for node_id, coords in Nodes.items():
        G.add_vertex(node_id)

initialize_data()


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


@app.route("/compute_meeting", methods=["POST"])
def compute_meeting():
    """
    Compute the best meeting point and paths for three people.
    Expects a JSON payload with 'locations': [(lat1, lon1), (lat2, lon2), (lat3, lon3)]
    """
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
