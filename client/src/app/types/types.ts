import exp from "constants";

export interface User {
    userId: number;
    cognitoId: string;
    email: string;
    username: string;
    profilePictureUrl?: string ;
    teamId?: number ;
    createdAt: Date;
    updatedAt: Date;
  
    authoredTasks?: Task[];
    assignedTasks?: Task[];
    taskAssignments?: TaskAssignment[];
    attachments?: Attachment[];
    comments?: Comment[];
    team?: Team | null;
  }
  
  export interface Team {
    id: number;
    teamName: string;
    productOwnerUserId?: number ;
    projectManagerUserId?: number ;
    createdAt: Date;
    updatedAt: Date;
  
    projectTeams?: ProjectTeam[];
    user?: User[];
  }
  
  export interface Project {
    id: number;
    name: string;
    description?: string ;
    startDate?: Date ;
    endDate?: Date ;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  
    tasks?: Task[];
    projectTeams?: ProjectTeam[];
  }
  
  export interface ProjectTeam {
    id: number;
    teamId: number;
    projectId: number;
    createdAt: Date;
    updatedAt: Date;
  
    team: Team;
    project: Project;
  }
  
  export interface Task {
    id: number;
    title: string;
    description?: string ;
    status?: string ;
    priority?: string ;
    tags?: string ;
    startDate?: Date ;
    dueDate?: Date ;
    points?: number ;
    projectId: number;
    authorUserId: number;
    assignedUserId?: number ;
    createdAt: Date;
    updatedAt: Date;
  
    project: Project;
    author: User;
    assignee?: User ;
    taskAssignments?: TaskAssignment[];
    attachments?: Attachment[];
    comments?: Comment[];
    dependencies?: TaskDependency[];
    dependents?: TaskDependency[];
  }
  
  export interface TaskDependency {
    id: number;
    dependentTaskId: number;
    prerequisiteTaskId: number;
    createdAt: Date;
  
    dependentTask: Task;
    prerequisiteTask: Task;
  }
  
  export interface TaskAssignment {
    id: number;
    userId: number;
    taskId: number;
  
    user: User;
    task: Task;
  }
  
  export interface Attachment {
    id: number;
    fileURL: string;
    fileName?: string ;
    taskId: number;
    uploadedById: number;
    createdAt: Date;
    updatedAt: Date;
  
    task: Task;
    uploadedBy: User;
  }
  
  export interface Comment {
    id: number;
    text: string;
    taskId: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  
    task: Task;
    user: User;
  }
  
  export enum projectStatus {
    NOT_STARTED = 'Not Started',
    PLANNING = 'Planning',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
  }

  export enum Priority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
  }

  export enum TaskStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    BLOCKED = 'Blocked',
    UNDER_REVIEW = 'Under Review',
    COMPLETED = 'Completed',
  }
