import xml.etree.ElementTree as ET

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
