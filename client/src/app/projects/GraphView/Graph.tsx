"use client";
import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow, Background, Controls, Handle, Position, MarkerType,
  useEdgesState, useNodesState
} from '@xyflow/react';
import { useDeleteTaskMutation, useGetProjectDependenciesQuery, useGetProjectTasksQuery } from '@/state/api';
import '@xyflow/react/dist/style.css';
import { Task, TaskStatus } from '@/app/types/types';
import { Ellipsis } from 'lucide-react';
import Loader from '@/components/Loader/Loader';

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
    projectId: string; // Add projectId to TaskNode data for deletion
  }
}

// Memoized TaskNodeCard component
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

  const handleToggleOptions = useCallback(() => {
    setIsTaskOptionsOpen(prev => !prev);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsTaskOptionsOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    deleteTask({ taskId: data.id.toString(), projectId: data.projectId.toString() });
    setNodes((currentNodes: TaskNode[]) => currentNodes.filter((node) => node.id !== data.id.toString()));
  }, [data.id, data.projectId, deleteTask, setNodes]); 

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
                <button
                  className="text-sm font-normal text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-md p-1 w-full"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button className="text-sm font-normal text-gray-600 hover:text-gray-600 hover:bg-gray-600 hover:bg-opacity-10 rounded-md p-1 w-full">
                  Open
                </button>
              </div>
            )}
          </div>
        </div>
        {data.description && <div className="text-xs text-secondary-950">{data.description}</div>}
        <div className={`h-5 px-1 py-0.5 rounded text-xs font-normal bg-opacity-20 ${statusColor}`}>
          {data.status?.toLowerCase()}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
});

TaskNodeCard.displayName = 'TaskNodeCard';

export default function Graph({ id }: Props) {
  // All hooks must be called unconditionally at the top level
  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useGetProjectTasksQuery({ projectId: id });
  const { data: dependencies, isLoading: dependenciesLoading, isError: dependenciesError } = useGetProjectDependenciesQuery({ projectId: id }); 

  // Derived loading and error states after all hooks are called
  const overallLoading = tasksLoading || dependenciesLoading;
  const overallError = tasksError || dependenciesError;

  

  // Ensure tasks and dependencies are not undefined before using them
  // This is crucial because if overallLoading/overallError is false,
  // it implies data might be available, but RTK Query returns undefined initially.
  const resolvedTasks = tasks || [];
  const resolvedDependencies = dependencies || [];

  const { initialNodes, initialEdges } = useMemo(() => {
    const taskMap = new Map<number, Task>(resolvedTasks.map((task) => [task.id, task]));
    const predecessorsMap = new Map<number, number[]>();
    const yPositions = new Map<number, number>();
    const processedDegrees = new Map<number, number>();

    resolvedDependencies.forEach(({ dependentTaskId, prerequisiteTaskId }) => {
      if (!predecessorsMap.has(dependentTaskId)) {
        predecessorsMap.set(dependentTaskId, []);
      }
      predecessorsMap.get(dependentTaskId)?.push(prerequisiteTaskId);
    });

    resolvedTasks.forEach(({ id, degree }) => {
      const currentCount = processedDegrees.get(degree) || 0;
      yPositions.set(id, currentCount * 160);
      processedDegrees.set(degree, currentCount + 1);
    });

    const nodes = resolvedTasks.map(({ id, degree, title, description, status }) => ({
      id: String(id),
      type: 'taskNode',
      position: { x: degree * 300, y: yPositions.get(id) || 0 },
      data: { label: title, description: description, status, id, projectId: id }, // Added projectId to data
    }));

    const edges = resolvedDependencies.map(({ prerequisiteTaskId, dependentTaskId }) => ({
      id: `e${prerequisiteTaskId}-${dependentTaskId}`,
      source: String(prerequisiteTaskId),
      target: String(dependentTaskId),
      markerEnd: { type: MarkerType.Arrow, width: 15, height: 15, color: '#000' },
      label: `${taskMap.get(prerequisiteTaskId)?.duration || 0} days`,
      style: { strokeWidth: 2 },
      labelStyle: { fill: '#00F', fontSize: 12 },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [resolvedTasks, resolvedDependencies]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({
    taskNode: (props: any) => <TaskNodeCard {...props} nodes={nodes} setNodes={setNodes} />
  }), [nodes, setNodes]);


  if (overallLoading) return <Loader />;
  if (overallError) return <div>Error loading tasks or dependencies</div>;
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