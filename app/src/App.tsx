import ForceGraph from './components/force-graph'
import { useEffect, useState } from 'react'
import './App.css'
import { CourseDict } from './models/interfaces'
import { Edge, Position } from '@xyflow/react';
import { CourseNode } from './components/nodes';
import { ReactFlowProvider } from '@xyflow/react';

function App() {
    const [nodes, setNodes] = useState<CourseNode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        fetch('/cs.json')
            .then(response => response.json())
            .then((jsonData) => {
                const data: CourseDict = jsonData as CourseDict;
                let dNodes: CourseNode[] = [];
                let dEdges: Edge[] = [];
                let count = 0;
                for (let [_, course] of Object.entries(data)) {
                    dNodes.push({
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
                        dEdges.push({
                            id: `${prereq}-${course.id}`,
                            source: prereq,
                            target: course.id,
                            // type: "courseEdge",
                        });
                    }
                    count += 1;
                }
                setNodes(dNodes);
                setEdges(dEdges);
            })
            .catch(error => console.error('Error loading JSON:', error));
    }, []);

    return (
        <div className="w-screen h-screen flex">
            <ReactFlowProvider>
                <ForceGraph initialNodes={nodes} initialEdges={edges} />
            </ReactFlowProvider>
        </div>
    )
}

export default App
