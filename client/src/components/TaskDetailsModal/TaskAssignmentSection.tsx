// TaskAssignmentSection.tsx
import { Avatar, AvatarGroup } from "@mui/material";
import { X } from "lucide-react";
import Select from "react-select";
import { useState } from "react";
import { useAppSelector } from "@/app/redux";
import { useAssignUserToTaskMutation, useGetUsersQuery } from "@/state/api";
import { Task } from "@/app/types/types";


interface selectedUserOptionValue {
  userId: string;
  label: string;
}
type ApiError = {
  data: {
    error: string;
  };
  error: string;
};


export const TaskAssignmentSection = () => {
  const { data: users } = useGetUsersQuery();
  const [selectedUsers, setSelectedUsers] = useState<selectedUserOptionValue[]>(
    []
  );
  const [assignTaskToUser, { isSuccess }] = useAssignUserToTaskMutation();
  const [error, setError] = useState("");
  const task = useAppSelector((state) => state.global.task);
  const handleAssignUsers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    try {
      await Promise.all(
        selectedUsers.map((user) =>
          assignTaskToUser({
            taskId: String(task?.id),
            userId: String(user.userId),
          }).unwrap()
        )
      );
      setSelectedUsers([]);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.data?.error || "Error assigning task to user");
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Assigned Users</h2>
      <div className="flex flex-col w-full gap-5">
        <div className="flex">
          <AvatarGroup max={task?.taskAssignments?.length || 0}>
            {task?.taskAssignments?.map((assign) => (
              <div className="relative" key={assign.userId}>
                <Avatar
                  alt={assign.user.username}
                  src={"https://avatar.iran.liara.run/public"}
                />
                <X
                  className="absolute text-secondary-950 top-0 right-0 cursor-pointer"
                  size={14}
                />
              </div>
            ))}
          </AvatarGroup>
        </div>
        <form onSubmit={handleAssignUsers} className="flex flex-col gap-2">
          <Select
            isMulti
            placeholder="assign users"
            classNamePrefix="select"
            className="basic-multi-select"
            value={selectedUsers.map((user) => ({
              value: user,
              label: user.label,
            }))}
            options={
              users
                ? users
                    .filter(
                      (u) =>
                        !task?.taskAssignments?.some(
                          (a) => a.userId === u.userId
                        )
                    )
                    .map((u) => ({
                      value: { userId: String(u.userId), label: u.username },
                      label: u.username,
                    }))
                : []
            }
            onChange={(selected) =>
              setSelectedUsers(selected?.map((o) => o.value) || [])
            }
          />
          {isSuccess && (
            <p className="text-green-400 bg-green-400 bg-opacity-10 w-full rounded p-2">
              Users assigned successfully
            </p>
          )}
          {error && (
            <p className="text-red-400 bg-red-400 bg-opacity-10 w-full rounded p-2">
              {error}
            </p>
          )}
          <button className="bg-primary-600 text-white px-3 py-1 rounded-md">
            Assign users
          </button>
        </form>
      </div>
    </div>
  );
};
