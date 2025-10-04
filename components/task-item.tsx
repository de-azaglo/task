"use client";

import { useState, useTransition } from "react";
import { updateTask, deleteTask } from "@/lib/actions";
import { Task } from "@/lib/api";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      await updateTask(task.id, !task.completed);
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      await deleteTask(task.id);
    });
  };

  const formattedDate = new Date(task.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          type="button"
          disabled={isPending || isDeleting}
          className="mt-1 flex-shrink-0"
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              task.completed
                ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-600"
                : "border-gray-300 hover:border-purple-600"
            }`}
          >
            {task.completed && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <title>Checkmark</title>
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-medium mb-1 ${
              task.completed ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {task.title}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <title>Clock icon</title>
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {formattedDate}
          </p>
        </div>

        <button
          onClick={handleDelete}
          type="button"
          disabled={isPending || isDeleting}
          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          aria-label="Delete task"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>Delete icon</title>
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
