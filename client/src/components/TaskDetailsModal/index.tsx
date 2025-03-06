"use client";
import { ApiError, Priority } from "@/app/types/types";
import { Calendar, ClipboardList, Flag, X } from "lucide-react";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/app/redux";
import { toggleTaskDetailsModalClose } from "@/state/globalSlice";
import { motion } from "framer-motion";
import { PriorityComponent } from "../PriorityComponent";
import {
  useAssignUserToTaskMutation,
  useGetTaskAssigneesQuery,
  useGetUsersQuery,
} from "@/state/api";
import Select from "react-select";
import { Status } from "../statusComponent";
import { Avatar, AvatarGroup } from "@mui/material";

interface selectedUserOptionValue {
  userId: string;
  label: string;
}
export const TaskDetailsModal = () => {
  const [error,setError] = useState("");
  const dispatch = useDispatch();
  const task = useAppSelector((state) => state.global.task);
  const {data: users,} = useGetUsersQuery();

  const { data: taskAssignees } = useGetTaskAssigneesQuery({
    taskId: String(task?.id),
  });

  const isTaskDetailsModalOpen = useAppSelector(
    (state) => state.global.isTaskDetailsModalOpen
  );
  const [assignTaskToUser,{isSuccess}] = useAssignUserToTaskMutation();
  const [selectedUsers, setSelectedUsers] = useState<selectedUserOptionValue[]>([]);

  const handleAssignUsers = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedUsers.length == 0) return ;

    for (const userOptionValue of selectedUsers) {
      try {
        assignTaskToUser({
          taskId: String(task?.id),
          userId: String(userOptionValue.userId),
        }).unwrap();
        
      } catch (error: unknown) {
        const err = error as ApiError;
        const errorMessage  = err?.data?.error || "Error assigning task to user";
        setError(errorMessage);
      }
    }

  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  if(!isTaskDetailsModalOpen) return null;
  

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-end overflow-y-auto bg-black bg-opacity-10 ">
      <motion.div
        initial={{ x: "100%", opacity: 0 }} // Start off-screen (right)
        animate={{ x: "0%", opacity: 1 }} // Slide in to view
        exit={{ x: "100%", opacity: 0 }} // Slide out when closing
        transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
        className="md:w-1/3 sm:w-1/2  w-1/3 h-full rounded-tl-lg rounded-bl-lg bg-white p-4 shadow-lg flex flex-col justify-start gap-4 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h1 className="text-2xl font-bold text-secondary-950">
            Task Details
          </h1>
          <button
            onClick={() => dispatch(toggleTaskDetailsModalClose())}
            className="text-secondary-900 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task Details */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-secondary-950">
              {task?.title} :
            </h2>
            <p className="text-gray-800 text-md font-normal">
              {task?.description} 
            </p>
          </div>

          <div className="flex items-center gap-2 text-secondary-950">
            <ClipboardList size={18} />
            <span className="font-medium ">Status:</span>{" "}
            <Status status={task?.status as string} />
          </div>

          <div className="flex items-center gap-2 text-secondary-950">
            <Flag size={18} />
            <span className="font-medium">Priority:</span>
            <PriorityComponent priority={task?.priority as Priority} />
          </div>

          {task?.dueDate && (
            <div className="flex items-center gap-2 text-secondary-950">
              <Calendar size={18} />
              <span className="font-medium">Due Date:</span>{" "}
              {formatDate(task?.dueDate)}
            </div>
          )}
        </div>

        {/* Assigned Users */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Assigned Users
          </h2>
          <div className="flex flex-col w-full gap-5">
          <div className="flex">
            <AvatarGroup max={taskAssignees?.length}>
              {taskAssignees?.map((teamMember) => (
                <div className="relative" key={teamMember.userId}><Avatar alt={teamMember.user.username} src={"https://avatar.iran.liara.run/public"} /><X className="absolute text-secondary-950 top-0 right-0 cursor-pointer" size={14} /></div>
              ))}
            </AvatarGroup>
          </div>
          <form onSubmit={handleAssignUsers} className="flex flex-col gap-2">

          
            <Select
              isMulti
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="assign users"
              value={selectedUsers.map((user) => ({
                value: user,
                label: user.label,
              }))}
              options={
                users
                  ? users.filter((user) => !taskAssignees?.some(assignee => assignee.userId === user.userId)).map((user) => ({
                      value: {
                        userId: String(user.userId),
                        label: user.username,
                      } as selectedUserOptionValue,
                      label: user.username,
                    }))
                  : []
              }
              onChange={(selected) =>
                setSelectedUsers(
                  selected ? selected.map((option) => option.value) : []
                )
              }
            />
            {isSuccess && <p className="text-green-400 bg-green-400 bg-opacity-10 w-full rounded p-2">Users assigned successfully</p>}
            {error && <p className="text-red-400 bg-red-400 bg-opacity-10 w-full rounded p-2">{error}</p>}
            <button className="bg-primary-600  text-white  px-3 py-1 rounded-md">
              Assign users
            </button>
            </form>
          </div>
          
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
