export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  subtasks: SubTask[];
  estimatedMinutes?: number;
  timeSpentMinutes?: number;
  tags: string[];
  archived?: boolean;
  archivedAt?: string;
}

export type ViewMode = 'categories' | 'kanban' | 'list' | 'calendar' | 'analytics' | 'pomodoro' | 'inventory' | 'work';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  priority?: Priority;
  createdAt: string;
}

export interface WorkItem {
  id: string;
  value: number;
  category: string;
  createdAt: string;
}

export type ThemeMode = 'dark' | 'light' | 'cyberpunk';

export interface FilterOptions {
  searchQuery: string;
  status: string;
  priority: string;
  category: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
