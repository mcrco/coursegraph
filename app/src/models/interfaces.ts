import { Node, Edge } from "@xyflow/react";

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
