import React, { useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, Background, Controls, Handle, Position, MarkerType, 
  useEdgesState, useNodesState
} from '@xyflow/react';
import { useDeleteTaskMutation, useGetProjectDependenciesQuery, useGetProjectTasksQuery } from '@/state/api';
import '@xyflow/react/dist/style.css';
import { Task, TaskStatus } from '@/app/types/types';
import { Ellipsis } from 'lucide-react';

type Props = { id: string };

interface TaskNode {
  id: string;
  type: string;
  position: {
      x: number;
      y: number;
  };
  data: {
      label: string;
      description: string;
      status: string | undefined;
      id: number;
  }
}

// Memoized TaskNodeCard component to prevent unnecessary re-renders
const TaskNodeCard = React.memo(({ data, setNodes, nodes }: any) => {
  const [isTaskOptionsOpen, setIsTaskOptionsOpen] = useState(false);
  const [deleteTask] = useDeleteTaskMutation();

  const statusColor =
    data.status === TaskStatus.TODO
      ? "bg-red-400 text-red-600"
      : data.status === TaskStatus.IN_PROGRESS
      ? "bg-blue-400 text-blue-600"
      : data.status === TaskStatus.UNDER_REVIEW
      ? "bg-yellow-400 text-yellow-600"
      : "bg-green-400 text-green-600";

  // Use useCallback for event handlers to prevent recreation on each render
  const handleToggleOptions = useCallback(() => {
    setIsTaskOptionsOpen(prev => !prev);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsTaskOptionsOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    deleteTask({ taskId: data.id.toString() });
    setNodes((nodes: TaskNode[]) => nodes.filter((node) => node.id !== data.id.toString()));
  }, [data.id, deleteTask, setNodes]);

  return (
    <div className="relative px-4 py-2 shadow-lg rounded-md border border-gray-200 bg-white min-w-[150px] w-[200px] my-2">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm text-primary-600">{data.label}</div>
          <div 
            className="cursor-pointer relative" 
            onClick={handleToggleOptions} 
            onMouseLeave={handleMouseLeave}
          >
            <Ellipsis size={20} className="text-gray-500 hover:text-gray-900"/>
            {isTaskOptionsOpen && (
              <div className="absolute top-5 right-0 bg-white shadow-md rounded-md p-2 w-32 z-40">
                <div 
                  className="text-sm font-normal text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-md p-1 w-full" 
                  onClick={handleDelete}
                >
                  Delete
                </div>
                <div className="text-sm font-normal text-gray-600 hover:text-gray-600 hover:bg-gray-600 hover:bg-opacity-10 rounded-md p-1 w-full">
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

// Add display name for the memoized component
TaskNodeCard.displayName = 'TaskNodeCard';

export default function Graph({ id }: Props) {
  const { data: tasks, isLoading, isError } = useGetProjectTasksQuery({ projectId: id });
  const { data: dependencies } = useGetProjectDependenciesQuery({ projectId: id });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !tasks) return <div>Error loading tasks</div>;

  // Use useMemo to prevent recomputation on every render
  const { initialNodes, initialEdges } = useMemo(() => {
    const taskMap = new Map<number, Task>(tasks.map((task) => [task.id, task]));
    const predecessorsMap = new Map<number, number[]>();
    const yPositions = new Map<number, number>();
    const processedDegrees = new Map<number, number>();

    // Populate predecessorsMap
    dependencies?.forEach(({ dependentTaskId, prerequisiteTaskId }) => {
      if (!predecessorsMap.has(dependentTaskId)) {
        predecessorsMap.set(dependentTaskId, []);
      }
      predecessorsMap.get(dependentTaskId)?.push(prerequisiteTaskId);
    });

    // Compute y-positions
    tasks.forEach(({ id, degree }) => {
      const currentCount = processedDegrees.get(degree) || 0;
      yPositions.set(id, currentCount * 160);
      processedDegrees.set(degree, currentCount + 1);
    });

    // Create nodes
    const nodes = tasks.map(({ id, degree, title, description, status }) => ({
      id: String(id),
      type: 'taskNode',
      position: { x: degree * 300, y: yPositions.get(id) || 0 },
      data: { label: title || 'No Name', description: description || 'No description available', status, id },
    }));

    // Create edges
    const edges = dependencies?.map(({ prerequisiteTaskId, dependentTaskId }) => ({
      id: `e${prerequisiteTaskId}-${dependentTaskId}`,
      source: String(prerequisiteTaskId),
      target: String(dependentTaskId),
      markerEnd: { type: MarkerType.Arrow, width: 15, height: 15, color: '#000' },
      label: `${taskMap.get(prerequisiteTaskId)?.duration || 0} days`,
      style: { strokeWidth: 2 },
      labelStyle: { fill: '#00F', fontSize: 12 },
    })) || [];

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks, dependencies]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Memoize the nodeTypes object to prevent recreation on every render
  const nodeTypes = useMemo(() => ({ 
    taskNode: (props: any) => <TaskNodeCard {...props} nodes={nodes} setNodes={setNodes} /> 
  }), [nodes, setNodes]);

  return (
    <div className="h-[600px] w-full border border-gray-200">
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultViewport={{ x: 50, y: 50, zoom: 0.7 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}