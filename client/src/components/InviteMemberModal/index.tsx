import React, { useState } from "react";
import Modal from "../Modal";
import Select from "react-select";
import {
  useAddTeamMemberMutation,
  useGetProjectByIdQuery,
  useGetProjectTeamMembersQuery,
  useGetUsersQuery,
} from "@/state/api";
import { ApiError, TeamMemberRole, User } from "@/app/types/types";
import { useAppSelector } from "@/app/redux";
import { Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { Avatar } from "@mui/material";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

interface userOption {
  user: User;
  role: TeamMemberRole;
}

export default function InviteMemberModal({ isOpen, onClose }: Props) {
  const { id } = useParams();

  const { data: project, isLoading: isProjectLoading } = useGetProjectByIdQuery(
    { projectId: String(id) }
  );
  const { data: projectTeamMembers } = useGetProjectTeamMembersQuery({
    projectId: String(id),
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data: users, isLoading } = useGetUsersQuery();
  const [selectedUsers, setSelectedUsers] = useState<userOption[]>([]);
  const [addTeamMember, { error: teamMemberError }] =
    useAddTeamMemberMutation();

  const currentUser = useAppSelector((state) => state.auth.user);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProjectLoading) return;
    for (const userOption of selectedUsers) {
      try {
        await addTeamMember({
          userId: String(userOption.user.userId),
          teamId: String(project?.teamId),
          role: userOption.role,
        });

        if (teamMemberError) {
          setError(teamMemberError.data.message);
          setTimeout(() => setError(""), 5000);
        }
      } catch (err: unknown) {
        const error  = err as ApiError;
        setError(error.data?.error || "An error occurred");
        setTimeout(() => setError(""), 5000);
        setError("");
      }
    }
    setSuccess(true);
    setSelectedUsers([]);
    setTimeout(() => setSuccess(false), 5000);
  };
  const getRoleBadgeColors = (role: string): string => {
    switch (role) {
      case TeamMemberRole.OWNER:
        return "bg-primary-600 text-primary-600 bg-opacity-20";
      case TeamMemberRole.ADMIN:
        return "bg-orange-500 text-orange-500 bg-opacity-20";
      default:
        return "bg-gray-400 text-gray-400 bg-opacity-20";
    }
  };
  

  return (
    <Modal title="Invite Member" isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-y-4 p-4">
        {/* Added padding */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            isMulti
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select User"
            value={selectedUsers.map((user) => ({
              value: user.user,
              label: user.user.username,
            }))}
            options={
              users
                ? users
                    .filter(
                      (user) =>
                        user.userId !== currentUser?.userId &&
                        !projectTeamMembers?.some(
                          (teamMember) => teamMember.userId === user.userId
                        )
                    )
                    .map((user) => ({ value: user, label: user.username }))
                : []
            }
            onChange={(selected) =>
              setSelectedUsers(
                selected
                  ? selected.map((option) => ({
                      user: option.value,
                      role: TeamMemberRole.OWNER,
                    }))
                  : []
              )
            }
          />

          {selectedUsers.length > 0 &&
            selectedUsers.map((userOption) => (
              <div
                key={userOption.user.userId}
                className="flex justify-between items-center gap-2"
              >
                <div className="flex gap-2  w-full justify-between items-center">
                  <div className="text-sm text-secondary-950">
                    {userOption.user.username}
                  </div>
                  <select
                    className="block w-28 rounded border border-gray-300 px-3 py-1 "
                    value={
                      selectedUsers.find(
                        (u) => u.user.userId === userOption.user.userId
                      )?.role
                    }
                    onChange={(e) =>
                      setSelectedUsers(
                        selectedUsers.map((u) =>
                          u.user.userId === userOption.user.userId
                            ? { ...u, role: e.target.value as TeamMemberRole }
                            : u
                        )
                      )
                    }
                  >
                    {Object.values(TeamMemberRole).map((role) => (
                      <option key={role} value={role} className="text-sm ">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedUsers(
                      selectedUsers.filter(
                        (u) => u.user.userId !== userOption.user.userId
                      )
                    )
                  }
                  className="text-red-600 bg-opacity-10 bg-red-500 px-2 py-1 rounded flex justify-center items-center gap-2"
                >
                  <Trash className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}

          {/* Team members */}
          <div className="flex flex-col gap-y-2">
            <div className="text-sms text-secondary-950">Team Members</div>
            <div className="flex flex-col gap-y-2">
              {projectTeamMembers &&
                projectTeamMembers?.map((teamMember) => (
                  <div
                    key={teamMember.user.userId}
                    className="flex items-center justify-between w-1/2"
                  >
                    <div className="flex items-center gap-x-4">
                    <Avatar
                      key={teamMember.user.userId}
                      src={teamMember.user.profilePictureUrl}
                      alt={teamMember.user.username}
                      className="w-4 h-4"
                    />

                    <div className="text-sm text-secondary-950">
                      {teamMember.user.username}
                    </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full bg-opacity-10 text-xs font-medium ${getRoleBadgeColors(
                        teamMember.role
                      )}`}
                    >
                      {teamMember.role}
                    </span>
                  </div>
                ))}
              {!projectTeamMembers && (
                <div className="text-sm text-secondary-950">
                  No team members
                </div>
              )}
            </div>
          </div>

          {/* Error handling  */}
          {error && (
            <div className="text-red-500 bg-red-500 bg-opacity-15 p-2 w-full rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-500 bg-green-500 bg-opacity-15 p-2 w-full rounded">
              Member invited successfully!
            </div>
          )}

          <button
            type="submit"
            className={`w-full rounded text-lg bg-primary-600 text-white p-2 shadow-sm ${
              isLoading && selectedUsers.length === 0 ? "opacity-40 cursor-not-allowed" : ""
            }`}
            disabled={isLoading || selectedUsers.length === 0}
          >
            Add Members
          </button>
        </form>
      </div>
    </Modal>
  );
}
