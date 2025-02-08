

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
    taskAssignments?: Number[];
    attachments?: Number[];
    comments?: Number[];
    dependencies?: Number[];
    dependents?: Number[];
  }
  
  export interface TaskDependency {
    dependentTaskId: number; // task needs to be completed before this task
    prerequisiteTaskId: number; 
    createdAt?: Date;
    updatedAt?: Date;
  
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
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
  }

  export enum TaskStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    BLOCKED = 'Blocked',
    UNDER_REVIEW = 'Under Review',
    COMPLETED = 'Completed',
  }


  // sample data for teams and users to use for testing
  export const sampleTeams: Team[] = [
    {
      id: 1,
      teamName: "Innovation Squad",
      productOwnerUserId: 2,
      projectManagerUserId: 1,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      // Optionally, you can later add projectTeams or user relations
    },
    {
      id: 2,
      teamName: "Frontend Masters",
      productOwnerUserId: 1,
      projectManagerUserId: 4,
      createdAt: new Date("2025-01-02T00:00:00.000Z"),
      updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    },
    {
      id: 3,
      teamName: "Backend Wizards",
      productOwnerUserId: 1,
      projectManagerUserId: 3,
      createdAt: new Date("2025-01-03T00:00:00.000Z"),
      updatedAt: new Date("2025-01-03T00:00:00.000Z"),
    }
  ];
  
  // Sample users array
  export const sampleUsers: User[] = [
    {
      userId: 1,
      cognitoId: "cognito1",
      email: "sarah.j@company.com",
      username: "Sarah Johnson",
      profilePictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      teamId: 1,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      userId: 2,
      cognitoId: "cognito2",
      email: "m.chen@company.com",
      username: "Michael Chen",
      profilePictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      teamId: 1,
      createdAt: new Date("2025-01-02T00:00:00.000Z"),
      updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    },
    {
      userId: 3,
      cognitoId: "cognito3",
      email: "e.rodriguez@company.com",
      username: "Emily Rodriguez",
      profilePictureUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      teamId: 3,
      createdAt: new Date("2025-01-03T00:00:00.000Z"),
      updatedAt: new Date("2025-01-03T00:00:00.000Z"),
    },
    {
      userId: 4,
      cognitoId: "cognito4",
      email: "d.kim@company.com",
      username: "David Kim",
      profilePictureUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      teamId: 2,
      createdAt: new Date("2025-01-04T00:00:00.000Z"),
      updatedAt: new Date("2025-01-04T00:00:00.000Z"),
    }
  ];