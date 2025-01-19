import React, { useState } from "react";
import Modal from "../Modal";
import { projectStatus, Task } from "@/app/types/types";
import { useCreateTaskMutation } from "@/state/api";
import { formatISO } from "date-fns";

type Props = {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function NewTaskModal({ projectId, isOpen, onClose }: Props) {
  const [createTask] = useCreateTaskMutation(); 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(!title || !description || !status || !priority || !tags || !startDate || !dueDate || !points || !assignedUserId) return;

    const formattedStartDate = formatISO(new Date(startDate), {
        representation: "complete",
    });
    const formattedDueDate = formatISO(new Date(dueDate), {
        representation: "complete",
    });

    const newTask: Partial<Task> = {
        title,
        description,
        status,
        priority,
        tags,
        startDate: new Date(formattedStartDate),
        dueDate: new Date(formattedDueDate),
    }

    createTask(newTask);
  };
  const inputClasses = "w-full rounded border border-gray-300 p-2 shadow-sm";
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new Task">
      <div className="flex flex-col gap-y-4">
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 items-center justify-center"
        >
          <input
            type="text"
            placeholder="Task Title"
            className={inputClasses}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Task Description"
            className={inputClasses + " h-20"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-between gap-x-2">
            <select
              className={inputClasses + " w-full"}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select
              className={inputClasses + " w-full"}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            className={inputClasses}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="flex justify-between gap-x-2">
            <input
              type="date"
              placeholder="Start Date"
              className={inputClasses}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              placeholder="Due Date"
              className={inputClasses}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <input
            type="number"
            placeholder="Story Points"
            className={inputClasses}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
          <input
            type="text"
            placeholder="Assigned User ID"
            className={inputClasses}
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          />
          <button
            type="submit"
            className="w-full rounded bg-primary-600 text-white p-2 shadow-sm hover:bg-primary-700"
          >
            Create Task
          </button>
        </form>
      </div>
    </Modal>
  );
}
