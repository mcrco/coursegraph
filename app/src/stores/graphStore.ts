import { CourseNode } from "@/components/nodes";
import { CourseDict, NodesState } from "@/models/interfaces";
import { create } from "zustand";

const getHighlighted = (roots: Set<string>, nodes: CourseNode[]) => {
    let highlightedNodes = new Set<string>();
    let highlightedEdges = new Set<string>();

    const dfs = (node: CourseNode | undefined) => {
        if (!node || highlightedNodes.has(node.id))
            return;
        highlightedNodes.add(node.id);

        const prereqs: String[] = node.data.course.prereqs;
        for (let prereq of prereqs) {
            highlightedEdges.add(`${prereq}-${node.id}`);
            dfs(nodes.find((n) => n.id === prereq));
        }
    }

    for (let root of roots)
        dfs(nodes.find((n) => n.id === root));

    return [highlightedNodes, highlightedEdges];
}

export const useGraphStore = create<NodesState>((set) => ({
    expandedNodes: new Set<string>(),
    toggleExpanded: (id: string) => {
        set((state) => {
            const updated = new Set(state.expandedNodes);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return { expandedNodes: updated };
        })
    },

    prereqRootNodes: new Set<string>(),
    highlightedNodes: new Set<string>(),
    highlightedEdges: new Set<string>(),
    togglePrereqRoot: (id: string, nodes: CourseNode[]) => {
        set((state) => {
            const updated = new Set(state.prereqRootNodes);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            const [highlightedNodes, highlightedEdges] = getHighlighted(updated, nodes);
            return {
                prereqRootNodes: updated,
                highlightedNodes: highlightedNodes,
                highlightedEdges: highlightedEdges,
            };
        })
    },

    searchTerm: "",
    setSearchTerm: (term: string) => { set({ searchTerm: term }) },

    depts: new Set<string>(["cms"]),
    toggleDept: (dept: string) => {
        set((state) => {
            const updated = new Set(state.depts);
            if (updated.has(dept)) {
                updated.delete(dept);
            } else {
                updated.add(dept);
            }
            return {
                depts: updated
            }
        })
    },

    courseData: {} as CourseDict,
    setCourseData: (data: CourseDict) => {
        set((_state) => ({ courseData: data }));
    }
}))
