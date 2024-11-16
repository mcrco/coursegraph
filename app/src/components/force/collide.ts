import { ForceNode } from '@/models/interfaces';
import { quadtree, QuadtreeLeaf } from 'd3-quadtree';
import { Collide } from '@/models/interfaces';

export function collide() {
    let nodes: ForceNode[] = [];
    let force: Collide = Object.assign(
        (alpha: number) => {
            const tree = quadtree(
                nodes,
                (d) => d.x,
                (d) => d.y,
            );

            for (const node of nodes) {
                let r = 0;
                if (node.measured?.width)
                    r = node.measured.width;
                const nx1 = node.x - r;
                const nx2 = node.x + r;
                const ny1 = node.y - r;
                const ny2 = node.y + r;

                tree.visit((quad, x1, y1, x2, y2) => {
                    if (!quad.length) {
                        let quad_: QuadtreeLeaf<ForceNode> | undefined = quad as QuadtreeLeaf<ForceNode>;
                        do {
                            if (quad_.data !== node) {
                                let measured_width = 0;
                                if (node.measured?.width)
                                    measured_width = node.measured.width;
                                let quad_width = 0;
                                if (quad_.data.width)
                                    quad_width = quad_.data.width;
                                const r = measured_width / 2 + quad_width / 2;
                                let x = node.x - quad_.data.x;
                                let y = node.y - quad_.data.y;
                                let l = Math.hypot(x, y);

                                if (l < r) {
                                    l = ((l - r) / l) * alpha;
                                    node.x -= x *= l;
                                    node.y -= y *= l;
                                    quad_.data.x += x;
                                    quad_.data.y += y;
                                }
                            }
                        } while ((quad_ = quad_.next));
                    }

                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            }
        },
        {
            initialize: (newNodes: ForceNode[]) => (nodes = newNodes)
        }
    );

    return force;
}

export default collide;

