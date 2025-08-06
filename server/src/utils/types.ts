export enum TeamMemberRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    VIEWER = "VIEWER",
}

export interface TaskNode {
  taskId: number;
  duration: number;
  degree: number;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCriticalPath: boolean;
  dependencies: number[];
  dependents: number[];
}

export interface TaskGraph {
  nodes: Map<number, TaskNode>;
  adjList: Map<number, number[]>;
  reverseAdjList: Map<number, number[]>;
}
