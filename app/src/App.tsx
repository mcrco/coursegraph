import ForceGraph from './components/force-graph'
import { useState, useEffect } from 'react'
import './App.css'
import { CourseDict } from './models/interfaces'
import { Node, Edge, Position, useReactFlow } from '@xyflow/react';
import { CourseNode } from './components/nodes';

// import { Search } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Input } from '@/components/ui/input';

function App() {
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

    useEffect(() => {
        console.log("Getting nodes");
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
                            courseData: course,
                            expanded: false,
                            highlighted: false
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
            <ForceGraph initialNodes={getNodes()} initialEdges={getEdges()} />
        </div>
    )
}

export default App
