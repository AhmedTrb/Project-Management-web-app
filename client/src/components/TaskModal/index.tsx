import React, { useState } from "react";
import Modal from "../Modal";
import { Priority,Task, TaskStatus } from "@/app/types/types";
import { useCreateTaskMutation, useGetProjectTasksQuery } from "@/state/api";

import Select from 'react-select';


type Props = {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function NewTaskModal({ projectId, isOpen, onClose }: Props) {
  // state variables
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState("");
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // api calls
  const [createTask, {isLoading, error}] = useCreateTaskMutation(); 
  const { data: tasks } = useGetProjectTasksQuery({projectId: projectId});

  const taskOptions = tasks?.map((task) => ({
    value: task.id,
    label: task.title,
  }));

  const isFormValid = () => {
    return title && description && status && priority && tags && startDate && dueDate && points;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate required fields
    if (
      !title ||
      !description ||
      !status ||
      !priority ||
      !tags ||
      !startDate ||
      !dueDate ||
      !points ||
      !projectId
    ) {
      alert("Please fill in all the required fields.");
      return;
    }
  
    try {
      // Format dates
      const formattedStartDate = new Date(startDate);
      const formattedDueDate = new Date(dueDate);

      // Prepare dependencies (list of prerequisite task IDs)
      const taskDependencies= dependencies.map((dependency) => parseInt(dependency));
      // Prepare the task object
      const newTask: Partial<Task> = {
        title,
        description,
        status: status as TaskStatus,
        priority,
        tags,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        points: parseInt(points),
        projectId: parseInt(projectId),
        dependencies: taskDependencies,
      };
  
      
      
  
      // Send the task creation request to the backend
      await createTask(newTask);
      
      // clear the form
      setTitle("");
      setDescription("");
      setStatus(TaskStatus.TODO);
      setPriority(Priority.MEDIUM);
      setTags("");
      setStartDate("");
      setDueDate("");
      setPoints("");
      setDependencies([]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating task:", error.message);
      setSuccess(false);
    }
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
          <div className="flex justify-between w-full gap-x-2">
            <select
              className={inputClasses}
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value={TaskStatus.TODO}>{TaskStatus.TODO}</option>
              <option value={TaskStatus.IN_PROGRESS}>{TaskStatus.IN_PROGRESS}</option>
              <option value={TaskStatus.COMPLETED}>{TaskStatus.COMPLETED}</option>
              <option value={TaskStatus.UNDER_REVIEW}>{TaskStatus.UNDER_REVIEW}</option>
            </select>
            <select
              className={inputClasses}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value={Priority.LOW}>{Priority.LOW}</option>
              <option value={Priority.MEDIUM}>{Priority.MEDIUM}</option>
              <option value={Priority.HIGH}>{Priority.HIGH}</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            className={inputClasses}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="flex justify-between gap-x-2 w-full">
            <div className="flex flex-col gap-y-2">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              placeholder="Start Date"
              className={inputClasses}
              value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
              placeholder="Due Date"
              className={inputClasses}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            </div>
          </div>
          <input
            type="number"
            placeholder="Story Points"
            className={inputClasses}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
          <div className="w-full">
            <Select
              isMulti
              name="dependencies"
              options={taskOptions ? taskOptions : [{value: 0, label: "no tasks"}]}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select Dependencies"
              onChange={(selected: any) => 
                setDependencies(selected ? selected.map((option: { value: string }) => option.value) : [])
              }
            />
          </div>
          {error && <div className="text-red-500 bg-red-500 bg-opacity-15 p-2 w-full rounded">Error: creating task</div>}
          {success && <div className="text-green-500 bg-green-500 bg-opacity-15 p-2 w-full rounded">Task created successfully!</div>}
          <button type='submit' className={`w-full rounded bg-primary-600 text-white p-2 shadow-sm  ${(isLoading || !isFormValid()) ? 'opacity-40 cursor-not-allowed' : ''}`} disabled={isLoading || !isFormValid()}>Create New Task</button>
        </form>
      </div>
    </Modal>
  );
}

