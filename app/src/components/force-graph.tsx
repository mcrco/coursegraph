import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { CourseGraphProps } from '@/models/interfaces.js';
import { useLayoutedElements } from '@/components/force/force'
import CourseNode from './nodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { useGraphStore } from '@/stores/graphStore';

const nodeTypes = { courseNode: CourseNode };

const ForceGraph = ({ initialNodes, initialEdges }: CourseGraphProps) => {
    // const [departments, setDepartments] = useState<string[]>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [initialized, { toggle, isRunning }, dragEvents] = useLayoutedElements();

    useEffect(() => {
        setNodes((_nds) => initialNodes);
        setEdges((_eds) => initialEdges);
    }, [initialNodes, initialEdges])

    const searchTerm = useGraphStore((state) => state.searchTerm);
    const setSearchTerm = useGraphStore((state) => state.setSearchTerm);
    const highlightedEdges = useGraphStore((state) => state.highlightedEdges);

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
                        placeholder='Fuzzy search courses'
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-56'
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

