import json

class Node:
    def __init__(self, ch=None):
        self.ch = ch
        # on final char, save attributes of building
        self.isWord = False
        self.children = {}
        self.tags = []
        self.aliases = []
        self.original_name = None
        self.lat = None 
        self.lon = None 

class Trie:
    def __init__(self):
        self.root = Node()

    def insert(self, word, tags, aliases, lat=None, lon=None, original_name=None):
        curr_node = self.root
        for char in word:
            lower_char = char.lower()  
            if lower_char not in curr_node.children:
                curr_node.children[lower_char] = Node(char)  
            curr_node = curr_node.children[lower_char]
        curr_node.isWord = True
        curr_node.tags = tags
        curr_node.aliases = aliases
        curr_node.original_name = original_name or word  
        curr_node.lat = lat  
        curr_node.lon = lon  

    def search(self, prefix, filters=None):
        curr_node = self.root
        # check if prefix is valid
        for char in prefix:
            lower_char = char.lower()  
            if lower_char not in curr_node.children:
                return []
            curr_node = curr_node.children[lower_char]
        # return all words with valid prefix
        return self._collect_words(curr_node, prefix, filters)

    def _collect_words(self, node, prefix, filters, seen=None):
        # will store unique building names
        if seen is None:
            seen = set()  

        results = []
        # if node is a word that does not exist in seen, 
        # and if it has the right tags (either all or None), add it to results
        if (node.isWord and node.original_name not in seen
            and 
            filters is None or all(tag in node.tags for tag in filters)):
            results.append({
                "name": node.original_name,  
                "tags": node.tags,
                "aliases": node.aliases,
                "lat": node.lat,  
                "lon": node.lon   
            })
            seen.add(node.original_name)  
        
        # check words in children nodes
        for child in node.children.values():
            results.extend(self._collect_words(child, prefix + child.ch, filters, seen))
        return results

def build_trie_from_buildings(json_file):
    # Load buildings data
    with open(json_file, 'r') as f:
        buildings = json.load(f)

    # Initialize the trie
    trie = Trie()

    # Insert building names and aliases into the trie
    for building in buildings:
        name = building["name"]
        tags = building.get("tags", [])
        aliases = building.get("aliases", [])
        lat = building.get("lat")  
        lon = building.get("lon")  
        # Insert the building name
        trie.insert(name, tags, aliases, lat, lon)
        # Insert each alias as a separate entry, pointing to the same building
        for alias in aliases:
            trie.insert(alias, tags, aliases, lat, lon, original_name=name)

    return trie

# For testing
if __name__ == "__main__":
    ####    ####    ####    ####    ####
    # These are all possible filters
    # "Bathroom",
    # "Study Spots",
    # "Lounges",
    # "Quiet Spots",
    # "Loud Spots",
    # "Professors' Offices",
    # "Lecture Hall"
    ####    ####    ####    ####    ####

    # Build the trie
    trie = build_trie_from_buildings(
        "/home/itorres2/CS/351/fgp-hoover10/backend/data/buildings.json"
        )

    # Test autocomplete
    prefix = "B"  
    filters = []
    results = trie.search(prefix, filters)
    for result in results:
        print(
            f"Name: {result['name']}, \n"
            f"Tags: {result['tags']}, \n"
            f"Aliases: {result['aliases']}, \n"
            f"Lat: {result['lat']}, Lon: {result['lon']}\n"
        )