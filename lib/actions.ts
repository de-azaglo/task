'use server';

import { revalidatePath } from 'next/cache';
import { api } from './api';

export async function getTasks() {
  return await api.getTasks();
}

export async function createTask(action: any, formData: FormData) {
  const title = formData.get('title') as string;
  
  if (!title || title.trim().length === 0) {
    return { error: 'Title is required' };
  }

  try {
    await api.createTask(title.trim());
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create task' };
  }
}

export async function updateTask(id: string, completed: boolean) {
  try {
    await api.updateTask(id, completed);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update task' };
  }
}

export async function deleteTask(id: string) {
  try {
    await api.deleteTask(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete task' };
  }
}
