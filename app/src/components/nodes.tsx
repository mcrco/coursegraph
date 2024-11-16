import { Handle, NodeProps, Position, Node, useReactFlow } from '@xyflow/react';
import { Course } from '@/models/interfaces';
import { Card, CardTitle, CardFooter, CardHeader, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button'
import { useCallback } from 'react';

export type CourseNode = Node<
    {
        courseData: Course;
        expanded: boolean;
        highlighted: boolean;
        searched: boolean;
    },
    'courseNode'
>;

const edgeHighlight = {
    animated: true,
    style: {
        stroke: 'orange',
        strokeWidth: 3
    }
}

const edgeNoHighlight = {
    animated: false,
    style: undefined
}

const nodeShade = "bg-gray-100 text-gray-500"
const nodeHighlight = "bg-orange-200"
const getNodeClassName = (data: { courseData: Course, highlighted: boolean, searched: boolean }) => {
    let className = "";
    if (data.highlighted)
        className = nodeHighlight;
    if (!data.courseData.offered)
        className = nodeShade;
    if (!data.searched)
        className += " opacity-25";

    return className;
}

export function CourseNode(props: NodeProps<CourseNode>) {
    let data = props.data;
    const { getNodes, setNodes, setEdges } = useReactFlow();
    const clickHandler = useCallback(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id == data.courseData.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            expanded: !node.data.expanded
                        }
                    }
                }
                return node;
            })
        );
    }, [setNodes])

    const highlightHandler = async () => {
        let highlightedNodes: String[] = []
        let highlightedEdges: String[] = []
        const nodes = getNodes();

        const dfs = (node: Node | undefined, parent: Node | null) => {
            if (!node || highlightedNodes.includes(node.id)) {
                return;
            }

            highlightedNodes.push(node.id);
            if (parent) {
                highlightedEdges.push(`${node.id}-${parent.id}`)
            }

            const prereqs: String[] = (node.data.courseData as Course).prereqs;
            for (let prereq of prereqs) {
                dfs(nodes.find((n) => n.id == prereq), node);
            }
        }
        dfs(nodes.find((n) => n.id == data.courseData.id), null);

        const highlighted = props.data.highlighted;

        setNodes((nds) =>
            nds.map((node) => {
                if (highlightedNodes.includes(node.id)) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            highlighted: !highlighted
                        }
                    }
                }
                return node;
            })
        );
        setEdges((edges) =>
            edges.map((edge) => {
                if (highlightedEdges.includes(edge.id)) {
                    if (highlighted) {
                        return {
                            ...edge,
                            ...edgeNoHighlight
                        };
                    }
                    return {
                        ...edge,
                        ...edgeHighlight
                    };
                }
                return edge;
            })
        );
    };

    if (!data.expanded) {
        return (
            <div className='w-48'>
                <Handle type="target" position={Position.Left} />
                <Card onClick={clickHandler} className={getNodeClassName(data)}>
                    <CardHeader>
                        <CardTitle>{data.courseData.course_id}</CardTitle>
                    </CardHeader>
                </Card>
                < Handle type="source" position={Position.Right} />
            </div>
        );
    }

    return (
        <div className='max-w-3xl min-w-xl text-left relative'>
            <Handle type="target" position={Position.Left} />
            <Button className="absolute top-4 right-4" size="sm" variant="ghost" onClick={highlightHandler}>
                Prereqs
            </Button>
            <Card onClick={clickHandler} className={getNodeClassName(data)}>
                <CardHeader>
                    <CardTitle>{data.courseData.course_id + ': ' + data.courseData.name}</CardTitle>
                    <CardDescription>Instructor(s): {data.courseData.instructors} </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.courseData.description || "No description provided."}
                </CardContent>
                <CardFooter>
                    Offered&nbsp;<i>{data.courseData.terms || "??"}</i>&thinsp;
                    for {data.courseData.units || "variable units"}.
                </CardFooter>
            </Card>
            < Handle type="source" position={Position.Right} />
        </div>
    );
}
