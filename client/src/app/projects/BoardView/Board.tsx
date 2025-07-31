"use client";
import React, { useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  DndProvider,
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
} from "react-dnd";
import { Task, TaskStatus } from "../../types/types";
import { Ellipsis, MessageSquare, Paperclip, Plus } from "lucide-react";
import {
  useDeleteTaskMutation,
  useGetProjectTasksQuery,
  useGetTaskAssigneesQuery,
  useUpdateTaskStatusMutation,
} from "@/state/api";

import TaskCard from "./TaskCard";


type Props = {
  id: string;
  tasks?: Task[];
  setIsNewTaskModalOpen: (isOpen: boolean) => void;
};
const taskStatus = ["To Do", "In Progress", "Under Review", "Completed"];
export default function Board({ id, setIsNewTaskModalOpen ,tasks}: Props) {
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  
  const moveTask = (taskId: string, status: TaskStatus) => {
    updateTaskStatus({ taskId, status });
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status as TaskStatus}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsNewTaskModalOpen={setIsNewTaskModalOpen}
          />
        ))}
      </div>
    </DndProvider>
  );
}
type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  moveTask: (taskId: string, status: TaskStatus) => void;
  setIsNewTaskModalOpen: (isOpen: boolean) => void;
};
const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsNewTaskModalOpen,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: string }) => moveTask(item.id, status),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const taskCount = tasks.filter(
    (task) =>
      task.status?.toLowerCase().replace(" ", "").replace("_", "") ===
      status.toLowerCase().replace(" ", "").replace("_", "")
  ).length;
  const statusColor =
    status === "To Do"
      ? "bg-green-400"
      : status === "In Progress"
      ? "bg-blue-400"
      : status === "Under Review"
      ? "bg-yellow-400"
      : "bg-red-400";
  const borderColor =
    status === "To Do"
      ? "border-green-400"
      : status === "In Progress"
      ? "border-blue-400"
      : status === "Under Review"
      ? "border-yellow-400"
      : "border-red-400";
  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`bg-neutral-100 rounded-tl-2xl rounded-tr-2xl w-full transition-colors duration-200 ${
        isOver ? "bg-neutral-200" : ""
      }`}
    >
      {/* Column header */}
      <div
        className={`flex justify-between items-center px-4 py-5 border-b-2 ${borderColor} `}
      >
        <div className="flex justify-start items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <p className="text-md font-medium text-secondary-950">{status}</p>
          <div className="flex justify-center items-center h-5 w-5 rounded-full text-xs bg-neutral-200">
            {taskCount}
          </div>
        </div>
        {status === "To Do" && (
          <button
            className="flex justify-center items-center h-5 w-5 rounded-full bg-neutral-200"
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            <Plus size={18} className="text-gray-500" />
          </button>
        )}
      </div>
      {/* Task cards */}
      <div
        className={`flex flex-col gap-4 p-4 min-h-[200px] ${
          isOver ? "opacity-50" : ""
        }`}
      >
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
      </div>
    </div>
  );
};


