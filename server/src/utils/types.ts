export enum TeamMemberRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    VIEWER = "VIEWER",
}

export interface TaskNode {
  taskId: number;
  degree: number;
  duration: number;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCriticalPath?: boolean;
  dependencies: number[];
  dependents: number[];
}