import React, { useState } from "react";
import Modal from "../Modal";
import { useAppDispatch } from "@/app/redux";
import { useAppSelector } from "@/app/redux";
import { toggleModal } from "@/state/globalSlice";
import { Project, projectStatus } from "@/app/types/types";
import { formatISO } from "date-fns";
import { useCreateProjectMutation } from "@/state/api";

const ProjectModal = () => {
  const [createProject] = useCreateProjectMutation();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<projectStatus>(projectStatus.PLANNING);
  const [success, setSuccess] = useState(false);
  const isModalOpen = useAppSelector((state) => state.global.isModalOpen);
  const dispatch = useAppDispatch();

  const isFormValid = () => {
    return projectName && projectDescription && startDate && endDate && status;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !projectName ||
      !projectDescription ||
      !startDate ||
      !endDate ||
      !status
    )
      return;

    const formattedStartDate = formatISO(new Date(startDate), {
      representation: "complete",
    });
    const formattedEndDate = formatISO(new Date(endDate), {
      representation: "complete",
    });

    const newProject: Partial<Project> = {
      name: projectName,
      description: projectDescription,
      startDate: new Date(formattedStartDate),
      endDate: new Date(formattedEndDate),
      status: status,
    };

    await createProject(newProject);
    setSuccess(true);
    setProjectName("");
    setProjectDescription("");
    setStartDate("");
    setEndDate("");
    setStatus(projectStatus.PLANNING);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  const inputClasses = "w-full rounded border border-gray-300 p-2 shadow-sm";

  return (
    <Modal
      title="Create New Project"
      isOpen={isModalOpen}
      onClose={() => dispatch(toggleModal())}
    >
      <div className="flex flex-col gap-4">
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 items-center justify-center"
        >
          <div className="w-full flex flex-col">
          <label htmlFor="projectName">Project Name</label>
          <input
            type="text"
            placeholder="Project Name"
            className={inputClasses}
            value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col">
            <label htmlFor="projectDescription">Project Description</label>
            <textarea
            placeholder="Project Description"
            className={inputClasses + " h-20"}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          </div>
          <div className="w-full flex flex-col">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
              placeholder="Start Date"
              className={inputClasses}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
            placeholder="End Date"
            className={inputClasses}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col">
            <label htmlFor="status">Status</label>
            <select
              className="mb-4 block w-full rounded border border-gray-300 px-3 py-2"
              value={status}
            onChange={(e) => setStatus(e.target.value as projectStatus)}
          >
            {Object.values(projectStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
            </select>
          </div>
          {success && <div className="text-green-500 bg-green-500 bg-opacity-15 p-2 w-full rounded">Project created successfully!</div>}
          <button
            type="submit"
            className={`w-full rounded bg-primary-600 text-white p-2 shadow-sm ${
              !isFormValid() ? "opacity-40 cursor-not-allowed" : ""
            }`}
            disabled={!isFormValid()}
          >
            Create
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default ProjectModal;
