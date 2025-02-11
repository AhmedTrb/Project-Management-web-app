import React, { useState } from "react";
import Modal from "../Modal";
import Select from "react-select";
import { useAddTeamMemberMutation, useGetProjectByIdQuery, useGetUsersQuery } from "@/state/api";
import { TeamMemberRole, User } from "@/app/types/types";
import { useAppSelector } from "@/app/redux";
import { Trash } from "lucide-react";
import { useParams } from "next/navigation";


type Props = {
  isOpen: boolean;
  onClose: () => void;
};

interface userOption {
  user:User,
  role:TeamMemberRole
}

export default function InviteMemberModal({ isOpen, onClose }: Props) {
  const {id} = useParams();


  const {data:project, isLoading:isProjectLoading} = useGetProjectByIdQuery({projectId:String(id)});
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [selectedUsers, setSelectedUsers] = useState<userOption[]>([]);
  const [addTeamMember,{error:teamMemberError}] = useAddTeamMemberMutation();
  
  const currentUser = useAppSelector((state) => state.auth.user);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProjectLoading) return;
    for (const userOption of selectedUsers) {
      try {
        await addTeamMember({
          userId: String(userOption.user.userId),
          teamId: String(project?.teamId),
          role: userOption.role
        });

        if (teamMemberError) {
          setError(teamMemberError.data.message);
          setTimeout(() => setError(""), 5000);
        }
      } catch (err: any) {
        setError(err.message);
        setTimeout(() => setError(""), 5000);
        setError("");
      }
      
    }
    setSuccess(true);
    setSelectedUsers([]);
    setTimeout(() => setSuccess(false), 5000);

  };

  const inputClasses = "w-full rounded border border-gray-300 p-2 shadow-sm";

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
              users ? users.filter((user) => user.userId !== currentUser?.userId).map((user) => ({ value: user, label: user.username })) : []
            }
            onChange={(selected) =>
              setSelectedUsers(
                selected ? selected.map((option) => ({
                  user: option.value,
                  role: TeamMemberRole.OWNER
                })) : []
              )
            }
          />

          {selectedUsers.length > 0 &&
            selectedUsers.map((userOption) => (
              <div key={userOption.user.userId} className="flex justify-between items-center gap-2">
                <div className="flex gap-2  w-full justify-between items-center">
                  <div className="text-sm text-secondary-950">{userOption.user.username}</div>
                  <select
                    className="block w-28 rounded border border-gray-300 px-3 py-1 "
                    value={selectedUsers.find((u) => u.user.userId === userOption.user.userId)?.role}
                    onChange={(e) => setSelectedUsers(selectedUsers.map(u => 
                      u.user.userId === userOption.user.userId 
                      ? { ...u, role: e.target.value as TeamMemberRole }
                      : u
                    ))}
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
                      selectedUsers.filter((u) => u.user.userId !== userOption.user.userId)
                    )
                  }
                  className="text-red-600 bg-opacity-10 bg-red-500 px-2 py-1 rounded flex justify-center items-center gap-2"
                >
                <Trash className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}

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
              isLoading ? "opacity-40 cursor-not-allowed" : ""
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
