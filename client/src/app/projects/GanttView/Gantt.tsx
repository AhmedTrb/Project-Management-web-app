import React, { useState } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Task as ProjectTask } from '@/app/types/types';
import { useGetProjectDependenciesQuery, useGetProjectTasksQuery } from '@/state/api';
import Loader from '@/components/Loader/Loader';

type Props = {
  id: string;
};

// Helper to translate your ProjectTask.status into actual colors:
const getStylesForStatus = (
  status: ProjectTask["status"] | undefined
): {
  backgroundColor: string;
  progressColor: string;
} => {
  switch (status) {
    case "To Do":
      return {
        backgroundColor: "rgba(52, 211, 153, 0.2)",
        progressColor: "#34D399",
      };
    case "In Progress":
      return {
        backgroundColor: "rgba(96, 165, 250, 0.2)",
        progressColor: "#60A5FA",
      };
    case "Under Review":
      return {
        backgroundColor: "rgba(250, 204, 21, 0.2)",
        progressColor: "#EAB308",
      };
    default:
      return {
        backgroundColor: "rgba(248, 113, 113, 0.2)",
        progressColor: "#F87171",
      };
  }
};

export default function GanttGraph({ id }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {data:projectDependencies,isError,isLoading} = useGetProjectDependenciesQuery({ projectId: id });
  const { data: projectTasks, isLoading: taskLoading} = useGetProjectTasksQuery({ projectId: id });

  if (isLoading || taskLoading) return <Loader />;
  if (isError) return <div className='flex justify-center items-center h-screen w-full'>Error loading dependencies</div>;

  // Clone and sort by degree to avoid mutating props
  const sortedProjects = projectTasks ? [...projectTasks].sort((a, b) => (a.degree ?? 0) - (b.degree ?? 0)) : [];
  

  const ganttTasks: GanttTask[] =
    sortedProjects.map((task) => {
      const { backgroundColor, progressColor } = getStylesForStatus(task.status);
      return {
        id: String(task.id),
        name: task.title,
        start: task.startDate ? new Date(task.startDate) : new Date(task.createdAt),
        end: task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt),
        progress: 0,
        status: task.status || 'To Do',
        type: 'task',
        isDisabled: false,
        dependencies: projectDependencies ? projectDependencies
          .filter((dependency) => dependency.dependentTaskId === task.id)
          .map((dependency) => String(dependency.prerequisiteTaskId)) : [],
        styles: {
          backgroundColor: selectedId === String(task.id) ? '#7161f1' : "#7161f1",
          progressColor: selectedId === String(task.id) ? '#7161f1' : "#7161f1",
          progressSelectedColor: '#7161f1',
        },
      };
    });

  const view: ViewMode = ViewMode.Day;

  return (
    <div className="w-[calc(100%-16rem)] overflow-x-auto">
      <Gantt
        tasks={ganttTasks}
        viewMode={view}
        arrowIndent={20}
        arrowColor="#41466e"
        onSelect={(task) => setSelectedId(task.id)}
      />
    </div>
  );
}
