import { CourseNode } from "@/components/nodes";
import { Node, Edge } from "@xyflow/react";
import { SimulationNodeDatum } from "d3-force";

export interface Course {
    id: string;
    course_id: string;
    name: string;
    units: string;
    terms: string;
    description: string;
    offered: boolean;
    instructors: string;
    link: string;
    prereq_text?: string;
    prereqs: string[];
}

export interface CourseDict {
    [key: string]: Course;
}

export interface CourseGraphProps {
    initialNodes: Node[]
    initialEdges: Edge[]
}

export interface ForceNode extends Node {
    x: number;
    y: number;
    fx?: number;
    fy?: number;
}

export interface ReactFlowSND extends SimulationNodeDatum {
    id?: string;
}

export interface Collide {
    (alpha: number): void;
    initialize: (a: ForceNode[]) => void;
}

export interface NodesState {
    expandedNodes: Set<string>;
    toggleExpanded: (id: string) => void;

    prereqRootNodes: Set<string>;
    highlightedNodes: Set<string>;
    highlightedEdges: Set<string>;
    togglePrereqRoot: (id: string, nodes: CourseNode[]) => void;

    searchTerm: string;
    setSearchTerm: (term: string) => void;

    depts: Set<string>;
    toggleDept: (term: string) => void;

    courseData: CourseDict;
    setCourseData: (data: CourseDict) => void;
}
