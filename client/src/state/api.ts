import { Project, Task, TaskAssignment, TaskDependency, Team, TeamMember, User } from "@/app/types/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "./authSlice";
import { RootState } from "@/app/redux";
import dotenv from "dotenv";

dotenv.config();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include", 
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
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
    const refreshResult = await baseQuery(
      { url: "/api/refresh/token", method: 'GET', credentials: "include" }, 
      api, 
      extraOptions
    );
    

    if (refreshResult?.data) {
      // Assuming refreshResult.data contains the new token (and possibly other data)
      const newToken = (refreshResult?.data as { accessToken: string })
        ?.accessToken;
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
  tagTypes: ["Projects", "Tasks", "Teams","Users"],

/**
 * Defines API endpoints for performing various operations related to teams, users, projects, and tasks.
 * Each endpoint is built using RTK Query's `build` object, which provides methods for creating queries and mutations.
 * Queries are used to fetch data and can provide or invalidate cache tags, while mutations are used to modify data and invalidate cache tags.
 */

  endpoints: (build) => ({
    // remove user from task 
    removeUserFromTask: build.mutation<TaskAssignment, { taskId: string; userId: string }>({
      query: ({ taskId, userId }) => ({
        url: `/api/tasks/${taskId}/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    // assign user to task
    assignUserToTask: build.mutation<TaskAssignment, { taskId: string; userId: string }>({
      query: ({ taskId, userId }) => ({
        url: `/api/tasks/assign/task`,
        method: "POST",
        body:{taskId,userId}
      }),
      invalidatesTags: ["Tasks", "Users"],
    }),
    // get task assignees
    getTaskAssignees: build.query<TeamMember[], { taskId: string }>({
      query: ({ taskId }) => ({
        url: `/api/tasks/${taskId}/assignees`,
        method: "GET",
      }),
      providesTags: (result)=>
        result
          ? [...result.map(({ userId }) => ({ type: "Users" as const, userId })), { type: "Users" as const, id: "LIST" }]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    // get project team members
    getProjectTeamMembers: build.query<TeamMember[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/api/projects/${projectId}/team`,
        method: "GET",
      }),
      providesTags: (result)=>
        result
          ? [...result.map(({ userId }) => ({ type: "Users" as const, userId })), { type: "Users" as const, id: "LIST" }]
          : [{ type: "Users" as const, id: "LIST" }],
    }),
    // update team member role
    updateTeamMemberRole: build.mutation<User, { teamId: string; userId: string; newRole: string }>({
      query: ({ teamId, userId, newRole }) => ({
        url: `/api/teams/${teamId}/members/${userId}/role`,
        method: "PATCH",
        body: { newRole },
      }),
      invalidatesTags: ["Teams"],
    }),
    // remove team member 
    removeTeamMember: build.mutation<User, { teamId: string; userId: string }>({
      query: ({ teamId, userId }) => ({
        url: `/api/teams/${teamId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teams"],
    }),
    // get user teams and team members
    getUserTeams: build.query<Team[], void>({
      query: () => ({
        url: "/api/teams",
        method: "GET",
      }),
      providesTags: (result)=>
        result
          ? [...result.map(({ id }) => ({ type: "Teams" as const, id })), { type: "Teams" as const, id: "LIST" }]
          : [{ type: "Teams" as const, id: "LIST" }],
    }),
    // add team member to project team
    addTeamMember: build.mutation<User, { teamId: string; userId: string,role?: string }>({
      query: ({ teamId, userId,role }) => ({
        url: "/api/teams/members",
        method: "POST",
        body: { teamId, userId,role },
      }),
      invalidatesTags: ["Teams"],
    }),
    // signup user
    signUpUser: build.mutation<
      { token: string; user: User },
      { username: string; email: string; password: string }
    >({
      query: ({ username, email, password }) => ({
        url: "/api/auth/signup",
        method: "POST",
        body: { username, email, password },
        invalidatesTags: ["Users"],
      }),
    }),

    // login user
    login: build.mutation<
      { token: string; user: User },
      { email: string; password: string }
    >({
      query: ({ email, password }) => ({
        url: "/api/auth/login",
        method: "POST",
        body: { email, password },
      }),
    }),

    // get all users
    getUsers: build.query<User[], void>({
      query: () =>({
        url: "/api/users",
        method: "GET",
        providesTags: ["Users"]
      }),
    }),

    // logout user 
    logout: build.mutation<void,void>({
      query: () =>({
        url: "/api/auth/logout",
        method: "POST"
      }),
      invalidatesTags: ["Projects", "Tasks"],
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

    // get user tasks
    getUserTasks: build.query<Task[],void >({
      query: () =>({
        url:'/api/tasks/',
        method:'GET',
      }),
      providesTags: (result)=> result ? [...result.map(({ id }) => ({ type: "Tasks" as const, id })), { type: "Tasks" as const, id: "LIST" }] : [{ type: "Tasks" as const, id: "LIST" }]
    }),

    // Get tasks for a project
    getProjectTasks: build.query<Task[], { projectId: string }>({
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
      invalidatesTags: (result) => result ? [{ type: "Tasks", id: result.projectId }] : [{ type: "Tasks" }],
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
  useGetTaskAssigneesQuery,
  useAssignUserToTaskMutation,
  useRemoveUserFromTaskMutation,
  useGetProjectTeamMembersQuery,
  useUpdateTeamMemberRoleMutation,
  useRemoveTeamMemberMutation,
  useAddTeamMemberMutation,
  useGetUsersQuery,
  useGetUserTeamsQuery,
  useGetUserTasksQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useGetProjectByIdQuery,
  useDeleteTaskMutation,
  useDeleteProjectMutation,
  useGetProjectDependenciesQuery,
  useLogoutMutation,
  useLoginMutation,
  useGetAuthenticatedUserQuery,
  useSignUpUserMutation,
} = api;
