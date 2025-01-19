import { Project, Task } from "@/app/types/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import dotenv from "dotenv";

dotenv.config();



export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: ["Projects","Tasks"],
  endpoints: (build) => ({
    // Get all projects
    getProjects:build.query<Project[],void>({
      query:()=>"/api/projects",
      providesTags:["Projects"]
    }),
    // Create a new project
    createProject:build.mutation<Project,Partial<Project>>({
      query:(project)=>({
        url:"/api/projects",
        method:"POST",
        body:project
      }),
      invalidatesTags:["Projects"]
    }),
    // Get tasks for a project
    getTasks:build.query<Task[],{projectId:string}>({
      query:({projectId})=>({
        url:`/api/tasks/${projectId}`,
        method:"GET"
      }),
      providesTags:(result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    // Create a new task for a project
    createTask:build.mutation<Task,Partial<Task>>({
      query:(task)=>({
        url:`/api/tasks/${task.projectId}`,
        method:"POST",
        body:task
      }),
      invalidatesTags:["Tasks"]
    }),
    // Update task status for a project
    updateTaskStatus:build.mutation<Task,{taskId:string,status:string}>({
      query:({taskId,status})=>({
        url:`/api/tasks/${taskId}/status`,
        method:"PATCH",
        body:{status}
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
  }),
});

export const { useGetProjectsQuery, useCreateProjectMutation, useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation } = api;