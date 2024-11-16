import { useMemo, useRef } from 'react';
import {
    useReactFlow,
    useNodesInitialized,
    Node,
    OnNodeDrag
} from '@xyflow/react';

import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceX,
    forceY,
} from 'd3-force';

import collide from './collide';
import { ForceNode, ReactFlowSND } from '@/models/interfaces.js';

const simulation = forceSimulation()
    .force('charge', forceManyBody().strength(-2000))
    .force('x', forceX().x(0).strength(0.1))
    .force('y', forceY().y(0).strength(0.1))
    .force('collide', collide())
    .alphaTarget(0.05)
    .stop();

type LayoutedElementsTpe = [
    boolean,
    { toggle: () => void; isRunning: () => boolean },
    {
        start: OnNodeDrag<Node>,
        drag: OnNodeDrag<Node>,
        stop: () => void
    }

]

export const useLayoutedElements = (): LayoutedElementsTpe => {
    const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
    const initialized = useNodesInitialized();

    let draggingNodeRef = useRef<Node | null>(null);
    const dragEvents = useMemo(
        () => ({
            start: (_event: React.MouseEvent, node: Node) => (draggingNodeRef.current = node),
            drag: (_event: React.MouseEvent, node: Node) => (draggingNodeRef.current = node),
            stop: () => (draggingNodeRef.current = null),
        }),
        [],
    );

    return useMemo(() => {
        let nodes = getNodes().map((node) => ({
            ...node,
            x: node.position.x,
            y: node.position.y
        }) as ForceNode);
        let edges = getEdges().map((edge) => edge);
        let running = false;

        if (!initialized || nodes.length === 0) {
            return [false, { toggle: () => undefined, isRunning: () => false }, dragEvents];
        }

        simulation.nodes(nodes).force(
            'link',
            forceLink(edges)
                .id((d, _i, _nodesData) => {
                    let d_: ReactFlowSND = d as ReactFlowSND;
                    if (!d_.id) {
                        return "";
                    }
                    return d_.id;
                })
                .strength(0.05)
                .distance(100),
        );

        const tick = () => {
            getNodes().forEach((node, i) => {
                const dragging = draggingNodeRef.current?.id === node.id;

                if (dragging) {
                    if (draggingNodeRef.current) {
                        nodes[i].fx = draggingNodeRef.current.position.x;
                        nodes[i].fy = draggingNodeRef.current.position.y;
                    }
                } else {
                    delete nodes[i].fx;
                    delete nodes[i].fy;
                }
            });

            simulation.tick();
            setNodes(
                nodes.map((node) => ({
                    ...node,
                    position: { x: node.fx ?? node.x, y: node.fy ?? node.y },
                })),
            );

            window.requestAnimationFrame(() => {
                fitView();
                if (running) tick();
            });
        };

        const toggle = () => {
            if (!running) {
                getNodes().forEach((node, index) => {
                    let simNode = nodes[index];
                    Object.assign(simNode, node);
                    simNode.x = node.position.x;
                    simNode.y = node.position.y;
                });
            }
            running = !running;
            running && window.requestAnimationFrame(tick);
        };

        const isRunning = () => running;

        return [true, { toggle: toggle, isRunning: isRunning }, dragEvents];
    }, [initialized, dragEvents, getNodes, getEdges, setNodes, fitView]);
};

