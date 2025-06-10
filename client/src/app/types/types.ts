export interface User {
  userId: number;
  email: string;
  username: string;
  password?: string ;
  googleId?: string;
  profilePictureUrl: string;
  createdAt: Date;
  updatedAt: Date;

  teams?: TeamMember[];
  attachments?: Attachment[];
  comments?: Comment[];
  assignedTasks?: Task[];      // relation "TaskAssignee"
  authoredTasks?: Task[];      // relation "TaskAuthor"
  taskAssignments?: TaskAssignment[];
}

export interface Team {
  id: number;
  teamName: string;
  createdAt: Date;
  updatedAt: Date;

  members?: TeamMember[];
  projects?: Project[];
}

export interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  joinedAt: Date;

  user: User;
  team: Team;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  teamId: number;
  team: Team;
  tasks?: Task[];

  bestCaseDuration?: number ;
  worstCaseDuration?: number ;
  expectedDuration?: number ;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string ;
  priority?: string;
  tags?: string;
  startDate?: Date ;
  dueDate?: Date ;
  points?: number ;
  projectId: number;
  authorUserId: number;
  assignedUserId?: number | null;
  createdAt: Date;
  updatedAt: Date;

  degree: number ;
  duration: number;

  earliestStart?: number;
  earliestFinish?: number;
  latestStart?: number;
  latestFinish?: number;
  slack?: number;
  isCriticalPath?: boolean;

  attachments?: Attachment[];
  comments?: Comment[];
  taskAssignments?: TaskAssignment[];
  dependencies?: number[];     
  dependents?: number[];     

  project: Project;
  author: User;
  assignee?: User | null;
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

  task: Task;
  user: User;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName?: string | null;
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
export interface Message {
  id: number;
  text: string;
  createdAt: Date;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  teamId: number;
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

  export enum TeamMemberRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    VIEWER = "VIEWER",
  }
  
export interface ApiError {
  data?: { error?: string };
  error?: string;
}