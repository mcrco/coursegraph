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
