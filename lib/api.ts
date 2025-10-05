import 'server-only';

const API_URL = process.env.API_URL;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export const api = {
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_URL}/tasks?_limit=10`, {
      cache: 'no-store',
    });
    
    if (!res.ok) throw new Error('Failed to fetch tasks');
    
    const data = await res.json();
    
    // Transform API response to include createdAt
    return data.data.map((task: any) => ({
      id: task.id.toString(),
      title: task.title,
      completed: task.completed,
      createdAt: new Date(task.created_at).toISOString(),
    }));
  },

  async createTask(title: string): Promise<Task> {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        completed: false,
        userId: 1,
      }),
    });

    if (!res.ok) throw new Error('Failed to create task');
    
    const resp = await res.json();
    const data = resp.data;
    return {
      id: data.id.toString(),
      title: data.title,
      completed: data.completed,
      createdAt: new Date(data?.created_at).toISOString(),
    };
  },

  async updateTask(id: string, completed: boolean): Promise<Task> {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete task');
  },
};