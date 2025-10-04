"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createTask } from "@/lib/actions";
import { useEffect, useRef } from "react";

export function AddTaskForm() {
  const [state, formAction] = useFormState(createTask, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-3">
      <input
        type="text"
        name="title"
        placeholder="Add a new task..."
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        required
      />
      <SubmitButton />
      {state?.error && (
        <p className="text-red-500 text-sm mt-2">{state.error}</p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Adding..." : "Add"}
    </button>
  );
}
