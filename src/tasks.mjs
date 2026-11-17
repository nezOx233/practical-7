import { randomUUID } from 'node:crypto';

export function createTaskStore() {
  const tasks = new Map();

  return {
    list() {
      return [...tasks.values()].map((task) => ({ ...task }));
    },
    add(title) {
      if (typeof title !== 'string' || !title.trim()) {
        const error = new Error('Назва завдання обов’язкова');
        error.code = 'TITLE_REQUIRED';
        throw error;
      }
      if (title.trim().length > 120) {
        const error = new Error('Максимум 120 символів');
        error.code = 'TITLE_TOO_LONG';
        throw error;
      }
      const task = { id: randomUUID(), title: title.trim(), completed: false };
      tasks.set(task.id, task);
      return { ...task };
    },
    update(id, completed) {
      const task = tasks.get(id);
      if (!task) return null;
      if (typeof completed !== 'boolean') {
        const error = new Error('completed має бути boolean');
        error.code = 'INVALID_COMPLETED';
        throw error;
      }
      const updated = { ...task, completed };
      tasks.set(id, updated);
      return { ...updated };
    },
    remove(id) {
      return tasks.delete(id);
    }
  };
}
