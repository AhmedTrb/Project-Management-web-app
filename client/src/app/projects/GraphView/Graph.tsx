"use client"
import React, {  useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType, useEdgesState, useNodesState } from '@xyflow/react';
import { useDeleteTaskMutation, useGetProjectDependenciesQuery, useGetTasksQuery } from '@/state/api';
import '@xyflow/react/dist/style.css';
import { Task, TaskStatus } from '@/app/types/types';
import { Ellipsis } from 'lucide-react';

type Props = {
  id:string
}

export default function Graph({id}: Props) {
  const {data:tasks,isLoading,isError} = useGetTasksQuery({projectId:id});
  const {data:dependencies} = useGetProjectDependenciesQuery({projectId:id});
  
  if (isLoading) return <div>Loading...</div>;
  if (isError || !tasks) return <div>Error loading tasks</div>;
  
  const degreeCounter = new Map<number, number>();
  const nodeTypes = {
    taskNode: TaskNode,
  };
  const taskMap = new Map(tasks.map((task: any) => [task.id, task]));
  // create nodes
  const initialNodes = tasks.map((task: any) => {
    const degree = task.degree;
    const currentCount = degreeCounter.get(degree) || 0;
    degreeCounter.set(degree, currentCount + 1);

    return {
      id: String(task.id),
      type: 'taskNode',
      // position is calculated based on the degree of the task and the current count of tasks at that degree
      position: {
        x: degree * 250,
        y: 200 * currentCount,
      },
      data: { 
        label: task.title || 'No Name',
        description: task.description || 'No description available',
        status: task.status || TaskStatus.TODO,
        id: task.id
      },
    };
  });

  // create initial edges
  const initialEdges = dependencies?.map((dependency: any) => ({
    id: `e${dependency.prerequisiteTaskId}-${dependency.dependentTaskId}`,
    source: String(dependency.prerequisiteTaskId),
    target: String(dependency.dependentTaskId),
    markerEnd: {
      type: MarkerType.Arrow,
      width: 20,
      height: 20,
      color: '#000',
    },
    data: {
      duration: taskMap.get(dependency.prerequisiteTaskId)?.duration,
    },
  })) || [];

  // use react flow hooks to manage nodes and edges moving them around
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  

  return (
    <div className='h-[600px] w-full border border-gray-200'>
    <ReactFlow 
      nodes={nodes} 
      edges={initialEdges} 
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      defaultViewport={{x:0,y:0,zoom:1}}
    >
      <Background />
      <Controls />
    </ReactFlow>
    </div>
  )
}



type TaskNodeProps = {
  data: {
    label: string;
    description?: string;
    status: TaskStatus;
    id: number;
  };
};
const TaskNode = ({ data }: TaskNodeProps) => {
  const [isTaskOptionsOpen, setIsTaskOptionsOpen] = useState(false);
  const [deleteTask] = useDeleteTaskMutation();

  const statusColor =
    data.status.toLowerCase().replace(" ", "").replace("_", "") === TaskStatus.TODO.toLowerCase().replace(" ", "").replace("_", "")
      ? "bg-red-400 text-red-600"
      : data.status.toLowerCase().replace(" ", "").replace("_", "") === TaskStatus.IN_PROGRESS.toLowerCase().replace(" ", "").replace("_", "")
      ? "bg-blue-400 text-blue-600"
      : data.status.toLowerCase().replace(" ", "").replace("_", "") === TaskStatus.UNDER_REVIEW.toLowerCase().replace(" ", "").replace("_", "")
      ? "bg-yellow-400 text-yellow-600"
      : "bg-green-400 text-green-600";
  return (
    <div className="px-4 py-2 shadow-lg rounded-md border border-gray-200 bg-white min-w-[150px] w-[200px] my-2">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex flex-col gap-1">
        <div className='flex items-center justify-between'>
          <div className="font-semibold text-sm text-primary-600">{data.label}</div>
          <div className="cursor-pointer" onClick={() => setIsTaskOptionsOpen(!isTaskOptionsOpen)} onMouseLeave={() => setIsTaskOptionsOpen(false)}>
            <Ellipsis size={20} className="text-gray-500 hover:text-gray-900"/>
            {isTaskOptionsOpen && 
            (<div className="absolute top-5 right-0 bg-white shadow-md rounded-md p-2 w-2/3">
              <div className="text-sm font-normal text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-md p-1 w-full" onClick={() => deleteTask({taskId:data.id.toString()})}>Delete</div>
              <div className="text-sm font-normal text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-md p-1 w-full">Edit</div>
          </div>)}
        </div>
        </div>
        {data.description && (
          <div className="text-xs text-secondary-950">{data.description}</div>
        )}
        {/* task Status */}
        <div className={` h-5 px-1 py-0.5 rounded text-xs font-normal bg-opacity-20  ${statusColor}`}>{data.status?.toLocaleLowerCase()}</div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}