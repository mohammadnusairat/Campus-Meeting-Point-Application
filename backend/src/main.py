from graph import Graph
from dijkstra import dijkstra
from fermat import geodesic_fermat_point
from osm_parser import load_open_street_map, ReadMapNodes, ReadFootways
from geopy.distance import geodesic

def find_nearest_node(graph, lat, lon, nodes):
    """
    Find the nearest node in the graph to a given lat/lon location.
    
    :param graph: Graph object containing nodes
    :param lat: Latitude of the point
    :param lon: Longitude of the point
    :param nodes: Dictionary of nodes {node_id: (lat, lon)}
    :return: Node ID closest to (lat, lon)
    """
    min_dist = float('inf')
    nearest_node = None
    
    for node_id, (node_lat, node_lon) in nodes.items():
        d = geodesic((lat, lon), (node_lat, node_lon)).meters
        if d < min_dist:
            min_dist = d
            nearest_node = node_id

    return nearest_node

def compute_meeting_point(graph, nodes, people_locations):
    """
    Find the best meeting location given 3 people's locations.
    
    :param graph: Graph object
    :param nodes: Dictionary {node_id: (lat, lon)}
    :param people_locations: List of three (lat, lon) tuples
    :return: Shortest paths to the meeting location for each person
    """
    fermat_lat, fermat_lon = geodesic_fermat_point(people_locations)
    
    meeting_node = find_nearest_node(graph, fermat_lat, fermat_lon, nodes)
    
    if meeting_node is None:
        print("⚠️ Error: No valid meeting node found in the graph!")
        return None, []

    paths = []
    for i, person_location in enumerate(people_locations):
        start_node = find_nearest_node(graph, person_location[0], person_location[1], nodes)
        
        if start_node is None:
            print(f"⚠️ Error: No valid start node found for person {i+1}!")
            paths.append([])
            continue  # Skip this person's path

        path = dijkstra(graph, start_node, meeting_node)
        
        if not path:
            print(f"⚠️ Warning: No valid path found for person {i+1}!")
        
        paths.append(path)

    return meeting_node, paths


def main():
    print("** Finding Best Meeting Location **")

    filename = r"../data/uic-2024.osm"
    xml_root = load_open_street_map(filename)

    if xml_root is None:
        return
    
    Nodes = {}
    Footways = []

    ReadMapNodes(xml_root, Nodes)
    ReadFootways(xml_root, Nodes, Footways)

    G = Graph()
    for node_id in Nodes:
        G.add_vertex(node_id)

    for footway in Footways:
        for i in range(len(footway) - 1):
            from_node = footway[i]
            to_node = footway[i + 1]
            if from_node in Nodes and to_node in Nodes:
                from_coords = Nodes[from_node]
                to_coords = Nodes[to_node]
                weight = geodesic(from_coords, to_coords).meters
                G.add_edge(from_node, to_node, weight)
                G.add_edge(to_node, from_node, weight)


    people_locations = [
        (41.8708, -87.6505),
        (41.8721, -87.6585),
        (41.8743, -87.6527)
    ]

    meeting_node, paths = compute_meeting_point(G, Nodes, people_locations)

    print("Meeting Node:", meeting_node)
    for i, path in enumerate(paths):
        print(f"Path for Person {i+1}: {path}")

    print("** Done **")

if __name__ == "__main__":
    main()
