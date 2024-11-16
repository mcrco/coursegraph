import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { Course, CourseGraphProps } from '@/models/interfaces.js';
import { useLayoutedElements } from '@/components/force/force'
import { CourseNode } from './nodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCallback, useState } from 'react';

const nodeTypes = { courseNode: CourseNode };

const ForceGraph = ({ initialNodes, initialEdges }: CourseGraphProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);
    const [initialized, { toggle, isRunning }, dragEvents] = useLayoutedElements();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        const termLower = term.toLowerCase();

        setNodes((nds) =>
            nds.map((node) => {
                console.log(node.data)
                let data: Course = node.data.courseData as Course;
                const containsTerm = data.name.toLowerCase().includes(termLower) ||
                    data.course_id.toLowerCase().includes(termLower);
                return {
                    ...node,
                    data: {
                        ...node.data,
                        searched: containsTerm
                    }
                }
            })
        );
    }, [setSearchTerm, setNodes]);

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
                <Panel position='top-left'>
                    <Input
                        type='text'
                        placeholder='Search courses'
                        onChange={(e) => handleSearch(e.target.value)}
                        className='max-w-64'
                        value={searchTerm}
                    ></Input>
                </Panel>
                <Panel position="top-right">
                    {initialized && (
                        <Button onClick={toggle} className=''>
                            {isRunning() ? 'Locked' : 'Floating'} Mode
                        </Button>
                    )}
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default ForceGraph;

