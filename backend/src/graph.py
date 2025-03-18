from collections import defaultdict

class Graph:
    def __init__(self):
        self.adj_list = defaultdict(dict)  # {vertex: {neighbor: weight}}

    def add_vertex(self, v):
        if v not in self.adj_list:
            self.adj_list[v] = {}

    def add_edge(self, from_v, to_v, weight):
        if from_v in self.adj_list and to_v in self.adj_list:
            self.adj_list[from_v][to_v] = weight

    def get_weight(self, from_v, to_v):
        return self.adj_list[from_v].get(to_v, float('inf'))

    def neighbors(self, v):
        return self.adj_list[v].keys()

    def get_vertices(self):
        return list(self.adj_list.keys())

    def num_vertices(self):
        return len(self.adj_list)

    def num_edges(self):
        return sum(len(neighbors) for neighbors in self.adj_list.values())
