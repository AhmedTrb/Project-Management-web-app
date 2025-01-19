import React, { useState } from 'react'
import Modal from '../Modal';
import { useAppDispatch } from '@/app/redux';
import { useAppSelector } from '@/app/redux';
import { toggleModal } from '@/state';
import { Project, projectStatus } from '@/app/types/types';
import { formatISO } from 'date-fns';
import { useCreateProjectMutation } from '@/state/api';

type Props = {}

const ProjectModal = (props: Props) => {

    const [createProject, {isLoading, error}] = useCreateProjectMutation();

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<projectStatus>(projectStatus.PLANNING);

    const isModalOpen = useAppSelector((state) => state.global.isModalOpen);
  const dispatch = useAppDispatch();

    const isFormValid = () => {
        return projectName && projectDescription && startDate && endDate && status;
    }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectName || !projectDescription || !startDate || !endDate || !status) return;

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
      status: status
    }

    createProject(newProject);
    
  }

  const inputClasses = 'w-full rounded border border-gray-300 p-2 shadow-sm';

  return (
    <Modal title='Create New Project' isOpen={isModalOpen} onClose={() => dispatch(toggleModal())}>
        <div className='flex flex-col gap-4'>
          <form onSubmit={handleSubmit} className='mt-6 flex flex-col gap-4 items-center justify-center'>
            <input type="text" placeholder='Project Name' className={inputClasses} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <textarea placeholder='Project Description' className={inputClasses + ' h-20'} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
            <input type="date" placeholder='Start Date' className={inputClasses} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" placeholder='End Date' className={inputClasses} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <select className='mb-4 block w-full rounded border border-gray-300 px-3 py-2' value={status} onChange={(e) => setStatus(e.target.value as projectStatus)}>
              {Object.values(projectStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button type='submit' className={`w-full rounded bg-primary-600 text-white p-2 shadow-sm ${!isFormValid() ? 'opacity-40 cursor-not-allowed' : ''}`} disabled={!isFormValid()}>Create</button>
          </form>
        </div>
      </Modal>
  )
}

export default ProjectModal;

