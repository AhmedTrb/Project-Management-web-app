import { useAppSelector } from "@/app/redux";
import { useState } from "react";
import { useAddCommentToTaskMutation, useGetTaskCommentsQuery } from "@/state/api";
import { formatRelativeDay } from "@/app/utils/date";

export const TaskCommentsSection = () => {
  
  const [commentText, setCommentText] = useState("");
    const [addComment, {isSuccess}] = useAddCommentToTaskMutation();

    const task = useAppSelector((state) => state.global.task);
    const {data:TaskComments, isLoading,error} = useGetTaskCommentsQuery({ taskId: String(task?.id) });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment({ taskId: String(task?.id), content: commentText.trim()});
    setCommentText("");
  };


  if (!task) return null;
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Comments</h2>
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {TaskComments?.map((comment) => (
          <div key={comment.id} className="p-2 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-800 font-medium">
              {comment.user.username}
            </p>
            <p className="text-sm text-gray-700">{comment.text}</p>
            <p className="text-xs text-gray-500 text-right">
              {formatRelativeDay(comment.createdAt)} 
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        <textarea
          rows={1}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-primary-500 "
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-primary-600 text-white px-3 py-1 rounded-md self-end disabled:opacity-70"
          disabled={!commentText.trim()}
        >
          Add Comment
        </button>

      </form>
    </div>
  );
};


