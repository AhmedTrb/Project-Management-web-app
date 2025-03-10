"use client";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useGetProjectsQuery, useGetUserTasksQuery } from "@/state/api";
import {  Task, Project } from "../types/types";
import { ActivityChart } from "./ActivityChart/chart-line-default";
import { Calendar } from "@/components/ui/calendar";
import ProjectCard from "@/components/ProjectCard";
import { TaskCard } from "@/components/TaskCard";


function HomePage() {
  
  const { data: projects } = useGetProjectsQuery();
  const { data: tasks } = useGetUserTasksQuery();
  

  

  return (
    <div className="flex flex-col justify-start gap-y-6 p-10 sm:p-6 bg-[#f5f5f5] min-h-screen">
      {/* Top Section */}
      <ProjectHeader userTasks={tasks ?? []} />
      {/* Active projects */}
      <div className="flex justify-between items-center">
        <h2 className="text-secondary-950 text-xl font-bold">
          Active Projects
        </h2>
        <div className="flex justify-start gap-x-3 items-center">
          <div className="cursor-pointer hover:bg-gray-200 rounded-full p-1">
            <ArrowLeft size={20} className="text-secondary-950" />
          </div>
          <div className="cursor-pointer hover:bg-gray-200 rounded-full p-1">
            <ArrowRight size={20} className="text-secondary-950" />
          </div>
        </div>
      </div>
      <div>
        <div className="flex gap-x-4 justify-start items-start max-w-fit overflow-x-hidden gap-y-5 h-full overflow-y-visible scroll-smooth ">
        {!projects || projects.length === 0 ? <div className="text-center font-normal text-lg text-secondary-950">No projects provided</div> :
          projects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Active Tasks */}
      <div className="flex justify-between items-center">
        <h2 className="text-secondary-950 text-xl font-bold">Active Tasks</h2>
        <div className="flex justify-start gap-x-3 items-center">
          <div className="cursor-pointer hover:bg-gray-200 rounded-full p-1">
            <ArrowLeft size={20} className="text-secondary-950" />
          </div>
          <div className="cursor-pointer hover:bg-gray-200 rounded-full p-1">
            <ArrowRight size={20} className="text-secondary-950" />
          </div>
        </div>
      </div>
      <div className="flex gap-x-4 justify-start items-start w-full max-w-fit overflow-x-hidden gap-y-5 h-full overflow-y-visible scroll-smooth">
        {tasks
          ?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
      </div>
    </div>
  );
}

export default HomePage;

type projectHeaderProps = {
  userTasks: Task[];
};
const ProjectHeader = ({ userTasks }: projectHeaderProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [runningTasksCount, setRunningTasksCount] = useState(0);
  const target = userTasks.length; // Target value for the counter
  const duration = 2000; // Duration in ms for the counter animation
  // Counter animation
  useEffect(() => {
    const increment = target / (duration / 50); 
    const timer = setInterval(() => {
      setRunningTasksCount((prev) => {
        if (prev + increment >= target) {
          clearInterval(timer); 
          return target;
        }
        return prev + increment;
      });
    }, 50); // 50ms interval for smooth animation

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [target, duration]);

  return (<div className="grid md:grid-cols-3 sm:grid-cols-1 lg:grid-cols-4 gap-x-4 md:gap-y-6 w-full auto-rows-auto">
  {/* running tasks */}
  <div className="flex flex-col justify-between items-start p-4 gap-y-8 md:col-span-1 bg-secondary-950 rounded-lg h-64 ">
    <div className="flex flex-col justify-start items-start">
      <p className="text-white text-lg ">Running Tasks</p>
      <p className="text-white text-[52px] font-bold">
        {Math.floor(runningTasksCount)}
      </p>
    </div>
    <div className="flex items-center justify-start gap-x-6">
      {/* Progress circle */}
      <CircularProgress
        variant="determinate"
        value={Math.floor(runningTasksCount / target * 100)}
        size={90}
        sx={{ color: "white", "& .MuiCircularProgress-circle": { stroke: "white" } }}
        thickness={2}
      />
      <div className="flex flex-col justify-start items-start gap-y-[2px]">
        <p className="text-white text-lg font-bold">{target}</p>
        <p className="text-white text-lg">Tasks</p>
      </div>
    </div>
  </div>

  {/* Tasks activity line chart  */}
  <div className="lg:col-span-2 sm:col-span-1 md:col-span-1 col-span-1">
    <ActivityChart />
  </div>

  {/* calendar  */}
  <div className="flex col-span-1 justify-center items-center gap-y-4">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border col-span-2  bg-white"
    />
  </div>
</div>)
}