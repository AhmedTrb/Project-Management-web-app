// TaskDetailsContent.tsx
import { useAppSelector } from "@/app/redux";
import { ClipboardList, Flag, Calendar } from "lucide-react";
import { formatDate } from "@/app/utils/date";
import { Status } from "../statusComponent";
import { PriorityComponent } from "../PriorityComponent";
import { Priority, Task } from "@/app/types/types";


export const TaskDetailsContent = () => {
  
const task = useAppSelector((state) => state.global.task);
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-secondary-950">
          {task?.title} :
        </h2>
        <p className="text-gray-800 text-md font-normal">
          {task?.description}
        </p>
      </div>

      <div className="flex items-center gap-2 text-secondary-950">
        <ClipboardList size={18} />
        <span className="font-medium">Status:</span>{" "}
        <Status status={task?.status as string} />
      </div>

      <div className="flex items-center gap-2 text-secondary-950">
        <Flag size={18} />
        <span className="font-medium">Priority:</span>
        <PriorityComponent priority={task?.priority as Priority} />
      </div>

      {task?.dueDate && (
        <div className="flex items-center gap-2 text-secondary-950">
          <Calendar size={18} />
          <span className="font-medium">Due Date:</span>{" "}
          {formatDate(task.dueDate)}
        </div>
      )}
    </div>
  );
};
