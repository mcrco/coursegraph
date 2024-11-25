import ForceGraph from './components/force-graph'
import { useEffect } from 'react'
import './App.css'
import { CourseDict } from './models/interfaces'
import { ReactFlowProvider } from '@xyflow/react';
import { useGraphStore } from './stores/graphStore';

function App() {
    const depts = useGraphStore((state) => state.depts);
    const setCourseData = useGraphStore((state) => state.setCourseData);

    useEffect(() => {
        const updateData = async () => {
            let updated: CourseDict = {};
            for (let dept of depts) {
                let file = `/${dept}.json`;
                await fetch(file)
                    .then(response => response.json())
                    .then((jsonData) => {
                        const data: CourseDict = jsonData as CourseDict;
                        updated = { ...updated, ...data };
                    })
                    .catch(error => console.error(`Error loading ${file}:`, error));

            }
            setCourseData(updated);
        };
        updateData();
    }, [depts]);

    return (
        <div className="w-screen h-screen flex">
            <ReactFlowProvider>
                <ForceGraph />
            </ReactFlowProvider>
        </div>
    )
}

export default App
