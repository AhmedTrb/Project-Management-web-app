import React, { useState, useCallback, useMemo } from 'react';
import {ReactFlow, Background, Controls, Handle, Position, MarkerType, useEdgesState, useNodesState } from '@xyflow/react';
import { useDeleteTaskMutation, useGetProjectDependenciesQuery, useGetProjectTasksQuery } from '@/state/api';
import '@xyflow/react/dist/style.css';
import { TaskStatus } from '@/app/types/types';
import { Ellipsis } from 'lucide-react';

type Props = {
  id: string
}

export default function Graph({ id }: Props) {
  const { data: tasks, isLoading, isError } = useGetProjectTasksQuery({ projectId: id });
  const { data: dependencies } = useGetProjectDependenciesQuery({ projectId: id });
  
  if (isLoading) return <div>Loading...</div>;
  if (isError || !tasks) return <div>Error loading tasks</div>;
  
  const { initialNodes, initialEdges } = useMemo(() => {
    const taskMap = new Map(tasks.map((task: any) => [task.id, task]));
    const predecessorsMap = new Map<number, number[]>();

    dependencies?.forEach((dep: any) => {
      const dependentId = dep.dependentTaskId;
      if (!predecessorsMap.has(dependentId)) {
        predecessorsMap.set(dependentId, []);
      }
      predecessorsMap.get(dependentId)?.push(dep.prerequisiteTaskId);
    });

    const yPositions = new Map<number, number>();
    const processedDegrees = new Map<number, number>();

    const nodesByDegree = [...tasks].sort((a, b) => a.id - b.id);
    
    nodesByDegree.forEach((task: any) => {
      const predecessors = predecessorsMap.get(task.id) || [];
      const degree = task.degree;
      
      if (predecessors.length === 0) {
        const currentCount = processedDegrees.get(degree) || 0;
        yPositions.set(task.id, currentCount * 200);
        processedDegrees.set(degree, currentCount + 1);
      } else {
        const predecessorYs = predecessors
          .map(predId => yPositions.get(predId))
          .filter((y): y is number => y !== undefined);
        
        if (predecessorYs.length > 0) {
          const avgY = predecessorYs.reduce((sum, y) => sum + y, 0) / predecessorYs.length;
          const currentCount = processedDegrees.get(degree) || 0;
          yPositions.set(task.id, avgY + (currentCount * 50));
          processedDegrees.set(degree, currentCount + 1);
        }
      }
    });

    const nodes = tasks.map((task: any) => ({
      id: String(task.id),
      type: 'taskNode',
      position: {
        x: task.degree * 300,
        y: yPositions.get(task.id) || 0,
      },
      data: { 
        label: task.title || 'No Name',
        description: task.description || 'No description available',
        status: task.status || TaskStatus.TODO,
        id: task.id
      },
    }));

    const edges = dependencies?.map((dependency: any) => ({
      id: `e${dependency.prerequisiteTaskId}-${dependency.dependentTaskId}`,
      source: String(dependency.prerequisiteTaskId),
      target: String(dependency.dependentTaskId),
      markerEnd: {
        type: MarkerType.Arrow,
        width: 15,
        height: 15,
        color: '#f5f5f5',
      },
      label: `${taskMap.get(dependency.prerequisiteTaskId)?.duration || 0} days`,
      style: { strokeWidth: 2 },
      labelStyle: { fill: '#00F', fontSize: 12 },
    })) || [];

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks, dependencies]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => [
      ...eds,
      {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 15,
          height: 15,
          color: '#000',
        },
        style: { strokeWidth: 2 },
        label: '0', 
        labelStyle: { fill: '#000000', fontSize: 12 },
      },
    ]);
  }, [setEdges]);

  const nodeTypes = useMemo(() => ({
    taskNode: TaskNode,
  }), []);

  return (
    <div className='h-[600px] w-full border border-gray-200'>
      <ReactFlow 
        nodes={nodes} 
        edges={initialEdges} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        defaultViewport={{ x: 50, y: 50, zoom: 0.7 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// Memoize your custom node component to prevent unnecessary re-renders.
type TaskNodeProps = {
  data: {
    label: string;
    description?: string;
    status: TaskStatus;
    id: number;
  };
  setNodes: any;
  nodes: any;
};

const TaskNode = (({ data, setNodes, nodes }: TaskNodeProps) => {
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

  return (
    <div className="relative px-4 py-2 shadow-lg rounded-md border border-gray-200 bg-white min-w-[150px] w-[200px] my-2">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex flex-col gap-1">
        <div className='flex items-center justify-between'>
          <div className="font-semibold text-sm text-primary-600">{data.label}</div>
          <div 
            className="cursor-pointer relative" 
            onClick={() => setIsTaskOptionsOpen(!isTaskOptionsOpen)} 
            onMouseLeave={() => setIsTaskOptionsOpen(false)}
          >
            <Ellipsis size={20} className="text-gray-500 hover:text-gray-900"/>
            {isTaskOptionsOpen && (
              <div className="absolute top-5 right-0 bg-white shadow-md rounded-md p-2 w-32 z-40">
                <div 
                  className="text-sm font-normal text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-md p-1 w-full" 
                  onClick={() => {
                    deleteTask({ taskId: data.id.toString() });
                    setNodes(nodes.filter((node: any) => node.id !== data.id.toString()));
                  }}
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
        {data.description && (
          <div className="text-xs text-secondary-950">{data.description}</div>
        )}
        <div className={`h-5 px-1 py-0.5 rounded text-xs font-normal bg-opacity-20 ${statusColor}`}>
          {data.status.toLocaleLowerCase()}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});

export { TaskNode };
