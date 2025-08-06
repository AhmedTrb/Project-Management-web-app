"use client";
import { X } from "lucide-react";
import React from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/app/redux";
import { toggleTaskDetailsModalClose } from "@/state/globalSlice";
import { motion } from "framer-motion";


import { TaskDetailsContent } from "./TaskDetailsContent";
import { TaskAssignmentSection } from "./TaskAssignmentSection";
import { TaskCommentsSection } from "./TaskCommentsSection";
import { useGetTaskCommentsQuery } from "@/state/api";
import Loader from "../Loader/Loader";

export const TaskDetailsModal = () => {
  const dispatch = useDispatch();
  
  const isTaskDetailsModalOpen = useAppSelector(
    (state) => state.global.isTaskDetailsModalOpen
  );
  

  if (!isTaskDetailsModalOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-end overflow-y-auto bg-black bg-opacity-10 ">
      <motion.div
        initial={{ x: "100%", opacity: 0 }} // Start off-screen (right)
        animate={{ x: "0%", opacity: 1 }} // Slide in to view
        exit={{ x: "100%", opacity: 0 }} // Slide out when closing
        transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
        className="md:w-1/2 sm:w-1/2 lg:w-1/3  w-full h-full rounded-tl-lg rounded-bl-lg bg-white p-4 shadow-lg flex flex-col justify-start gap-4 overflow-y-auto"
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
        <TaskDetailsContent />
        <hr  className="bg-gray-200 w-full h-[1px] borer-none outline-none"/>
        {/* Assigned Users */}
        <TaskAssignmentSection />
         <hr  className="bg-gray-200 w-full h-[1px] borer-none outline-none"/>
        {/* Comments Section */}
        <TaskCommentsSection /> 
      </motion.div>
    </div>,
    document.body
  );
};
