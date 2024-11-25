import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Panel,
    Edge,
    Position,
    Node,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useLayoutedElements } from '@/components/force/force'
import CourseNode from './nodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Toggle } from './ui/toggle';

const DEPTS = ['CMS', 'Ma', 'EE', 'Ph', 'Ay'];

const nodeTypes = { courseNode: CourseNode };

const ForceGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
    const [initialized, { stopSim, toggleSim, isRunning }, dragEvents] = useLayoutedElements();
    const courseData = useGraphStore((state) => state.courseData);
    const searchTerm = useGraphStore((state) => state.searchTerm);
    const setSearchTerm = useGraphStore((state) => state.setSearchTerm);
    const highlightedEdges = useGraphStore((state) => state.highlightedEdges);
    const depts = useGraphStore((state) => state.depts);
    const toggleDept = useGraphStore((state) => state.toggleDept);

    useEffect(() => {
        let updatedNodes: Node[] = [];
        let updatedEdges: Edge[] = [];
        let count = 0;
        for (let [_, course] of Object.entries(courseData)) {
            updatedNodes.push({
                id: course.id,
                position: {
                    x: Math.ceil(count / 16) * 200, y: (count % 16) * 100
                },
                data: {
                    course: course,
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                type: "courseNode",
                dragging: true,
            });
            for (let prereq of course.prereqs) {
                if (prereq in courseData) {
                    updatedEdges.push({
                        id: `${prereq}-${course.id}`,
                        source: prereq,
                        target: course.id,
                    });
                }
            }
            count += 1;
        }

        setNodes((_nds) => updatedNodes);
        setEdges((_edgs) => updatedEdges);
    }, [courseData]);

    useEffect(() => {
        setEdges((edges) => edges.map((edge) => ({
            ...edge,
            animated: highlightedEdges.has(edge.id),
            style: highlightedEdges.has(edge.id) ? {
                stroke: 'orange',
                strokeWidth: 3,
            } : undefined
        })))
    }, [highlightedEdges]);

    const get_toggle_fn = (dept: string) => {
        return () => {
            stopSim();
            toggleDept(dept);
        }
    }

    const dept_toggles = DEPTS.map((dept) =>
        <Toggle
            pressed={depts.has(dept.toLowerCase())}
            onPressedChange={get_toggle_fn(dept.toLowerCase())}
            variant="outline"
            key={`${dept}-toggle`}
        >
            {dept}
        </Toggle>
    )


    return (
        <div className="w-screen h-screen flex">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeDragStart={dragEvents.start}
                onNodeDrag={dragEvents.drag}
                onNodeDragStop={dragEvents.stop}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                nodesConnectable={false}
            >
                <Panel position='top-left' className=''>
                    <Card className='text-left'>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-y-4'>
                            <Input
                                type='text'
                                placeholder='Search courses'
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-56 bg-white opacity-85'
                                value={searchTerm}
                            ></Input>
                            <div className='grid grid-cols-2 gap-4'>
                                {dept_toggles}
                            </div>
                        </CardContent>
                    </Card>
                </Panel>
                <Panel position="top-right">
                    {initialized && (
                        <Button onClick={toggleSim} className=''>
                            {isRunning() ? 'Locked' : 'Floating'} Mode
                        </Button>
                    )}
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default ForceGraph;

