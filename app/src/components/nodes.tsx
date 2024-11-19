import { Handle, NodeProps, Position, Node, useReactFlow } from '@xyflow/react';
import { Course } from '@/models/interfaces';
import { Card, CardTitle, CardFooter, CardHeader, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button'
import { useGraphStore } from '@/stores/graphStore';
import { useMemo } from 'react';

export type CourseNode = Node<
    {
        course: Course;
    },
    'courseNode'
>;

const nodeShade = "bg-gray-100 text-gray-400 border-gray-100 shadow-none"
const nodeHighlight = "bg-orange-200 border-orange-500"

const searched = (course: Course, searchTerm: string) => {
    const termLower = searchTerm.toLowerCase();
    return course.name.toLowerCase().includes(termLower) ||
        course.course_id.toLowerCase().includes(termLower);
}

export default function CourseNode(props: NodeProps<CourseNode>) {
    let course = props.data.course;
    const { getNodes } = useReactFlow();
    const expandedNodes = useGraphStore((state) => state.expandedNodes);
    const toggleExpanded = useGraphStore((state) => state.toggleExpanded);
    const prereqRoots = useGraphStore((state) => state.prereqRootNodes);
    const highlightedNodes = useGraphStore((state) => state.highlightedNodes);
    const togglePrereq = useGraphStore((state) => state.togglePrereqRoot);
    const searchTerm = useGraphStore((state) => state.searchTerm);

    const className = useMemo(() => {
        let className = "";
        if (!course.offered) {
            className = nodeShade;
        }
        else if (highlightedNodes.has(course.id)) {
            className = nodeHighlight;
        }
        if (!searched(course, searchTerm))
            className += " opacity-25";

        return className;
    }, [getNodes, expandedNodes, prereqRoots, highlightedNodes, searchTerm]);

    if (!expandedNodes.has(course.id)) {
        return (
            <div className='w-48'>
                <Handle type="target" position={Position.Left} />
                <Card onClick={() => toggleExpanded(course.id)} className={className}>
                    <CardHeader>
                        <CardTitle>{course.course_id}</CardTitle>
                    </CardHeader>
                </Card>
                < Handle type="source" position={Position.Right} />
            </div>
        );
    }

    return (
        <div className='max-w-3xl min-w-xl text-left relative'>
            <Handle type="target" position={Position.Left} />
            <Button className="absolute top-4 right-4" size="sm" variant="ghost" onClick={() => togglePrereq(course.id, getNodes() as CourseNode[])}>
                Prereqs
            </Button>
            <Card onClick={() => toggleExpanded(course.id)} className={className}>
                <CardHeader>
                    <CardTitle>{course.course_id + ': ' + course.name}</CardTitle>
                    <CardDescription>Instructor(s): {course.instructors} </CardDescription>
                </CardHeader>
                <CardContent>
                    {course.description || "No description provided."}
                </CardContent>
                <CardFooter>
                    Offered&nbsp;<i>{course.terms || "??"}</i>&thinsp;
                    for {course.units || "variable units"}.
                </CardFooter>
            </Card>
            < Handle type="source" position={Position.Right} />
        </div>
    );
}
