import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { CourseGraphProps } from '@/models/interfaces.js';
import { useLayoutedElements } from '@/components/force/force'

const ForceGraph = ({ initialNodes, initialEdges }: CourseGraphProps) => {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);
    const [initialized, { toggle, isRunning }, dragEvents] = useLayoutedElements();

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
            >
                <Panel position="top-right">
                    {initialized && (
                        <button onClick={toggle} className=''>
                            {isRunning() ? 'Stop' : 'Start'} force simulation
                        </button>
                    )}
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default ForceGraph;

