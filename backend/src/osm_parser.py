import xml.etree.ElementTree as ET
import json

def load_buildings(filename=None):
    import os
    if filename is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        filename = os.path.join(base_dir, "data", "buildings.json")
    with open(filename, "r") as f:
        return json.load(f)

def get_building_coordinates(name, buildings):
    name = name.strip().lower()
    for building in buildings:
        if name == building["name"].lower() or name in [alias.lower() for alias in building["aliases"]]:
            return (building["lat"], building["lon"])
    return None

def load_open_street_map(filename):
    """
    Load and parse an OpenStreetMap XML file.
    
    :param filename: Path to the OSM file
    :return: Parsed XML root
    """
    try:
        tree = ET.parse(filename)
        root = tree.getroot()
        return root
    except ET.ParseError:
        print("**Error: Unable to load open street map.")
        return None
    
def ReadMapNodes(xml_root, nodes):
    """
    Extract all nodes with latitude and longitude from OSM XML and store in the nodes dict.
    """
    for node in xml_root.findall("node"):
        node_id = node.attrib['id']
        lat = float(node.attrib['lat'])
        lon = float(node.attrib['lon'])
        nodes[node_id] = (lat, lon)

def ReadFootways(xml_root, nodes, footways):
    """
    Extract footway (walkable paths) ways from OSM and store sequences of node IDs in footways list.
    """
    for way in xml_root.findall("way"):
        is_footway = False
        node_refs = []

        for tag in way.findall("tag"):
            if tag.attrib.get("k") == "highway" and tag.attrib.get("v") in {"footway", "path", "pedestrian"}:
                is_footway = True

        if is_footway:
            for nd in way.findall("nd"):
                ref = nd.attrib['ref']
                if ref in nodes:  # only include nodes we have coordinates for
                    node_refs.append(ref)

            if len(node_refs) >= 2:
                footways.append(node_refs)
