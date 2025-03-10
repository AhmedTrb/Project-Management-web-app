import { Priority, Task } from "@/app/types/types";
import { Avatar, AvatarGroup } from "@mui/material";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import React from "react";
import { PriorityComponent } from "../PriorityComponent";
import { useDispatch } from "react-redux";
import {
  setSelectedTask,
  toggleTaskDetailsModalOpen,
} from "@/state/globalSlice";
import Image from "next/image";
import { useGetTaskAssigneesQuery } from "@/state/api";

type Props = {
  task: Task;
};

export const TaskCard = ({ task }: Props) => {
  const endDate = task?.dueDate ? new Date(task?.dueDate) : new Date();
  const dispatch = useDispatch();
  const { data: taskAssignees } = useGetTaskAssigneesQuery({
    taskId: String(task.id),
  });
  const handleTaskCardClick = () => {
    dispatch(setSelectedTask(task));
    dispatch(toggleTaskDetailsModalOpen());
  };

  return (
    
      <div
        className="bg-white rounded-lg p-4 shadow-sm flex flex-col justify-start items-start gap-y-4 w-72 h-80 mb-4 ml-2 cursor-pointer hover:shadow-xl transition-shadow duration-300 ease-in-out"
        onClick={() => handleTaskCardClick}
      >
        <Image
          width={250}
          height={200}
          src="/projectCover.png"
          alt="project"
          className="w-full h-32 rounded-lg object-cover"
        />
        <h2 className="text-lg font-bold text-secondary-950 text-start">
          {task?.title}
        </h2>
        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-gray-500">
            {task.tags?.split(",").map((tag) => tag)}
          </p>

          <PriorityComponent priority={task?.priority as Priority} />
        </div>
        <div className="h-12">
          <p className="text-sm text-gray-500 overflow-ellipsis">
            {task?.description}
          </p>
        </div>

        <div className="flex justify-between gap-7 items-center w-full mt-auto">
          <AvatarGroup total={taskAssignees?.length} max={3} spacing={10}>
            {taskAssignees?.map((teamMember) => (
              <Avatar
                key={teamMember.userId}
                src={teamMember.user.profilePictureUrl}
                sx={{ width: 20, height: 20 }}
              />
            ))}
          </AvatarGroup>

          <div className="flex justify-start items-center gap-x-2 mr-4">
            <Clock className="w-4 h-4 text-gray-500" />
            <p className="text-sm text-gray-500">
              {format(new Date(endDate), "MM/dd/yyyy")}
            </p>
          </div>
        </div>
      </div>
  );
};
