"use client";

import { useState } from "react";
import { TaskItem } from "./task-item";
import { Task } from "@/lib/api";

interface TaskListProps {
  initialTasks: Task[];
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredTasks = initialTasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const stats = {
    total: initialTasks.length,
    active: initialTasks.filter((t) => !t.completed).length,
    completed: initialTasks.filter((t) => t.completed).length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label={`All (${stats.total})`}
            />
            <FilterButton
              active={filter === "active"}
              onClick={() => setFilter("active")}
              label={`Active (${stats.active})`}
            />
            <FilterButton
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
              label={`Completed (${stats.completed})`}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
