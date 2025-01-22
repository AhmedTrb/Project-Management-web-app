import React from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import { useGetProjectDependenciesQuery, useGetTasksQuery } from '@/state/api';
import '@xyflow/react/dist/style.css';

type Props = {
  id:string
}

export default function Graph({id}: Props) {
  const {data:tasks,isLoading,isError} = useGetTasksQuery({projectId:id}) ;
  const {data:dependencies} = useGetProjectDependenciesQuery({projectId:id});
  if (isLoading) return <div>Loading...</div>;
  

  if (isError || !tasks) return <div>Error loading tasks</div>;
  
  const degreeCounter = new Map<number, number>();

const nodes = tasks.map((task: any) => {
  const degree = task.degree;

  // Initialize or increment the degree counter
  const currentCount = degreeCounter.get(degree) || 0;
  degreeCounter.set(degree, currentCount + 1);

  return {
    id: String(task.id),
    position: {
      x: degree * 200, // X position is based on the degree
      y: 100 * currentCount, // Y position increments for each task with the same degree
    },
    data: { label: `Task ${task.id}: ${task.title || 'No Name'}` },
  };
});
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