import { Project, Task, TaskDependency, User } from "@/app/types/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "./authSlice";
import { RootState } from "@/app/redux";
import dotenv from "dotenv";

dotenv.config();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("token");
    if (token) {

      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
const baseQueryWithReauth = async (
  args: any,
  api: any,
  extraOptions: any
): Promise<any> => {
  // Perform the initial query
  let result = await baseQuery(args, api, extraOptions);

  // If the status is 403 (Forbidden), attempt to refresh the token
  if (result?.error?.status === 403) {
    console.log("sending refresh token");

    // Send the refresh token to get a new access token
    const refreshResult = await baseQuery("/refresh", api, extraOptions);
    console.log(refreshResult);

    if (refreshResult?.data) {
      // Assuming refreshResult.data contains the new token (and possibly other data)
      const newToken = (refreshResult?.data as { token: string; user: User })
        ?.token;
      const user = (api.getState() as RootState).auth.user;

      if (user && newToken) {
        // Dispatch the new token and user to update credentials
        api.dispatch(setCredentials({ user, token: newToken }));
      } else {
        // Handle the case where user or token is not available
        console.error("User or new token is missing");
        api.dispatch(logOut());
      }

      // Retry the original query with the new access token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // If refreshing the token fails, log the user out
      api.dispatch(logOut());
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks"],

  endpoints: (build) => ({
    // register user
    signUpUser: build.mutation<
      { token: string; user: User },
      { username: string; email: string; password: string }
    >({
      query: ({ username, email, password }) => ({
        url: "/api/users/signup",
        method: "POST",
        body: { username, email, password },
      }),
    }),

    // login user
    login: build.mutation<
      { token: string; user: User },
      { email: string; password: string }
    >({
      query: ({ email, password }) => ({
        url: "/api/users/login",
        method: "POST",
        body: { email, password },
      }),
    }),
    // get authenticated user
    getAuthenticatedUser: build.query<{ token: string; user: User },void>({
      query: () => ({
        url: "/api/users/authenticated",
        method: "POST",
      })
      
    }),
    // Get all projects
    getProjects: build.query<Project[], void>({
      query: () => "/api/projects",
      providesTags: ["Projects"],
    }),
    // Create a new project
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "/api/projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    // Get a project by id
    getProjectById: build.query<Project, { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/api/projects/${projectId}`,
        method: "GET",
      }),
      providesTags: ["Projects"],
    }),
    // Delete a project
    deleteProject: build.mutation<Project, { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/api/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),
    // Get tasks for a project
    getTasks: build.query<Task[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/api/tasks/${projectId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    // Create a new task for a project
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: `/api/tasks/${task.projectId}`,
        method: "POST",
        body: task,
      }),
      invalidatesTags: [{ type: "Tasks" }],
    }),
    // Update task status for a project
    updateTaskStatus: build.mutation<Task, { taskId: string; status: string }>({
      query: ({ taskId, status }) => ({
        url: `/api/tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    // Delete a task
    deleteTask: build.mutation<Task, { taskId: string }>({
      query: ({ taskId }) => ({
        url: `/api/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    // Get project tasks dependencies
    getProjectDependencies: build.query<TaskDependency[],{ projectId: string }>({
      query: ({ projectId }) => ({
        url: `/api/projects/${projectId}/tasks/dependencies`,
        method: "GET",
      }),
      providesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useGetProjectByIdQuery,
  useDeleteTaskMutation,
  useDeleteProjectMutation,
  useGetProjectDependenciesQuery,
  useLoginMutation,
  useGetAuthenticatedUserQuery,
  useSignUpUserMutation,
} = api;
