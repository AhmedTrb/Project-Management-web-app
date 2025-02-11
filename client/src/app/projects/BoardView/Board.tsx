"use client";
import React, { useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { Priority, Task, TaskStatus } from "../../types/types";
import {
  Calendar,
  Ellipsis,
  MessageSquare,
  Paperclip,
  Plus,
} from "lucide-react";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectTasksQuery,
  useGetTaskAssigneesQuery,
  useUpdateTaskStatusMutation,
} from "@/state/api";
import { useParams } from "next/navigation";
import { Avatar, AvatarGroup, CircularProgress } from "@mui/material";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { setSelectedTask,toggleTaskDetailsModalOpen, toggleTaskDetailsModalClose } from "@/state/globalSlice";

type Props = {
  id: string;
  setIsNewTaskModalOpen: (isOpen: boolean) => void;
};
const taskStatus = ["To Do", "In Progress", "Under Review", "Completed"];
export default function Board({ id, setIsNewTaskModalOpen }: Props) {
  const { data: tasks, isLoading, error } = useGetProjectTasksQuery({ projectId: id });
  const [createTask] = useCreateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: string, status: TaskStatus) => {
    updateTaskStatus({ taskId, status });
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <div>Error</div>;
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
    collect: (monitor: any) => ({
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
          .filter(
            (task) =>
              task.status?.toLowerCase().replace(" ", "").replace("_", "") ===
              status.toLowerCase().replace(" ", "").replace("_", "")
          )
          .map((task) => (
            <TaskCard key={task.id} task={task} moveTask={moveTask} />
          ))}
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  moveTask,
}: {
  task: Task;
  moveTask: (taskId: string, status: TaskStatus) => void;
}) => {
  const [isTaskOptionsOpen, setIsTaskOptionsOpen] = useState(false);

  const numberOfComments = (task.comments && task.comments.length) || 0;
  const numberOfAttachments =
    (task.attachments && task.attachments.length) || 0;
  const numberOfPoints = (task.points && task.points) || 0;

  const dispatch = useDispatch();
  const [deleteTask] = useDeleteTaskMutation();

  const {data:taskAssignees} = useGetTaskAssigneesQuery({taskId: String(task.id )});
  const handleOpenTaskDetails = () => {
    dispatch(setSelectedTask(task));
    dispatch(toggleTaskDetailsModalOpen());
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const priorityColorMap = {
    low: "bg-green-400 bg-opacity-20 text-green-400",
    medium: "bg-orange-400 bg-opacity-20 text-orange-400",
    high: "bg-red-500 bg-opacity-20 text-red-500",
  };

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";
  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`flex flex-col gap-y-2 bg-white shadow rounded-md mb-4 p-4 cursor-move transition-all duration-200 ${
        isDragging ? " scale-105 shadow-lg rotate-3" : "scale-100"
      }`}
    >
      <div className="flex justify-between items-center">
        {/* priority  */}
        <div
          className={` h-5 px-1 py-0.5 rounded text-xs font-normal ${
            priorityColorMap[
              task.priority?.toLowerCase() as keyof typeof priorityColorMap
            ]
          }`}
        >
          {task.priority?.toLocaleLowerCase()}
        </div>
        <div
          className="cursor-pointer"
          onClick={() => setIsTaskOptionsOpen(!isTaskOptionsOpen)}
          onMouseLeave={() => setIsTaskOptionsOpen(false)}
        >
          <Ellipsis size={20} className="text-gray-500 hover:text-gray-900" />
          {isTaskOptionsOpen && (
            <div className="absolute top-5 right-0 bg-white shadow-md rounded-md p-2 w-2/3">
              <div
                className="text-sm font-normal text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-md p-1 w-full"
                onClick={() => deleteTask({ taskId: task.id.toString() })}
              >
                Delete
              </div>
              <div className="text-sm font-normal text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-md p-1 w-full" onClick={handleOpenTaskDetails}>
                Open
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Task attachments */}
      {/* <img src="/attachment.jpg" alt="attachment"  className="rounded-md w-full object-contain"/> */}
      {/* task title and tags*/}
      <div className="flex flex-col gap-y-1">
        {/* task title */}
        <p className="text-lg font-medium truncate line-clamp-2 text-secondary-950">
          {task.title}
        </p>
        {/* task description */}
        <p className="text-xs font-normal text-gray-700 line-clamp-3">
          {task.description}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <AvatarGroup total={taskAssignees?.length} max={3} spacing={10}>
            {taskAssignees?.map((user) => (
              <Avatar
                key={user.userId}
                src={user.profilePictureUrl}
                sx={{ width: 20, height: 20 }}
              />
            ))}
          </AvatarGroup>
        </div>
        <div className="flex justify-between items-center gap-x-2">
          <div className="flex justify-start items-center gap-x-1">
            <MessageSquare size={18} className="text-gray-500 " />
            <p className="text-xs font-normal text-gray-700">
              {numberOfComments}
            </p>
          </div>
          <div className="flex justify-start items-center gap-x-1">
            <Paperclip size={18} className="text-gray-500 " />
            <p className="text-xs font-normal text-gray-700">
              {numberOfAttachments}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
