import React from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import { useGetTasksQuery } from '@/state/api';
import '@xyflow/react/dist/style.css';

type Props = {
  id:string
}

export default function Graph({id}: Props) {
  const {data:tasks,isLoading,isError} = useGetTasksQuery({projectId:id}) ;

  if (isLoading) return <div>Loading...</div>;
  

  if (isError || !tasks) return <div>Error loading tasks</div>;
  
  
  const nodes = tasks.map((task: any, index: number) => ({
    id: String(task.id),
    position: { x: 200 * index, y: 100 }, 
    data: { label: `Task ${task.id}: ${task.title || 'No Name'}` },
  }));

  const edges: any[] = [];
  tasks.forEach((task: any) => {
    task.dependencies?.forEach((dependency: any) => {
      edges.push({
        id: `e${dependency.prerequisiteTaskId}-${dependency.dependentTaskId}`,
        source: String(dependency.prerequisiteTaskId),
        target: String(dependency.dependentTaskId),
      });
    });
  });


  return (
    <div className='h-[600px] w-full border border-gray-200'>
    <ReactFlow nodes={nodes} edges={edges} fitView>
      <Background />
      <Controls />
    </ReactFlow>
    </div>
  )
}