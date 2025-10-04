import { Suspense } from "react";
import { TaskList } from "@/components/task-list";
import { AddTaskForm } from "@/components/add-task-form";
import { getTasks } from "@/lib/actions";

export default async function Home() {
  const tasks = await getTasks();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            My Tasks
          </h1>
          <p className="text-gray-600">Organize your tasks efficiently</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <AddTaskForm />
        </div>

        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList initialTasks={tasks} />
        </Suspense>
      </div>
    </main>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
