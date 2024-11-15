import json
import networkx as nx
import matplotlib.pyplot as plt

class CourseGraph:
    def __init__(self, course_data):
        self.course_data = course_data
        self.G = nx.DiGraph()
        self.build_graph()

    def build_graph(self):
        # Add all courses as nodes first
        for course_id, info in self.course_data.items():
            self.G.add_node(course_id, name=info['name'])

            # Add prerequisite relationships as edges
            prereqs = info.get('prereqs', [])
            for prereq in prereqs:
                self.G.add_edge(prereq, course_id)

    def verify_acyclic(self):
        """Check if the graph is acyclic and print any cycles found."""
        try:
            cycles = list(nx.simple_cycles(self.G))
            if cycles:
                print("Warning: Cycles detected in prerequisite graph:")
                for cycle in cycles:
                    print(" -> ".join(cycle + [cycle[0]]))
                return False
            return True
        except nx.NetworkXNoCycle:
            return True

    def get_all_prerequisites(self, course_id):
        """Get all prerequisites (direct and indirect) for a course."""
        return list(nx.ancestors(self.G, course_id))
        
    def get_all_dependent_courses(self, course_id):
        """Get all courses that depend on this course."""
        return list(nx.descendants(self.G, course_id))
        
    def get_longest_path(self, course_id):
        """Find the longest prerequisite chain leading to this course."""
        paths = nx.shortest_path(self.G, target=course_id)
        longest_path = max(paths.values(), key=len)
        return longest_path
        
    def visualize(self, highlight_course=None, highlight_paths=False):
        """
        Visualize the course graph.
        If highlight_course is specified, highlight that course and its prerequisites.
        If highlight_paths is True, show the longest prerequisite path to the highlighted course.
        """
        pos = nx.spring_layout(self.G, k=2, iterations=50)
        
        # Set up the plot
        plt.figure(figsize=(15, 10))
        
        # Default node and edge colors
        node_colors = ['lightblue' for _ in self.G.nodes()]
        edge_colors = ['gray' for _ in self.G.edges()]
        
        # If a course is highlighted, update colors accordingly
        if highlight_course and highlight_course in self.G.nodes():
            # Get prerequisites
            prereqs = self.get_all_prerequisites(highlight_course)
            
            # Color nodes
            for i, node in enumerate(self.G.nodes()):
                if node == highlight_course:
                    node_colors[i] = 'red'
                elif node in prereqs:
                    node_colors[i] = 'orange'
                    
            # If highlighting paths, get the longest prerequisite chain
            if highlight_paths:
                longest_path = self.get_longest_path(highlight_course)
                # Highlight edges in the longest path
                edges = list(self.G.edges())
                for i, (u, v) in enumerate(edges):
                    if u in longest_path and v in longest_path:
                        if longest_path.index(v) == longest_path.index(u) + 1:
                            edge_colors[i] = 'red'
        
        # Draw the graph
        nx.draw(self.G, pos,
                with_labels=True,
                node_color=node_colors,
                edge_color=edge_colors,
                node_size=2000,
                font_size=8,
                font_weight='bold',
                arrows=True)
        
        plt.title("Course Prerequisite Graph")
        plt.axis('off')
        plt.tight_layout()
        plt.show()

# Example usage:
def main():
    # Load the course data
    with open('scrape/json/cs.json', 'r') as f:
        course_data = json.load(f)
    
    # Create the course graph
    graph = CourseGraph(course_data)
    
    # Verify it's acyclic
    if graph.verify_acyclic():
        print("Graph is acyclic (no circular prerequisites)")
    
    # Example analyses
    print("\nExample analyses:")
    
    # Find a course with many prerequisites
    course_prereqs = [(course, len(graph.get_all_prerequisites(course))) 
                     for course in graph.G.nodes()]
    most_prereqs = max(course_prereqs, key=lambda x: x[1])
    print(f"\nCourse with most prerequisites: {most_prereqs[0]} ({most_prereqs[1]} prerequisites)")
    
    # Visualize the graph with this course highlighted
    graph.visualize(highlight_course=most_prereqs[0], highlight_paths=True)

if __name__ == "__main__":
    main()
