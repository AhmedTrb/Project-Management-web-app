"use client";
import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Ellipsis } from 'lucide-react';
import Image from 'next/image'; 

// Reuse your TaskNodeCard from GraphView (just copy/paste it here, or import if it’s shared)
const TaskNodeCard = React.memo(({ data, nodes, setNodes }: any) => {
  const [isTaskOptionsOpen, setIsTaskOptionsOpen] = React.useState(false);

  const statusColor =
    data.status === 'TODO'
      ? 'bg-red-400 text-red-600'
      : data.status === 'IN_PROGRESS'
      ? 'bg-blue-400 text-blue-600'
      : data.status === 'UNDER_REVIEW'
      ? 'bg-yellow-400 text-yellow-600'
      : 'bg-green-400 text-green-600';

  return (
    <div className="relative px-4 py-2 shadow-lg rounded-md border border-gray-200 bg-white min-w-[150px] w-[200px] my-2">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm text-primary-600">{data.label}</div>
          <div
            className="cursor-pointer relative"
            onClick={() => setIsTaskOptionsOpen(prev => !prev)}
            onMouseLeave={() => setIsTaskOptionsOpen(false)}
          >
            <Ellipsis size={20} className="text-gray-500 hover:text-gray-900" />
            {isTaskOptionsOpen && (
              <div className="absolute top-5 right-0 bg-white shadow-md rounded-md p-2 w-32 z-40">
                <div className="text-sm font-normal text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-md p-1 w-full">
                  Delete
                </div>
                <div className="text-sm font-normal text-gray-600 hover:bg-gray-600 hover:bg-opacity-10 rounded-md p-1 w-full">
                  Edit
                </div>
              </div>
            )}
          </div>
        </div>
        {data.description && <div className="text-xs text-secondary-950">{data.description}</div>}
        <div className={`h-5 px-1 py-0.5 rounded text-xs font-normal bg-opacity-20 ${statusColor}`}>
          {data.status.toLowerCase()}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});
TaskNodeCard.displayName = 'TaskNodeCard';

export default function StaticGraphExample() {
  // 1) Hardcoded example tasks (matching your Task type fields)
  const exampleTasks = [
  { id: 1, title: 'Gather Requirements', description: 'Meet stakeholders and document needs', status: 'COMPLETED', degree: 0, duration: 3 },
  { id: 2, title: 'Create Wireframes', description: 'Design initial UI wireframes', status: 'IN_PROGRESS', degree: 1, duration: 5 },
  { id: 3, title: 'Setup Development Environment', description: 'Configure Git, CI/CD, and local tooling', status: 'COMPLETED', degree: 1, duration: 2 },
  { id: 4, title: 'Implement Authentication', description: 'Build user login, signup, and JWT flow', status: 'TODO', degree: 2, duration: 4 },
  { id: 5, title: 'Build Database Schema', description: 'Design and migrate PostgreSQL schema', status: 'TODO', degree: 2, duration: 3 },
  { id: 6, title: 'Develop API Endpoints', description: 'CRUD for users, products, and orders', status: 'TODO', degree: 3, duration: 6 },
  { id: 7, title: 'Integrate Third-Party Payment', description: 'Connect Stripe for order payments', status: 'TODO', degree: 4, duration: 5 },
  { id: 8, title: 'Frontend Development', description: 'Implement pages and components in Next.js', status: 'TODO', degree: 3, duration: 7 },
  { id: 9, title: 'Write Unit & Integration Tests', description: 'Test backend APIs and React components', status: 'TODO', degree: 5, duration: 4 },
  { id: 10, title: 'Deploy to Production', description: 'Deploy frontend on Vercel and backend on Render', status: 'TODO', degree: 6, duration: 2 },
];

const exampleDependencies = [
  { prerequisiteTaskId: 1, dependentTaskId: 2 },
  { prerequisiteTaskId: 1, dependentTaskId: 3 },
  { prerequisiteTaskId: 2, dependentTaskId: 8 },
  { prerequisiteTaskId: 3, dependentTaskId: 4 },
  { prerequisiteTaskId: 3, dependentTaskId: 5 },
  { prerequisiteTaskId: 4, dependentTaskId: 6 },
  { prerequisiteTaskId: 5, dependentTaskId: 6 },
  { prerequisiteTaskId: 6, dependentTaskId: 7 },
  { prerequisiteTaskId: 6, dependentTaskId: 9 },
  { prerequisiteTaskId: 7, dependentTaskId: 9 },
  { prerequisiteTaskId: 8, dependentTaskId: 9 },
  { prerequisiteTaskId: 9, dependentTaskId: 10 },
];


  // 2) Build nodes & edges exactly like your Graph component does
  const { initialNodes, initialEdges } = useMemo(() => {
    const yPositions = new Map<number, number>();
    const processedDegrees = new Map<number, number>();

    // Compute y position by degree to stagger tasks vertically
    exampleTasks.forEach(({ id, degree }) => {
      const count = processedDegrees.get(degree) || 0;
      yPositions.set(id, count * 160);
      processedDegrees.set(degree, count + 1);
    });

    const nodes = exampleTasks.map(task => ({
      id: String(task.id),
      type: 'taskNode',
      position: { x: task.degree * 300, y: yPositions.get(task.id) || 0 },
      data: {
        label: task.title,
        description: task.description,
        status: task.status,
        id: task.id,
      },
    }));

    const edges = exampleDependencies.map(dep => ({
      id: `e${dep.prerequisiteTaskId}-${dep.dependentTaskId}`,
      source: String(dep.prerequisiteTaskId),
      target: String(dep.dependentTaskId),
      markerEnd: { type: MarkerType.Arrow, width: 15, height: 15, color: '#000' },
      style: { strokeWidth: 2 },
      label: `${exampleTasks.find(t => t.id === dep.prerequisiteTaskId)?.duration || 0}d`,
      labelStyle: { fill: '#00F', fontSize: 12 },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, []);

  // 3) ReactFlow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 4) Memoize nodeTypes for stable reference
  const nodeTypes = useMemo(
    () => ({
      taskNode: (props: any) => <TaskNodeCard {...props} nodes={nodes} setNodes={setNodes} />,
    }),
    [nodes, setNodes]
  );

  return (
    <div className="w-full h-[500px] rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultViewport={{ x: 50, y: 50, zoom: 0.8 }}
      >
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}
