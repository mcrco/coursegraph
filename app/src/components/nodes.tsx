import { Handle, NodeProps, Position, Node, useReactFlow } from '@xyflow/react';
import { Course } from '@/models/interfaces';
import { Card, CardTitle, CardFooter, CardHeader, CardContent, CardDescription } from './ui/card';

export type CourseNode = Node<
    {
        courseData: Course;
        expanded: boolean;
        highlighted: boolean;
    },
    'courseNode'
>;

export function CourseNode(props: NodeProps<CourseNode>) {
    let data = props.data;
    const { setNodes } = useReactFlow();
    const clickHandler = () => {
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
            }
            )
        )
    }

    if (!data.expanded) {
        return (
            <div className='w-48'>
                <Handle type="target" position={Position.Left} />
                <Card onClick={clickHandler}>
                    <CardHeader>
                        <CardTitle>{data.courseData.course_id}</CardTitle>
                    </CardHeader>
                </Card>
                < Handle type="source" position={Position.Right} />
            </div>
        );
    }

    return (
        <div className='max-w-3xl text-left'>
            <Handle type="target" position={Position.Left} />
            <Card onClick={clickHandler}>
                <CardHeader>
                    <CardTitle>{data.courseData.course_id + ': ' + data.courseData.name}</CardTitle>
                    <CardDescription>{data.courseData.instructors + ' | ' + data.courseData.units}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{data.courseData.description}</p>
                </CardContent>
                <CardFooter><p>{data.courseData.terms}</p></CardFooter>
            </Card>
            < Handle type="source" position={Position.Right} />
        </div>
    );
}
