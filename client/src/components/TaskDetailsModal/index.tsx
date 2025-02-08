import { Priority, Task } from "@/app/types/types";
import { Calendar, ClipboardList, Flag, X } from "lucide-react";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/app/redux";
import { toggleTaskDetailsModalClose } from "@/state/globalSlice";
import { motion } from "framer-motion";
import { PriorityComponent } from "../PriorityComponent";
import { useGetUsersQuery,  useGetUserTeamsQuery } from "@/state/api";
import Select from 'react-select';
import { Status } from "../statusComponent";

type Props = {};

export const TaskDetailsModal = ({}: Props) => {
  const dispatch = useDispatch();
  const task = useAppSelector((state) => state.global.task);
  const {data:users,isLoading:usersLoading,isError:usersError} = useGetUsersQuery();
  //const {data:teams,isLoading,isError} = useGetUserTeamsQuery();

  const isTaskDetailsModalOpen = useAppSelector(
    (state) => state.global.isTaskDetailsModalOpen
  );


  const [selectedUsers,setSelectedUsers] = useState<string[]>([]);
  
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  if (!isTaskDetailsModalOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-end overflow-y-auto bg-black bg-opacity-10 ">
      <motion.div
        initial={{ x: "100%", opacity: 0 }} // Start off-screen (right)
        animate={{ x: "0%", opacity: 1 }} // Slide in to view
        exit={{ x: "100%", opacity: 0 }} // Slide out when closing
        transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
        className="w-1/4 max-w-2xl h-full rounded-tl-lg rounded-bl-lg bg-white p-4 shadow-lg flex flex-col justify-start gap-4 overflow-y-auto"
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
              {task?.description} Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Nam veniam molestiae facilis necessitatibus!
              Adipisci nisi nesciunt, dicta eaque doloribus, veniam eius
              consequuntur nostrum tenetur deserunt soluta eum, impedit optio
              rerum.
            </p>
          </div>

          <div className="flex items-center gap-2 text-secondary-950">
            <ClipboardList size={18} />
            <span className="font-medium ">Status:</span> <Status status={task?.status as string} />
          </div>

          <div className="flex items-center gap-2 text-secondary-950">
            <Flag size={18} />
            <span className="font-medium">Priority:</span><PriorityComponent priority={task?.priority as Priority} />
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
            
            <Select
                isMulti
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="assign users"
                value={selectedUsers.map(user => ({ value: user, label: user }))}
                options={users ? users.map(user => ({ value: user.username, label: user.username })) : []}
                onChange={(selected) => setSelectedUsers(selected ? selected.map(option => option.value) : [])}
            />
            <button className="bg-primary-600  text-white  px-3 py-1 rounded-md">Assign users</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* {task.assignedUserId.map(user => (
                            <div key={user.userId} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                                {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt={user.username} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <User size={18} className="text-gray-500" />
                                )}
                                <span className="text-gray-700">{user.username}</span>
                            </div>
                        ))} */}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
