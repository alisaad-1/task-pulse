import { Task, Category } from '../types/task';

const TASKS_STORAGE_KEY = 'taskpulse_tasks_v1';
const THEME_STORAGE_KEY = 'taskpulse_theme';
const ACCENT_STORAGE_KEY = 'taskpulse_accent';
const CATEGORIES_STORAGE_KEY = 'taskpulse_categories';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work & Projects', color: '#8b5cf6', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal Life', color: '#ec4899', icon: 'User' },
  { id: 'health', name: 'Health & Fitness', color: '#10b981', icon: 'Heart' },
  { id: 'finance', name: 'Finance & Growth', color: '#f59e0b', icon: 'DollarSign' }
];

export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design Dark Glassmorphism UI Components',
    description: 'Create reusable glass panel components, CSS variables for glowing accents, and high-contrast typography.',
    status: 'done',
    priority: 'high',
    category: 'work',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-1', title: 'Define HSL color palette', completed: true },
      { id: 'st-2', title: 'Configure backdrop-filter blur', completed: true },
      { id: 'st-3', title: 'Test responsive viewports', completed: true }
    ],
    estimatedMinutes: 120,
    timeSpentMinutes: 110,
    tags: ['UI/UX', 'CSS', 'Design']
  },
  {
    id: 'task-2',
    title: 'Implement Pomodoro Timer & Sound FX',
    description: 'Integrate Web Audio API sound synthesizer with focus session countdown and auto break cycles.',
    status: 'in-progress',
    priority: 'urgent',
    category: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-4', title: 'Build Web Audio synthesis', completed: true },
      { id: 'st-5', title: 'Connect timer controls to active task', completed: false },
      { id: 'st-6', title: 'Add ticking sound toggle', completed: false }
    ],
    estimatedMinutes: 90,
    timeSpentMinutes: 45,
    tags: ['Audio', 'React', 'Productivity']
  },
  {
    id: 'task-3',
    title: 'Weekly Fitness & Strength Routine',
    description: 'Complete 45-minute HIIT cardio and strength session followed by mobility stretches.',
    status: 'todo',
    priority: 'medium',
    category: 'health',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-7', title: 'Warmup mobility exercises', completed: true },
      { id: 'st-8', title: 'Core & kettlebell circuit', completed: false }
    ],
    estimatedMinutes: 45,
    timeSpentMinutes: 0,
    tags: ['Health', 'Fitness']
  },
  {
    id: 'task-4',
    title: 'Monthly Budget & Subscription Review',
    description: 'Audit recurring cloud services, SaaS tools, and monthly expenses to optimize budget allocation.',
    status: 'backlog',
    priority: 'low',
    category: 'finance',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-9', title: 'Download bank statements', completed: false },
      { id: 'st-10', title: 'Cancel unused subscriptions', completed: false }
    ],
    estimatedMinutes: 60,
    timeSpentMinutes: 0,
    tags: ['Finance', 'Audit']
  }
];

export const loadStoredTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TASKS));
      return INITIAL_SAMPLE_TASKS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load tasks from localStorage:', err);
    return INITIAL_SAMPLE_TASKS;
  }
};

export const saveStoredTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
};

export const exportTasksJSON = (tasks: Task[]): void => {
  const jsonStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importTasksJSON = (file: File): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error('Invalid file format. Expected JSON array of tasks.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};
